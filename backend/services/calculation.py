"""
Phase 4 – Calculation Engine
Pure, independently testable bill-splitting logic with:
  - Proportional split of tax / service charge / tip / discount
  - Penny-rounding reconciliation (Zero-Discrepancy Invariant)
  - Division-by-zero guard for fully-comped bills
"""

from __future__ import annotations

from typing import Dict, List

from models import (
    CalculationRequest,
    CalculationResult,
    PersonBreakdown,
)


def calculate_split(request: CalculationRequest) -> CalculationResult:
    """
    Core splitting engine.

    Steps
    -----
    a. Item split: each assigned person gets item_price / N
    b. Raw subtotal per person: sum of all item shares
    c. Share ratio: raw_subtotal_i / overall_subtotal  (or 1/N if subtotal == 0)
    d. Proportional additions / deductions (tax, service, tip, discount)
    e. Penny-rounding reconciliation: discrepancy applied to the highest spender
    f. Invariant assert: sum(final_totals) == grand_total
    """

    bill      = request.bill
    people    = request.people           # List[str]  – names
    assign    = request.assignments      # Dict[item_id -> List[person_name]]

    grand_total    = round(float(bill.grand_total), 2)
    overall_sub    = round(float(bill.subtotal), 2)
    tax_total      = round(float(bill.tax), 2)
    svc_total      = round(float(bill.service_charge), 2)
    tip_total      = round(float(bill.tip), 2)
    disc_total     = round(float(bill.discount), 2)

    n_people = len(people)
    if n_people == 0:
        raise ValueError("people list must contain at least one person")

    # ------------------------------------------------------------------ #
    # a + b. Item split → raw subtotal per person
    # ------------------------------------------------------------------ #
    # person_name -> list of {name, total_price, share_amount}
    item_shares: Dict[str, List[dict]] = {p: [] for p in people}
    raw_subtotals: Dict[str, float]    = {p: 0.0 for p in people}

    item_lookup = {item.id: item for item in bill.items}

    for item_id, assigned_names in assign.items():
        if not assigned_names:
            continue
        item = item_lookup.get(item_id)
        if item is None:
            continue

        item_price = round(float(item.total_price), 2)
        n_assigned = len(assigned_names)
        per_person_share = round(item_price / n_assigned, 10)  # high-precision intermediate

        for name in assigned_names:
            if name not in raw_subtotals:
                continue                          # skip unknown names silently
            share = round(per_person_share, 2)
            item_shares[name].append({
                "name":        item.name,
                "total_price": item_price,
                "share_amount": share,
            })
            raw_subtotals[name] = round(raw_subtotals[name] + share, 2)

    # ------------------------------------------------------------------ #
    # c. Share ratio  (with division-by-zero guard)
    # ------------------------------------------------------------------ #
    if overall_sub > 0:
        ratios = {p: raw_subtotals[p] / overall_sub for p in people}
    else:
        # 100%-comped bill: split everything equally
        ratios = {p: 1.0 / n_people for p in people}

    # ------------------------------------------------------------------ #
    # d. Proportional additions & preliminary totals
    # ------------------------------------------------------------------ #
    preliminary: Dict[str, float] = {}

    for p in people:
        r = ratios[p]
        tax_i  = round(r * tax_total,  2)
        svc_i  = round(r * svc_total,  2)
        tip_i  = round(r * tip_total,  2)
        disc_i = round(r * disc_total, 2)
        prelim = round(raw_subtotals[p] + tax_i + svc_i + tip_i - disc_i, 2)
        preliminary[p] = prelim

    # ------------------------------------------------------------------ #
    # e. Penny-rounding reconciliation
    # ------------------------------------------------------------------ #
    current_sum  = round(sum(preliminary.values()), 2)
    discrepancy  = round(grand_total - current_sum, 2)

    final_totals = dict(preliminary)   # copy

    if discrepancy != 0.0:
        # Add discrepancy to the person with the highest raw_subtotal
        highest = max(people, key=lambda p: raw_subtotals[p])
        final_totals[highest] = round(final_totals[highest] + discrepancy, 2)

    # ------------------------------------------------------------------ #
    # f. Invariant
    # ------------------------------------------------------------------ #
    total_check = round(sum(final_totals.values()), 2)
    assert total_check == grand_total, (
        f"Invariant violated: sum(final_totals)={total_check} != grand_total={grand_total}"
    )

    # ------------------------------------------------------------------ #
    # Build output
    # ------------------------------------------------------------------ #
    # Pre-compute per-person additions one more time for the response object
    breakdowns: List[PersonBreakdown] = []

    for p in people:
        r      = ratios[p]
        tax_i  = round(r * tax_total,  2)
        svc_i  = round(r * svc_total,  2)
        tip_i  = round(r * tip_total,  2)
        disc_i = round(r * disc_total, 2)

        breakdowns.append(PersonBreakdown(
            person_name              = p,
            assigned_items           = item_shares[p],
            raw_subtotal             = raw_subtotals[p],
            proportional_tax         = tax_i,
            proportional_service_charge = svc_i,
            proportional_tip         = tip_i,
            proportional_discount    = disc_i,
            final_total              = final_totals[p],
        ))

    is_balanced = (total_check == grand_total)

    return CalculationResult(
        people_breakdowns = breakdowns,
        grand_total_check = total_check,
        is_balanced       = is_balanced,
    )
