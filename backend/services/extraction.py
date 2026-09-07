import os
import json
import re
import base64
import logging
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from models import BillExtraction, LineItem

# Load environment variables
load_dotenv()

logger = logging.getLogger("bill_extraction")
logger.setLevel(logging.INFO)

SYSTEM_PROMPT = """You are an expert OCR and financial data extraction AI specialized in reading bills, restaurant checks, and grocery receipts.

Analyze the uploaded receipt image carefully and extract all information into a strictly structured JSON format matching the schema below.

JSON Schema format:
{
  "items": [
    {
      "id": "item_1",
      "name": "Item description/dish name",
      "quantity": 1.0,
      "unit_price": 100.0,
      "total_price": 100.0,
      "confidence": 0.98
    }
  ],
  "subtotal": 100.0,
  "tax": 5.0,
  "service_charge": 0.0,
  "tip": 0.0,
  "discount": 0.0,
  "total": 105.0,
  "currency": "INR",
  "confidence_overall": 0.95
}

Extraction Rules:
1. "items": List all individual purchased items. For each item:
   - "id": Assign a sequential unique ID string starting with "item_1", "item_2", "item_3", etc.
   - "name": Clean item title (omit stray symbols or printer artifacts).
   - "quantity": Number of units purchased (default to 1.0 if not specified; support decimals like 0.5 kg).
   - "unit_price": Price per single unit (if not explicit, calculate total_price / quantity).
   - "total_price": Total line price for this item.
   - "confidence": Float between 0.0 and 1.0 reflecting how clearly legible the item name and price are.
2. "subtotal": Sum of all line item totals before taxes/discounts.
3. "tax": Sum of all taxes (GST, CGST, SGST, VAT, Sales Tax). If none, 0.0.
4. "service_charge": Any restaurant service fee, packaging charge, or delivery charge. If none, 0.0.
5. "tip": Any gratuity or tip added. If none, 0.0.
6. "discount": Any promotional discount or voucher deducted. If none, 0.0.
7. "total": Grand total payable amount.
8. "currency": Auto-detect currency code (e.g., "INR", "USD", "EUR", "GBP", "CAD"). Default to "INR" if unspecified or symbol like '₹' / 'Rs' is found.
9. "confidence_overall": Overall extraction confidence (0.0 to 1.0) based on receipt image quality, lighting, and readability.

CRITICAL: Return ONLY valid, parseable JSON matching the required schema. Do not include extra conversational text.
"""


def clean_json_string(text: str) -> str:
    """
    Remove markdown code block wraps and trim whitespace from LLM output.
    """
    cleaned = text.strip()
    if "```" in cleaned:
        # Match ```json ... ``` or ``` ... ```
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
        if match:
            cleaned = match.group(1).strip()
        else:
            cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
            cleaned = re.sub(r"```$", "", cleaned).strip()
    
    # In case there is text before or after the outer json braces {}
    start_brace = cleaned.find("{")
    end_brace = cleaned.rfind("}")
    if start_brace != -1 and end_brace != -1 and end_brace > start_brace:
        cleaned = cleaned[start_brace:end_brace + 1]

    return cleaned


def normalize_and_validate_extraction(raw_data: Dict[str, Any]) -> BillExtraction:
    """
    Post-process, normalize item IDs, fix missing values, and validate with Pydantic.
    """
    items_raw = raw_data.get("items", [])
    normalized_items: List[LineItem] = []
    
    subtotal_calc = 0.0

    for idx, item in enumerate(items_raw, start=1):
        if not isinstance(item, dict):
            continue
            
        item_id = item.get("id") or f"item_{idx}"
        name = str(item.get("name", f"Item {idx}")).strip() or f"Item {idx}"
        
        try:
            quantity = float(item.get("quantity", 1.0))
            if quantity <= 0:
                quantity = 1.0
        except (ValueError, TypeError):
            quantity = 1.0

        try:
            total_price = float(item.get("total_price", 0.0))
        except (ValueError, TypeError):
            total_price = 0.0

        try:
            unit_price = float(item.get("unit_price", total_price / quantity if quantity else total_price))
        except (ValueError, TypeError):
            unit_price = total_price / quantity if quantity else total_price

        try:
            confidence = float(item.get("confidence", 1.0))
            confidence = max(0.0, min(1.0, confidence))
        except (ValueError, TypeError):
            confidence = 0.95

        subtotal_calc += total_price

        normalized_items.append(
            LineItem(
                id=item_id,
                name=name,
                quantity=quantity,
                unit_price=round(unit_price, 2),
                total_price=round(total_price, 2),
                confidence=round(confidence, 2)
            )
        )

    # Validate numbers
    def parse_float(val, default=0.0):
        try:
            return float(val) if val is not None else default
        except (ValueError, TypeError):
            return default

    subtotal = parse_float(raw_data.get("subtotal"), subtotal_calc)
    tax = parse_float(raw_data.get("tax"), 0.0)
    service_charge = parse_float(raw_data.get("service_charge"), 0.0)
    tip = parse_float(raw_data.get("tip"), 0.0)
    discount = parse_float(raw_data.get("discount"), 0.0)
    
    expected_total = subtotal + tax + service_charge + tip - discount
    total = parse_float(raw_data.get("total"), expected_total)
    
    currency = str(raw_data.get("currency", "INR")).strip().upper() or "INR"
    # Normalize common currency representations
    if currency in ["RS", "RS.", "RUPEES", "₹"]:
        currency = "INR"
    elif currency == "$":
        currency = "USD"
    elif currency == "€":
        currency = "EUR"
    elif currency == "£":
        currency = "GBP"

    confidence_overall = max(0.0, min(1.0, parse_float(raw_data.get("confidence_overall"), 0.95)))

    return BillExtraction(
        items=normalized_items,
        subtotal=round(subtotal, 2),
        tax=round(tax, 2),
        service_charge=round(service_charge, 2),
        tip=round(tip, 2),
        discount=round(discount, 2),
        total=round(total, 2),
        currency=currency,
        confidence_overall=round(confidence_overall, 2)
    )


