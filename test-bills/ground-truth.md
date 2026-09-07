# 🧾 Test Set & Ground Truth Evaluation Matrix (12 Test Bills)

This document contains the ground-truth benchmark data for the 12 receipt test cases used to validate the AI Bill Splitting Engine across varied legibility, optical conditions, currency formats, line item counts, and mathematical edge cases.

---

## 📊 Summary Evaluation Matrix

| ID | Receipt Title | Condition / Edge Case | Currency | Ground Truth Total | OCR Extraction Status | Math Balance Invariant | Result |
|---|---|---|---|---|---|---|---|
| **#01** | The Rustic Bean Cafe | Standard Thermal Print (INR) | INR | ₹1,320.00 | 100% Accurate (4 items) | Balanced (0.00 diff) | ✅ PASS |
| **#02** | Trattoria Bella Vista | Fine Dining + Tip & Discount (USD) | USD | $174.32 | 100% Accurate (5 items) | Balanced (0.00 diff) | ✅ PASS |
| **#03** | Organic Grocers Market | Grocery Store + Promo Discount | INR | ₹1,115.50 | 100% Accurate (4 items) | Balanced (0.00 diff) | ✅ PASS |
| **#04** | Burger & Fry Express | Fast Food Counter Receipt | INR | ₹1,113.00 | 100% Accurate (3 items) | Balanced (0.00 diff) | ✅ PASS |
| **#05** | Aero Sky Lounge | Rooftop Bar + Service Charge + Tip | INR | ₹4,685.00 | 100% Accurate (4 items) | Balanced (0.00 diff) | ✅ PASS |
| **#06** | Crust & Craft Pizzeria | Pizza Parlor + Multi-person Shared Items | INR | ₹3,001.00 | 100% Accurate (4 items) | Balanced (0.00 diff) | ✅ PASS |
| **#07** | Midnight Diner & Pub | Dim Lighting & Low Contrast | INR | ₹2,361.50 | 100% Accurate (3 items) | Balanced (0.00 diff) | ✅ PASS |
| **#08** | Heritage Corner Store | Faded Thermal Ink | INR | ₹829.50 | 100% Accurate (3 items) | Balanced (0.00 diff) | ✅ PASS |
| **#09** | MegaMart Supercenter | Long Receipt (10 Line Items) | INR | ₹2,740.00 | 100% Accurate (10 items) | Balanced (0.00 diff) | ✅ PASS |
| **#10** | Grand Plaza Hotel | Room Service (EUR Currency) | EUR | €68.05 | 100% Accurate (4 items) | Balanced (0.00 diff) | ✅ PASS |
| **#11** | Sunny Side Diner | Multi-Person Breakfast Split | INR | ₹2,084.00 | 100% Accurate (4 items) | Balanced (0.00 diff) | ✅ PASS |
| **#12** | VIP Club Lounge | 100% Comped Promo (Zero Subtotal) | INR | ₹0.00 | 100% Accurate (2 items) | Zero-Division Guard Active | ✅ PASS |

---

## 📑 Ground Truth Itemized Specifications

### 1. The Rustic Bean Cafe (`bill_01_cafe_bistro.png`)
- **Currency**: INR (₹)
- **Subtotal**: ₹1,200.00 | **Tax**: ₹60.00 | **Service Charge**: ₹60.00 | **Total**: ₹1,320.00
- **Line Items**:
  1. 2x Cappuccino @ ₹220.00 = ₹440.00
  2. 1x Avocado Sourdough Toast = ₹380.00
  3. 1x Blueberry Cheesecake = ₹260.00
  4. 1x Sparkling Water = ₹120.00

### 2. Trattoria Bella Vista (`bill_02_fine_dining_usd.png`)
- **Currency**: USD ($)
- **Subtotal**: $146.50 | **Tax**: $12.82 | **Tip**: $25.00 | **Discount**: -$10.00 | **Total**: $174.32
- **Line Items**:
  1. 1x Burrata Salad = $18.50
  2. 2x Truffle Tagliatelle @ $28.00 = $56.00
  3. 1x Grilled Salmon = $32.00
  4. 2x Chianti Glass @ $14.00 = $28.00
  5. 1x Tiramisu = $12.00

### 3. Organic Grocers Market (`bill_03_gourmet_grocery.png`)
- **Currency**: INR (₹)
- **Subtotal**: ₹1,110.00 | **Tax**: ₹55.50 | **Discount**: -₹50.00 | **Total**: ₹1,115.50
- **Line Items**:
  1. 2x Almond Milk 1L @ ₹200.00 = ₹400.00
  2. 1x Organic Honey 500g = ₹350.00
  3. 3x Greek Yogurt Cups @ ₹70.00 = ₹210.00
  4. 1x Artisan Sourdough = ₹150.00

### 4. Burger & Fry Express (`bill_04_fast_food_counter.png`)
- **Currency**: INR (₹)
- **Subtotal**: ₹1,060.00 | **Tax**: ₹53.00 | **Total**: ₹1,113.00
- **Line Items**:
  1. 2x Double Smash Burger @ ₹250.00 = ₹500.00
  2. 2x Large Peri Peri Fries @ ₹120.00 = ₹240.00
  3. 2x Classic Chocolate Shake @ ₹160.00 = ₹320.00

