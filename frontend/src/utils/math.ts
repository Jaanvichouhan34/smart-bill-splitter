import type { LineItem, BillData } from '../types/bill';

export interface MathSanityResult {
  itemsSum: number;
  subtotal: number;
  subtotalDiff: number;
  isSubtotalValid: boolean;
  
  expectedTotal: number;
  recordedTotal: number;
  totalDiff: number;
  isTotalValid: boolean;
  
  isFullyValid: boolean;
}

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateItemsSum(items: LineItem[]): number {
  const sum = items.reduce((acc, item) => acc + (Number(item.total_price) || 0), 0);
  return roundToTwo(sum);
}

export function checkMathSanity(bill: BillData): MathSanityResult {
  const itemsSum = calculateItemsSum(bill.items);
  const subtotal = roundToTwo(Number(bill.subtotal) || 0);
  const tax = roundToTwo(Number(bill.tax) || 0);
  const serviceCharge = roundToTwo(Number(bill.service_charge) || 0);
  const tip = roundToTwo(Number(bill.tip) || 0);
  const discount = roundToTwo(Number(bill.discount) || 0);
  const recordedTotal = roundToTwo(Number(bill.total) || 0);

  const subtotalDiff = roundToTwo(itemsSum - subtotal);
  const isSubtotalValid = Math.abs(subtotalDiff) < 0.05;

  const expectedTotal = roundToTwo(subtotal + tax + serviceCharge + tip - discount);
  const totalDiff = roundToTwo(recordedTotal - expectedTotal);
  const isTotalValid = Math.abs(totalDiff) < 0.05;

  return {
    itemsSum,
    subtotal,
    subtotalDiff,
    isSubtotalValid,
    expectedTotal,
    recordedTotal,
    totalDiff,
    isTotalValid,
    isFullyValid: isSubtotalValid && isTotalValid,
  };
}
