"""
Phase 4 - Mandatory Automated Unit Test Suite
=============================================
Tests the pure calculation engine (services/calculation.py) directly
without going through the FastAPI layer so results are deterministic.

Run:
    pytest tests/test_calculation.py -v
"""

import os
import sys

# Ensure the backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import (
    CalculationBillData,
    CalculationLineItem,
    CalculationRequest,
)
from services.calculation import calculate_split


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def make_request(
    items: list,
    subtotal: float,
    tax: float,
    service_charge: float,
    tip: float,
    discount: float,
    grand_total: float,
    assignments: dict,
    people: list,
) -> CalculationRequest:
    calc_items = [
        CalculationLineItem(id=it['id'], name=it['name'], total_price=it['total_price'])
        for it in items
    ]
    bill = CalculationBillData(
        items=calc_items,
        subtotal=subtotal,
        tax=tax,
        service_charge=service_charge,
        tip=tip,
        discount=discount,
        grand_total=grand_total,
    )
    return CalculationRequest(bill=bill, assignments=assignments, people=people)


# ---------------------------------------------------------------------------
# Test 1 - Standard Proportional Split
# ---------------------------------------------------------------------------

def test_standard_proportional_split():
    items = [
        {'id': 'app',   'name': 'Nachos (shared)',  'total_price': 300.0},
        {'id': 'main1', 'name': 'Alice Steak',       'total_price': 400.0},
        {'id': 'main2', 'name': 'Bob Burger',         'total_price': 500.0},
        {'id': 'main3', 'name': 'Carol Pasta',        'total_price': 600.0},
    ]
    subtotal    = 1800.0
    tax         = 180.0
    service     = 90.0
    grand_total = 2070.0

    req = make_request(
        items=items, subtotal=subtotal, tax=tax, service_charge=service,
        tip=0.0, discount=0.0, grand_total=grand_total,
        assignments={
            'app':   ['Alice', 'Bob', 'Carol'],
            'main1': ['Alice'],
            'main2': ['Bob'],
            'main3': ['Carol'],
        },
        people=['Alice', 'Bob', 'Carol'],
    )

    result = calculate_split(req)

    assert result.is_balanced
    assert round(result.grand_total_check, 2) == grand_total

    by_name = {b.person_name: b for b in result.people_breakdowns}

    assert round(by_name['Alice'].raw_subtotal, 2) == 500.0
    assert round(by_name['Bob'].raw_subtotal,   2) == 600.0
    assert round(by_name['Carol'].raw_subtotal,  2) == 700.0

    assert round(by_name['Alice'].proportional_tax, 2) == round(500/1800 * 180, 2)
    assert round(by_name['Bob'].proportional_tax,   2) == round(600/1800 * 180, 2)
    assert round(by_name['Carol'].proportional_tax,  2) == round(700/1800 * 180, 2)

    total_sum = sum(b.final_total for b in result.people_breakdowns)
    assert round(total_sum, 2) == grand_total


# ---------------------------------------------------------------------------
# Test 2 - The 3-Way Penny Split
# ---------------------------------------------------------------------------

def test_three_way_penny_split():
    items = [{'id': 'shared', 'name': 'Shared Meal', 'total_price': 100.0}]
    grand_total = 100.0

    req = make_request(
        items=items, subtotal=100.0, tax=0.0, service_charge=0.0,
        tip=0.0, discount=0.0, grand_total=grand_total,
        assignments={'shared': ['Alice', 'Bob', 'Carol']},
        people=['Alice', 'Bob', 'Carol'],
    )

    result = calculate_split(req)

    total_sum = round(sum(b.final_total for b in result.people_breakdowns), 2)
    assert total_sum == 100.00, f'3-way penny split failed: sum={total_sum}'
    assert result.is_balanced
    assert result.grand_total_check == 100.00


# ---------------------------------------------------------------------------
# Test 3 - High Discount Proportional
# ---------------------------------------------------------------------------

def test_high_discount_proportional():
    items = [
        {'id': 'a', 'name': 'Alice Item', 'total_price': 300.0},
        {'id': 'd', 'name': 'Dave Item',  'total_price': 200.0},
    ]
    subtotal    = 500.0
    discount    = 200.0
    grand_total = 300.0

    req = make_request(
        items=items, subtotal=subtotal, tax=0.0, service_charge=0.0,
        tip=0.0, discount=discount, grand_total=grand_total,
        assignments={'a': ['Alice'], 'd': ['Dave']},
        people=['Alice', 'Dave'],
    )

    result = calculate_split(req)

    by_name = {b.person_name: b for b in result.people_breakdowns}

    assert round(by_name['Alice'].proportional_discount, 2) == 120.00
    assert round(by_name['Dave'].proportional_discount,  2) == 80.00
    assert round(by_name['Alice'].final_total, 2) == 180.00
    assert round(by_name['Dave'].final_total,  2) == 120.00

    total_sum = round(sum(b.final_total for b in result.people_breakdowns), 2)
    assert total_sum == grand_total
    assert result.is_balanced


# ---------------------------------------------------------------------------
# Test 4 - Zero Subtotal / Division-by-Zero Guard
# ---------------------------------------------------------------------------

def test_zero_subtotal_no_division_error():
    items = [
        {'id': 'comped1', 'name': 'Comped Appetizer', 'total_price': 0.0},
        {'id': 'comped2', 'name': 'Comped Main',      'total_price': 0.0},
    ]
    subtotal    = 0.0
    tax         = 30.0
    grand_total = 30.0

    req = make_request(
        items=items, subtotal=subtotal, tax=tax, service_charge=0.0,
        tip=0.0, discount=0.0, grand_total=grand_total,
        assignments={
            'comped1': ['Eve', 'Frank'],
            'comped2': ['Eve', 'Frank'],
        },
        people=['Eve', 'Frank'],
    )

    try:
        result = calculate_split(req)
    except ZeroDivisionError:
        raise AssertionError('ZeroDivisionError raised for zero-subtotal bill!')

    assert result.is_balanced

    total_sum = round(sum(b.final_total for b in result.people_breakdowns), 2)
    assert total_sum == grand_total

    by_name = {b.person_name: b for b in result.people_breakdowns}
    assert round(by_name['Eve'].proportional_tax, 2) == round(by_name['Frank'].proportional_tax, 2)