### 5. Aero Sky Lounge (`bill_05_cocktail_lounge.png`)
- **Currency**: INR (₹)
- **Subtotal**: ₹3,900.00 | **Tax**: ₹195.00 | **Service Charge**: ₹390.00 | **Tip**: ₹200.00 | **Total**: ₹4,685.00
- **Line Items**:
  1. 2x Smoked Old Fashioned @ ₹700.00 = ₹1,400.00
  2. 2x Espresso Martini @ ₹600.00 = ₹1,200.00
  3. 1x Truffle Fries Basket = ₹450.00
  4. 1x Artisanal Cheese Board = ₹850.00

### 6. Crust & Craft Pizzeria (`bill_06_pizza_parlor.png`)
- **Currency**: INR (₹)
- **Subtotal**: ₹2,740.00 | **Tax**: ₹137.00 | **Service Charge**: ₹274.00 | **Discount**: -₹150.00 | **Total**: ₹3,001.00
- **Line Items**:
  1. 1x 14 inch Pepperoni Feast = ₹750.00
  2. 1x 14 inch Quattro Formaggi = ₹720.00
  3. 1x Garlic Dough Balls = ₹220.00
  4. 3x Craft IPA Pint @ ₹350.00 = ₹1,050.00

### 7. Midnight Diner & Pub (`bill_07_dim_lighting_thermal.png`)
- **Currency**: INR (₹)
- **Subtotal**: ₹2,010.00 | **Tax**: ₹100.50 | **Service Charge**: ₹201.00 | **Tip**: ₹50.00 | **Total**: ₹2,361.50
- **Line Items**:
  1. 2x Loaded Nachos Supreme @ ₹320.00 = ₹640.00
  2. 2x Draft Pitcher Blonde @ ₹475.00 = ₹950.00
  3. 1x Buffalo Chicken Wings = ₹420.00

### 8. Heritage Corner Store (`bill_08_faded_thermal_ink.png`)
- **Currency**: INR (₹)
- **Subtotal**: ₹790.00 | **Tax**: ₹39.50 | **Total**: ₹829.50
- **Line Items**:
  1. 1x Darjeeling Tea Tin 250g = ₹320.00
  2. 2x Butter Shortbread Box @ ₹140.00 = ₹280.00
  3. 1x Handmade Dark Choco = ₹190.00

### 9. MegaMart Supercenter (`bill_09_long_supermarket.png`)
- **Currency**: INR (₹)
- **Subtotal**: ₹2,800.00 | **Tax**: ₹140.00 | **Discount**: -₹200.00 | **Total**: ₹2,740.00
- **Line Items** (10 items total):
  1. Extra Virgin Olive Oil 1L (₹850.00)
  2. 2x Whole Wheat Bread (₹100.00)
  3. Cheddar Cheese Block (₹290.00)
  4. Fresh Bananas 1kg (₹70.00)
  5. 2x Avocados Import (₹240.00)
  6. Dark Roast Coffee Beans (₹550.00)
  7. Rolled Oats 1kg (₹180.00)
  8. 2x Sparkling Water 1.5L (₹160.00)
  9. Dark Chocolate 85% (₹220.00)
  10. Dishwashing Liquid (₹140.00)

### 10. Grand Plaza Hotel (`bill_10_hotel_room_service_eur.png`)
- **Currency**: EUR (€)
- **Subtotal**: €50.50 | **Tax**: €5.05 | **Service Charge**: €7.50 | **Tip**: €5.00 | **Total**: €68.05
- **Line Items**:
  1. 1x Club Sandwich Supreme = €22.00
  2. 1x French Onion Soup = €14.00
  3. 2x Espresso Single @ €4.00 = €8.00
  4. 1x Evian Still 750ml = €6.50

### 11. Sunny Side Diner (`bill_11_breakfast_diner.png`)
- **Currency**: INR (₹)
- **Subtotal**: ₹1,940.00 | **Tax**: ₹97.00 | **Service Charge**: ₹97.00 | **Tip**: ₹50.00 | **Discount**: -₹100.00 | **Total**: ₹2,084.00
- **Line Items**:
  1. 2x Full English Breakfast @ ₹380.00 = ₹760.00
  2. 2x Pancake Stack Maple @ ₹260.00 = ₹520.00
  3. 2x Fresh Orange Juice @ ₹150.00 = ₹300.00
  4. 2x Flat White Coffee @ ₹180.00 = ₹360.00

### 12. VIP Club Lounge (`bill_12_comped_zero_subtotal.png`)
- **Currency**: INR (₹)
- **Subtotal**: ₹0.00 | **Tax**: ₹0.00 | **Total**: ₹0.00
- **Line Items**:
  1. 1x Complimentary Mocktail = ₹0.00
  2. 1x Welcome Chef Appetizer = ₹0.00
- **Edge Case Verified**: Division-by-Zero Guard assigns equal zero ratio without runtime exception.
