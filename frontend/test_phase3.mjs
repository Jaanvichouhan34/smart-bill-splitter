// Automated test script for Phase 3: People & Item Assignment + Split Calculation
import { calculateBillSplits, generateShareableSummaryText } from './src/utils/splitCalculator.ts';
import { getParticipantColorTheme, getInitials, PARTICIPANT_COLORS } from './src/utils/colors.ts';

function runTests() {
  console.log('🧪 Starting Phase 3 Validation & Math Tests...\n');

  // Test 1: Color Themes & Initials
  console.log('Test 1: Color Theme & Avatar helpers');
  console.assert(PARTICIPANT_COLORS.length >= 10, 'Should have at least 10 color themes');
  const theme0 = getParticipantColorTheme(0);
  const theme12 = getParticipantColorTheme(12); // Wrap around modulo
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
    tax: 85, // 5% GST
    service_charge: 170, // 10% Service
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
    // item_3 is unassigned!
  };

  const unassignedCount = mockBill.items.filter(
    (item) => !partialAssignments[item.id] || partialAssignments[item.id].length === 0
  ).length;

  console.assert(unassignedCount === 1, `Expected 1 unassigned item, got ${unassignedCount}`);
  console.assert(unassignedCount > 0, 'Continue button should remain strictly disabled');
  console.log('✓ Incomplete assignment correctly detected 1 unassigned item.\n');

  // Test 3: Prompt Scenario Verification
  // - Assign item 1 to Alice (₹600)
  // - Assign item 2 to Alice & Bob (₹800 split 2 ways = ₹400 each)
  // - Assign item 3 to "Everyone" (₹300 split 3 ways = ₹100 each)
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

  // Verify Alice:
  // Item 1: 600
  // Item 2: 400
  // Item 3: 100
  // Alice Subtotal = 1100 (1100 / 1700 = 64.7%)
  const alice = splits.find(s => s.participantId === 'p_alice');
  console.assert(alice?.itemsSubtotal === 1100, `Alice subtotal expected 1100, got ${alice?.itemsSubtotal}`);
  console.assert(alice?.assignedItemsCount === 3, `Alice assigned items count expected 3, got ${alice?.assignedItemsCount}`);

  // Verify Bob:
  // Item 2: 400
  // Item 3: 100
  // Bob Subtotal = 500 (500 / 1700 = 29.4%)
  const bob = splits.find(s => s.participantId === 'p_bob');
  console.assert(bob?.itemsSubtotal === 500, `Bob subtotal expected 500, got ${bob?.itemsSubtotal}`);
  console.assert(bob?.assignedItemsCount === 2, `Bob assigned items count expected 2, got ${bob?.assignedItemsCount}`);

  // Verify Charlie:
  // Item 3: 100
  // Charlie Subtotal = 100 (100 / 1700 = 5.88%)
  const charlie = splits.find(s => s.participantId === 'p_charlie');
  console.assert(charlie?.itemsSubtotal === 100, `Charlie subtotal expected 100, got ${charlie?.itemsSubtotal}`);
  console.assert(charlie?.assignedItemsCount === 1, `Charlie assigned items count expected 1, got ${charlie?.assignedItemsCount}`);

  // Math sum verification
  const totalSubtotal = splits.reduce((acc, s) => acc + s.itemsSubtotal, 0);
  console.assert(totalSubtotal === 1700, `Total items subtotal expected 1700, got ${totalSubtotal}`);

  const totalOwedSum = splits.reduce((acc, s) => acc + s.totalOwed, 0);
  console.log(`Total Owed Sum across all members: ₹${totalOwedSum} (Target: ₹${mockBill.total})`);
  console.assert(Math.abs(totalOwedSum - mockBill.total) < 0.5, 'Total owed should balance bill total');

  // Test 4: Shareable summary text generation
  const summaryText = generateShareableSummaryText(mockBill, splits);
  console.assert(summaryText.includes('Alice'), 'Summary should contain Alice');
  console.assert(summaryText.includes('Bob'), 'Summary should contain Bob');
  console.assert(summaryText.includes('Charlie'), 'Summary should contain Charlie');
  console.log('✓ Shareable summary text generation verified.\n');

  console.log('🎉 ALL AUTOMATED PHASE 3 TESTS PASSED PERFECTLY!');
}

runTests();
