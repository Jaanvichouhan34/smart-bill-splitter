from typing import List, Optional
from pydantic import BaseModel, Field


class LineItem(BaseModel):
    """
    Represents an individual item on a bill/receipt.
    """
    id: str = Field(
        ...,
        description="Unique identifier for the item (e.g., 'item_1', 'item_2' or UUID)",
        examples=["item_1", "item_2"]
    )
    name: str = Field(
        ...,
        description="Name or description of the purchased item/dish",
        examples=["Butter Chicken", "Garlic Naan", "Diet Coke"]
    )
    quantity: float = Field(
        default=1.0,
        description="Quantity ordered (integer or fractional, e.g., 1, 2.5)",
        examples=[1.0, 2.0, 0.5]
    )
    unit_price: float = Field(
        ...,
        description="Price per individual unit",
        examples=[350.0, 60.0]
    )
    total_price: float = Field(
        ...,
        description="Total price for this line item (unit_price * quantity, or recorded line total)",
        examples=[350.0, 120.0]
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="OCR/Extraction confidence score for this item between 0.0 and 1.0",
        examples=[0.95]
    )


class BillExtraction(BaseModel):
    """
    Validated structured extraction response for a bill/receipt.
    """
    items: List[LineItem] = Field(
        default_factory=list,
        description="List of extracted line items from the bill"
    )
    subtotal: float = Field(
        ...,
        description="Sum of all items before taxes, service charges, discounts, etc.",
        examples=[470.0]
    )
    tax: float = Field(
        default=0.0,
        description="Total tax amount (GST, VAT, Sales Tax, etc.)",
        examples=[23.50]
    )
    service_charge: float = Field(
        default=0.0,
        description="Service charge / restaurant fee if applicable",
        examples=[47.0]
    )
    tip: float = Field(
        default=0.0,
        description="Tip or gratuity amount",
        examples=[0.0, 50.0]
    )
    discount: float = Field(
        default=0.0,
        description="Discount amount deducted from bill",
        examples=[0.0, 50.0]
    )
    total: float = Field(
        ...,
        description="Final grand total payable",
        examples=[540.50]
    )
    currency: str = Field(
        default="INR",
        description="Currency code or symbol (e.g., 'INR', 'USD', 'EUR', 'GBP')",
        examples=["INR", "USD"]
    )
    confidence_overall: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Overall extraction confidence score across the receipt (0.0 to 1.0)",
        examples=[0.98]
    )


class ErrorResponse(BaseModel):
    """
    Standard error detail payload.
    """
    detail: str = Field(..., description="Descriptive error message")


# ---------------------------------------------------------------------------
# Phase 4 – Calculation Engine Models
# ---------------------------------------------------------------------------

class CalculationBillData(BaseModel):
    """
    Reviewed bill data passed into the calculation engine.
    Contains items + financial totals extracted / confirmed by the user.
    """
    items: List["CalculationLineItem"] = Field(
        default_factory=list,
        description="List of line items with id, name, and total_price"
    )
    subtotal: float = Field(
        default=0.0,
        description="Sum of item prices before tax / charges"
    )
    tax: float = Field(default=0.0, description="Tax amount")
    service_charge: float = Field(default=0.0, description="Service charge amount")
    tip: float = Field(default=0.0, description="Tip / gratuity amount")
    discount: float = Field(default=0.0, description="Discount amount (positive value, deducted)")
    grand_total: float = Field(..., description="Final amount payable on the bill")


class CalculationLineItem(BaseModel):
    """
    Slimmed-down line item used as input to the calculation engine.
    """
    id: str = Field(..., description="Unique item identifier matching keys in assignments")
    name: str = Field(..., description="Human-readable item name")
    total_price: float = Field(..., description="Total price for this line item")


# Resolve forward reference
CalculationBillData.model_rebuild()


class CalculationRequest(BaseModel):
    """
    Full request payload for POST /calculate-split.
    """
    bill: CalculationBillData = Field(..., description="Reviewed bill data")
    assignments: dict = Field(
        default_factory=dict,
        description="Mapping of item_id -> list of person_names assigned to that item"
    )
    people: List[str] = Field(
        default_factory=list,
        description="Ordered list of all person names in the split"
    )


class PersonBreakdown(BaseModel):
    """
    Per-person calculation result with itemised detail and final total.
    """
    person_name: str = Field(..., description="Name of the person")
    assigned_items: List[dict] = Field(
        default_factory=list,
        description="List of {name, total_price, share_amount} for each item assigned to this person"
    )
    raw_subtotal: float = Field(..., description="Sum of item shares before any additions/deductions")
    proportional_tax: float = Field(..., description="Tax allocated proportionally to this person")
    proportional_service_charge: float = Field(..., description="Service charge allocated proportionally")
    proportional_tip: float = Field(..., description="Tip allocated proportionally")
    proportional_discount: float = Field(..., description="Discount deducted proportionally")
    final_total: float = Field(..., description="Amount this person owes (after penny reconciliation)")


class CalculationResult(BaseModel):
    """
    Full calculation result returned by POST /calculate-split.
    """
    people_breakdowns: List[PersonBreakdown] = Field(
        ...,
        description="Breakdown for every person in the split"
    )
    grand_total_check: float = Field(
        ...,
        description="Sum of all final_totals — must equal bill.grand_total"
    )
    is_balanced: bool = Field(
        ...,
        description="True when grand_total_check == bill.grand_total (zero-discrepancy invariant)"
    )

