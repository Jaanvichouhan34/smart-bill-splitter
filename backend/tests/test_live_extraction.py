import os
import sys
import asyncio
import json

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.extraction import extraction_service


import pytest

@pytest.mark.asyncio
async def test_live_samples():
    samples_dir = os.path.join(os.path.dirname(__file__), "samples")
    sample_files = [
        "sample_receipt_cafe.png",
        "sample_receipt_restaurant.png",
        "sample_receipt_grocery.png"
    ]

    print("=" * 60)
    print("Testing Live Vision Extraction with Groq / Gemini")
    print(f"Provider: {extraction_service.preferred_provider}")
    print("=" * 60)

    for filename in sample_files:
        image_path = os.path.join(samples_dir, filename)
        if not os.path.exists(image_path):
            print(f"Skipping {filename} (not found)")
            continue

        print(f"\n--- Extracting {filename} ---")
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        try:
            result = await extraction_service.extract_bill(
                image_bytes=image_bytes,
                mime_type="image/png"
            )

            print("Extracted Result:")
            print(f"Currency: {result.currency}")
            print(f"Subtotal: {result.subtotal}")
            print(f"Tax: {result.tax}")
            print(f"Service Charge: {result.service_charge}")
            print(f"Discount: {result.discount}")
            print(f"Total: {result.total}")
            print(f"Overall Confidence: {result.confidence_overall}")
            print("Line Items:")
            for item in result.items:
                print(f"  - [{item.id}] {item.quantity}x {item.name} @ {item.unit_price} = {item.total_price} (conf: {item.confidence})")

            # Check that item IDs and non-null values match
            assert len(result.items) > 0, "No items extracted!"
            assert all(item.id.startswith("item_") or len(item.id) > 0 for item in result.items), "Item ID format invalid!"
            print(f"SUCCESS: {filename} extracted and validated.")

        except Exception as e:
            print(f"FAILED for {filename}: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(test_live_samples())
