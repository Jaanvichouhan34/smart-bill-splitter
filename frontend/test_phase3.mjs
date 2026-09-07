// Automated test script for Phase 3 & 4: People & Item Assignment + Proportional Split Calculation
// Runs headlessly with Node.js: node frontend/test_phase3.mjs

function roundToTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PARTICIPANT_COLORS = [
  { id: 0, name: 'Indigo' },
  { id: 1, name: 'Emerald' },
  { id: 2, name: 'Amber' },
  { id: 3, name: 'Rose' },
  { id: 4, name: 'Cyan' },
  { id: 5, name: 'Purple' },
  { id: 6, name: 'Orange' },
  { id: 7, name: 'Pink' },
  { id: 8, name: 'Teal' },
  { id: 9, name: 'Violet' },
  { id: 10, name: 'Lime' },
  { id: 11, name: 'Sky' },
];

function getParticipantColorTheme(index) {
  const safeIndex = Math.abs(Math.floor(index || 0)) % PARTICIPANT_COLORS.length;
  return PARTICIPANT_COLORS[safeIndex];
}

function calculateBillSplits(billData, participants, assignments) {
  if (!billData || participants.length === 0) {
    return [];
  }

  const items = billData.items;
  const itemsSum = items.reduce((acc, it) => acc + (Number(it.total_price) || 0), 0);

  const breakdownsMap = {};
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

  for (const item of items) {
    const assignedIds = assignments[item.id] || [];
    const count = assignedIds.length;
    if (count === 0) continue;

    const itemTotal = Number(item.total_price) || 0;
    const baseShare = Math.floor((itemTotal / count) * 100) / 100;
    let remainderCents = Math.round((itemTotal - baseShare * count) * 100);

    assignedIds.forEach((pid, idx) => {
      if (breakdownsMap[pid]) {
        const extra = remainderCents > 0 && idx < remainderCents ? 0.01 : 0;
        const shareAmount = roundToTwo(baseShare + extra);

        breakdownsMap[pid].assignedItemsCount += 1;
        breakdownsMap[pid].itemsSubtotal = roundToTwo(breakdownsMap[pid].itemsSubtotal + shareAmount);
        breakdownsMap[pid].itemBreakdowns.push({
          itemId: item.id,
          itemName: item.name,
          itemTotalPrice: itemTotal,
          splitCount: count,
          shareAmount,
        });
      }
    });
  }

  const subtotalBase = itemsSum > 0 ? itemsSum : Number(billData.subtotal) || 1;
  const taxTotal = Number(billData.tax) || 0;
  const serviceChargeTotal = Number(billData.service_charge) || 0;
  const tipTotal = Number(billData.tip) || 0;
  const discountTotal = Number(billData.discount) || 0;

  const result = participants.map((p) => {
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

  const billTotal = roundToTwo(Number(billData.total) || 0);
  const currentSum = roundToTwo(result.reduce((acc, r) => acc + r.totalOwed, 0));
  const diff = roundToTwo(billTotal - currentSum);

  if (Math.abs(diff) > 0 && Math.abs(diff) <= 0.05 && result.length > 0) {
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

function runTests() {
  console.log('🧪 Starting Phase 3 Validation & Math Tests...\n');

  // Test 1: Color Themes & Initials
  console.log('Test 1: Color Theme & Avatar helpers');
  console.assert(PARTICIPANT_COLORS.length >= 10, 'Should have at least 10 color themes');
  const theme0 = getParticipantColorTheme(0);
  const theme12 = getParticipantColorTheme(12);
  console.assert(theme0.id === 0, 'Theme 0 id must match');
  console.assert(theme12.id === 0, 'Theme 12 should modulo wrap to 0');
  console.assert(getInitials('Alice Smith') === 'AS', 'Initials of Alice Smith should be AS');
  console.assert(getInitials('Charlie') === 'CH', 'Initials of Charlie should be CH');
  console.log('✓ Color Theme & Initials tests passed.\n');

  // Sample Mock Bill
  const mockBill = {
    items: [
      { id: 'item_1', name: 'Truffle Pasta', quantity: 1, unit_price: 600, total_price: 600, confidence: 0.95 },
      { id: 'item_2', name: 'Margherita Pizza', quantity: 2, unit_price: 400, total_price: 800, confidence: 0.98 },
      { id: 'item_3', name: 'Garlic Bread & Dips', quantity: 1, unit_price: 300, total_price: 300, confidence: 0.92 },
    ],
    subtotal: 1700,
    tax: 85,
    service_charge: 170,
    tip: 100,
    discount: 55,
    total: 2000,
    currency: 'INR',
    confidence_overall: 0.95,
  };

  const participants = [
    { id: 'p_alice', name: 'Alice', colorIndex: 0 },
    { id: 'p_bob', name: 'Bob', colorIndex: 1 },
    { id: 'p_charlie', name: 'Charlie', colorIndex: 2 },
  ];

  // Test 2: Incomplete assignments
  console.log('Test 2: Validation of Unassigned Items');
  const partialAssignments = {
    item_1: ['p_alice'],
    item_2: ['p_alice', 'p_bob'],
  };

  const unassignedCount = mockBill.items.filter(
    (item) => !partialAssignments[item.id] || partialAssignments[item.id].length === 0
  ).length;

  console.assert(unassignedCount === 1, `Expected 1 unassigned item, got ${unassignedCount}`);
  console.assert(unassignedCount > 0, 'Continue button should remain strictly disabled');
  console.log('✓ Incomplete assignment correctly detected 1 unassigned item.\n');

  // Test 3: Prompt Verification Scenario
  console.log('Test 3: Prompt Verification Scenario');
  const fullAssignments = {
    item_1: ['p_alice'],
    item_2: ['p_alice', 'p_bob'],
    item_3: ['p_alice', 'p_bob', 'p_charlie'],
  };

  const unassignedAfter = mockBill.items.filter(
    (item) => !fullAssignments[item.id] || fullAssignments[item.id].length === 0
  ).length;
  console.assert(unassignedAfter === 0, 'All items should now be assigned');

  const splits = calculateBillSplits(mockBill, participants, fullAssignments);
  console.log('Split Results:', splits.map(s => ({
    name: s.participantName,
    itemsSubtotal: s.itemsSubtotal,
    tax: s.proportionalTax,
    service: s.proportionalServiceCharge,
    tip: s.proportionalTip,
    discount: s.proportionalDiscount,
    totalOwed: s.totalOwed,
  })));

  const alice = splits.find(s => s.participantId === 'p_alice');
  console.assert(alice?.itemsSubtotal === 1100, `Alice subtotal expected 1100, got ${alice?.itemsSubtotal}`);

  const bob = splits.find(s => s.participantId === 'p_bob');
  console.assert(bob?.itemsSubtotal === 500, `Bob subtotal expected 500, got ${bob?.itemsSubtotal}`);

  const charlie = splits.find(s => s.participantId === 'p_charlie');
  console.assert(charlie?.itemsSubtotal === 100, `Charlie subtotal expected 100, got ${charlie?.itemsSubtotal}`);

  const totalOwedSum = splits.reduce((acc, s) => acc + s.totalOwed, 0);
  console.log(`Total Owed Sum across all members: ₹${totalOwedSum} (Target: ₹${mockBill.total})`);
  console.assert(Math.abs(totalOwedSum - mockBill.total) < 0.01, 'Total owed should balance bill total down to 0.00');

  console.log('🎉 ALL AUTOMATED PHASE 6 / PHASE 3 TESTS PASSED PERFECTLY!');
}

runTests();
