import type { BillData, Participant, ItemAssignments, PersonShareBreakdown, ItemSplitShare } from '../types/bill';
import { roundToTwo } from './math';
import { formatCurrency } from './currency';

export function calculateBillSplits(
  billData: BillData,
  participants: Participant[],
  assignments: ItemAssignments
): PersonShareBreakdown[] {
  if (!billData || participants.length === 0) {
    return [];
  }

  const items = billData.items;
  const itemsSum = items.reduce((acc, it) => acc + (Number(it.total_price) || 0), 0);

  // Initialize breakdown for each participant
  const breakdownsMap: Record<string, PersonShareBreakdown> = {};
  for (const p of participants) {
    breakdownsMap[p.id] = {
      participantId: p.id,
      participantName: p.name,
      colorIndex: p.colorIndex,
      assignedItemsCount: 0,
      itemsSubtotal: 0,
      proportionalTax: 0,
      proportionalServiceCharge: 0,
      proportionalTip: 0,
      proportionalDiscount: 0,
      totalOwed: 0,
      itemBreakdowns: [],
    };
  }

  // Distribute each item
  for (const item of items) {
    const assignedIds = assignments[item.id] || [];
    const count = assignedIds.length;
    if (count === 0) continue;

    const itemTotal = Number(item.total_price) || 0;
    const baseShare = Math.floor((itemTotal / count) * 100) / 100;
    let remainderCents = Math.round((itemTotal - baseShare * count) * 100);

    assignedIds.forEach((pid, idx) => {
      if (breakdownsMap[pid]) {
        // Distribute fractional remainder cent to the first few participants
        const extra = remainderCents > 0 && idx < remainderCents ? 0.01 : 0;
        const shareAmount = roundToTwo(baseShare + extra);

        const itemShare: ItemSplitShare = {
          itemId: item.id,
          itemName: item.name,
          itemTotalPrice: itemTotal,
          splitCount: count,
          shareAmount,
        };

        breakdownsMap[pid].assignedItemsCount += 1;
        breakdownsMap[pid].itemsSubtotal = roundToTwo(breakdownsMap[pid].itemsSubtotal + shareAmount);
        breakdownsMap[pid].itemBreakdowns.push(itemShare);
      }
    });
  }

  // Calculate proportional taxes, fees, tips, discounts
  const subtotalBase = itemsSum > 0 ? itemsSum : Number(billData.subtotal) || 1;
  const taxTotal = Number(billData.tax) || 0;
  const serviceChargeTotal = Number(billData.service_charge) || 0;
  const tipTotal = Number(billData.tip) || 0;
  const discountTotal = Number(billData.discount) || 0;

  const result: PersonShareBreakdown[] = participants.map((p) => {
    const bd = breakdownsMap[p.id];
    const ratio = subtotalBase > 0 ? bd.itemsSubtotal / subtotalBase : 0;

    const proportionalTax = roundToTwo(taxTotal * ratio);
    const proportionalServiceCharge = roundToTwo(serviceChargeTotal * ratio);
    const proportionalTip = roundToTwo(tipTotal * ratio);
    const proportionalDiscount = roundToTwo(discountTotal * ratio);

    const totalOwed = roundToTwo(
      bd.itemsSubtotal + proportionalTax + proportionalServiceCharge + proportionalTip - proportionalDiscount
    );

    return {
      ...bd,
      proportionalTax,
      proportionalServiceCharge,
      proportionalTip,
      proportionalDiscount,
      totalOwed,
    };
  });

  // Reconcile any 1-cent rounding difference with grand total
  const billTotal = roundToTwo(Number(billData.total) || 0);
  const currentSum = roundToTwo(result.reduce((acc, r) => acc + r.totalOwed, 0));
  const diff = roundToTwo(billTotal - currentSum);

  if (Math.abs(diff) > 0 && Math.abs(diff) <= 0.05 && result.length > 0) {
    // Find participant with highest subtotal to adjust fractional cent difference
    let maxIdx = 0;
    for (let i = 1; i < result.length; i++) {
      if (result[i].itemsSubtotal > result[maxIdx].itemsSubtotal) {
        maxIdx = i;
      }
    }
    result[maxIdx].totalOwed = roundToTwo(result[maxIdx].totalOwed + diff);
  }

  return result;
}

export function generateShareableSummaryText(
  billData: BillData,
  breakdowns: PersonShareBreakdown[],
  vendorName?: string
): string {
  const currency = billData.currency || 'INR';
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const vendor = vendorName || 'Restaurant';
  const divider = '----------------------------------';
  const lines: string[] = [];

  const sumOfShares = roundToTwo(breakdowns.reduce((acc, b) => acc + b.totalOwed, 0));
  const billTotal = roundToTwo(Number(billData.total) || 0);
  const isBalanced = Math.abs(billTotal - sumOfShares) < 0.02;

  lines.push(`🧾 Bill Split — ${date} / ${vendor}`);
  lines.push(`Total Bill: ${formatCurrency(billTotal, currency)} (${isBalanced ? 'Balanced ✓' : 'Check totals ⚠'})`);
  lines.push(divider);

  for (const b of breakdowns) {
    // Build item detail string
    const itemParts: string[] = [];
    for (const it of b.itemBreakdowns) {
      const label = it.splitCount > 1 ? `${it.itemName} [shared]` : it.itemName;
      itemParts.push(`${label}: ${formatCurrency(it.shareAmount, currency)}`);
    }
    const taxTip =
      roundToTwo(
        (b.proportionalTax || 0) +
          (b.proportionalServiceCharge || 0) +
          (b.proportionalTip || 0) -
          (b.proportionalDiscount || 0)
      );
    if (taxTip !== 0) {
      itemParts.push(`Tax/Tip: ${formatCurrency(taxTip, currency)}`);
    }

    lines.push(`• ${b.participantName}: ${formatCurrency(b.totalOwed, currency)}`);
    if (itemParts.length > 0) {
      lines.push(`  (${itemParts.join(', ')})`);
    }
  }

  lines.push(divider);
  lines.push(`Generated via AI Bill Splitter`);

  return lines.join('\n');
}