class ExtractionService:
    """
    Vision LLM Extraction Service supporting Google Gemini and Groq Vision APIs.
    """

    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.preferred_provider = os.getenv("EXTRACTION_PROVIDER", "gemini").strip().lower()

    def is_configured(self) -> bool:
        """Returns True if at least one vision provider is configured."""
        return bool(self.gemini_api_key or self.groq_api_key)

    async def extract_bill(self, image_bytes: bytes, mime_type: str) -> BillExtraction:
        """
        Extract structured receipt data from image bytes.
        """
        if not image_bytes:
            raise ValueError("Empty image content provided.")

        provider = self.preferred_provider

        # Auto-detect available provider if preferred is missing
        if provider == "gemini" and not self.gemini_api_key and self.groq_api_key:
            provider = "groq"
        elif provider == "groq" and not self.groq_api_key and self.gemini_api_key:
            provider = "gemini"

        if provider == "gemini":
            if not self.gemini_api_key:
                raise ValueError("GEMINI_API_KEY is not set. Please set it in backend/.env or environment variables.")
            return await self._extract_with_gemini(image_bytes, mime_type)
        elif provider == "groq":
            if not self.groq_api_key:
                raise ValueError("GROQ_API_KEY is not set. Please set it in backend/.env or environment variables.")
            return await self._extract_with_groq(image_bytes, mime_type)
        else:
            raise ValueError(f"Unknown or unconfigured extraction provider: '{provider}'. Supported providers: gemini, groq.")

    async def _extract_with_gemini(self, image_bytes: bytes, mime_type: str) -> BillExtraction:
        """
        Extract using Google Gemini Vision (supporting google-genai or google-generativeai).
        """
        # Try new google-genai SDK first
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.gemini_api_key)
            
            # Try latest gemini models
            for model_name in ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=[
                            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                            SYSTEM_PROMPT
                        ],
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            temperature=0.1,
                        )
                    )
                    raw_text = response.text
                    if raw_text:
                        cleaned = clean_json_string(raw_text)
                        parsed_json = json.loads(cleaned)
                        return normalize_and_validate_extraction(parsed_json)
                except Exception as e:
                    logger.warning(f"Failed with Gemini model {model_name}: {e}")
                    continue

        except ImportError:
            logger.info("google-genai not found, attempting google-generativeai fallback...")
        except Exception as e:
            logger.warning(f"google-genai call failed ({e}), attempting google-generativeai fallback...")

        # Fallback to google.generativeai
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=self.gemini_api_key)

            model = legacy_genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config={"response_mime_type": "application/json", "temperature": 0.1}
            )

            response = model.generate_content([
                {"mime_type": mime_type, "data": image_bytes},
                SYSTEM_PROMPT
            ])

            raw_text = response.text
            if not raw_text:
                raise ValueError("Empty response received from Gemini Vision model.")

            cleaned = clean_json_string(raw_text)
            parsed_json = json.loads(cleaned)
            return normalize_and_validate_extraction(parsed_json)

        except Exception as e:
            logger.error(f"Gemini extraction failed: {str(e)}")
            raise RuntimeError(f"Gemini Vision extraction failed: {str(e)}")

    async def _extract_with_groq(self, image_bytes: bytes, mime_type: str) -> BillExtraction:
        """
        Extract using Groq Vision (e.g. qwen/qwen3.8-27b, qwen/qwen3.6-27b).
        """
        try:
            from groq import Groq

            client = Groq(api_key=self.groq_api_key)
            base64_img = base64.b64encode(image_bytes).decode("utf-8")
            image_url = f"data:{mime_type};base64,{base64_img}"

            # Supported active vision models on Groq
            vision_models = ["qwen/qwen3.8-27b", "qwen/qwen3.6-27b"]

            last_error = None
            for model_name in vision_models:
                try:
                    completion = client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": SYSTEM_PROMPT},
                                    {"type": "image_url", "image_url": {"url": image_url}}
                                ]
                            }
                        ],
                        temperature=0.1
                    )

                    raw_text = completion.choices[0].message.content
                    if not raw_text:
                        raise ValueError(f"Empty response received from Groq Vision model {model_name}.")

                    cleaned = clean_json_string(raw_text)
                    parsed_json = json.loads(cleaned)
                    return normalize_and_validate_extraction(parsed_json)
                except Exception as ex:
                    logger.warning(f"Groq vision attempt failed with {model_name}: {ex}")
                    last_error = ex
                    continue

            raise last_error or RuntimeError("All Groq vision models failed.")

        except Exception as e:
            logger.error(f"Groq extraction failed: {str(e)}")
            raise RuntimeError(f"Groq Vision extraction failed: {str(e)}")


# Singleton instance
extraction_service = ExtractionService()
