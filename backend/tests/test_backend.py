import io
import os
import sys
import pytest
from unittest.mock import AsyncMock, patch

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app
from models import LineItem, BillExtraction, ErrorResponse
from services.extraction import clean_json_string, normalize_and_validate_extraction

client = TestClient(app)


# ==========================================
# 1. Model & Pydantic Validation Tests
# ==========================================

def test_line_item_model_valid():
    item = LineItem(
        id="item_1",
        name="Butter Chicken",
        quantity=2.0,
        unit_price=350.0,
        total_price=700.0,
        confidence=0.98
    )
    assert item.id == "item_1"
    assert item.name == "Butter Chicken"
    assert item.quantity == 2.0
    assert item.unit_price == 350.0
    assert item.total_price == 700.0
    assert item.confidence == 0.98


def test_line_item_fractional_quantity():
    item = LineItem(
        id="item_2",
        name="Organic Apples",
        quantity=1.75,
        unit_price=120.0,
        total_price=210.0,
        confidence=0.92
    )
    assert item.quantity == 1.75


def test_bill_extraction_model_valid():
    bill = BillExtraction(
        items=[
            LineItem(
                id="item_1",
                name="Cappuccino",
                quantity=2.0,
                unit_price=220.0,
                total_price=440.0,
                confidence=0.95
            ),
            LineItem(
                id="item_2",
                name="Croissant",
                quantity=1.0,
                unit_price=180.0,
                total_price=180.0,
                confidence=0.99
            )
        ],
        subtotal=620.0,
        tax=31.0,
        service_charge=31.0,
        tip=0.0,
        discount=0.0,
        total=682.0,
        currency="INR",
        confidence_overall=0.96
    )
    assert len(bill.items) == 2
    assert bill.subtotal == 620.0
    assert bill.tax == 31.0
    assert bill.total == 682.0
    assert bill.currency == "INR"
    assert bill.confidence_overall == 0.96


# ==========================================
# 2. Extraction Normalizer & Cleaner Tests
# ==========================================

def test_clean_json_string():
    raw_markdown = '```json\n{"subtotal": 100.0, "total": 100.0}\n```'
    cleaned = clean_json_string(raw_markdown)
    assert cleaned == '{"subtotal": 100.0, "total": 100.0}'

    plain_json = '{"subtotal": 100.0, "total": 100.0}'
    assert clean_json_string(plain_json) == plain_json


def test_normalize_and_validate_extraction():
    raw_data = {
        "items": [
            {
                "name": "Paneer Tikka",
                "quantity": 2,
                "unit_price": 250,
                "total_price": 500,
                "confidence": 0.95
            },
            {
                "id": "custom_id_2",
                "name": "Garlic Naan",
                "quantity": 4,
                "unit_price": 60,
                "total_price": 240,
                "confidence": 1.2  # Should clamp to 1.0
            }
        ],
        "subtotal": 740.0,
        "tax": 37.0,
        "total": 777.0,
        "currency": "₹"
    }

    result = normalize_and_validate_extraction(raw_data)
    assert len(result.items) == 2
    assert result.items[0].id == "item_1"
    assert result.items[1].id == "custom_id_2"
    assert result.items[1].confidence == 1.0  # Clamped
    assert result.currency == "INR"
    assert result.total == 777.0


# ==========================================
# 3. FastAPI Route & Middleware Tests
# ==========================================

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "DigiValet - Bill Splitting API"
    assert data["status"] == "online"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "provider" in data


def test_extract_bill_no_file():
    response = client.post("/extract-bill")
    assert response.status_code in [400, 422]


def test_extract_bill_invalid_mime_type():
    file_payload = {"file": ("test.txt", io.BytesIO(b"Hello world"), "text/plain")}
    response = client.post("/extract-bill", files=file_payload)
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_extract_bill_empty_image():
    file_payload = {"file": ("empty.png", io.BytesIO(b""), "image/png")}
    response = client.post("/extract-bill", files=file_payload)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_extract_bill_success_mock():
    mock_bill = BillExtraction(
        items=[
            LineItem(
                id="item_1",
                name="Cold Brew Coffee",
                quantity=1.0,
                unit_price=200.0,
                total_price=200.0,
                confidence=0.97
            )
        ],
        subtotal=200.0,
        tax=10.0,
        service_charge=0.0,
        tip=0.0,
        discount=0.0,
        total=210.0,
        currency="INR",
        confidence_overall=0.98
    )

    with patch("services.extraction.extraction_service.extract_bill", new_callable=AsyncMock) as mock_extract:
        mock_extract.return_value = mock_bill

        fake_png = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")
        file_payload = {"file": ("coffee.png", fake_png, "image/png")}
        response = client.post("/extract-bill", files=file_payload)

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["id"] == "item_1"
        assert data["items"][0]["name"] == "Cold Brew Coffee"
        assert data["subtotal"] == 200.0
        assert data["total"] == 210.0
        assert data["currency"] == "INR"
        assert data["confidence_overall"] == 0.98


def test_extract_bill_live_sample():
    """
    Test live extraction through the FastAPI endpoint with sample_receipt_cafe.png
    """
    samples_dir = os.path.join(os.path.dirname(__file__), "samples")
    sample_file = os.path.join(samples_dir, "sample_receipt_cafe.png")
    
    if not os.path.exists(sample_file):
        pytest.skip("Sample image not generated yet")

    if not (os.getenv("GROQ_API_KEY") or os.getenv("GEMINI_API_KEY")):
        pytest.skip("No Vision API key configured in environment")

    with open(sample_file, "rb") as f:
        file_payload = {"file": ("sample_receipt_cafe.png", f.read(), "image/png")}
        response = client.post("/extract-bill", files=file_payload)

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 4
    assert data["currency"] == "INR"
    assert data["total"] == 1320.0 or abs(data["total"] - 1320.0) < 5.0
    for item in data["items"]:
        assert item["id"].startswith("item_") or len(item["id"]) > 0
        assert item["unit_price"] > 0
        assert item["total_price"] > 0
        assert 0.0 <= item["confidence"] <= 1.0

