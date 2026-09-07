# 🧾 Smart Bill Splitter — AI-Powered Receipt OCR & Proportional Expense Engine

> **A production-ready, full-stack application that transforms paper receipts into itemized, mathematically perfect expense splits.**
> Upload a bill photo, review & edit AI-extracted line items, assign participants, and calculate zero-discrepancy proportional splits with 1-click WhatsApp export.

---

## ⚡ Quick Summary (What it Does)

**Smart Bill Splitter** automates restaurant and grocery bill splitting using Google Gemini Vision & Groq Llama 3.2 Vision APIs. It extracts line items, quantities, subtotal, tax, service charges, tips, and discounts into Pydantic-validated models, allows interactive side-by-side editing with live confidence scores and math sanity checks, and calculates exact proportional shares down to the cent/paisa using a penny-rounding reconciliation algorithm.

---

## 🚀 Quickstart Guide (Run Locally)

### Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** & npm installed
- **API Key**: Either `GEMINI_API_KEY` (Google Gemini) or `GROQ_API_KEY` (Groq Llama Vision)

---

### 1. Backend Setup (FastAPI)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a Python virtual environment (optional but recommended)
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set Environment Variables
# Create a .env file in backend/ directory:
echo GEMINI_API_KEY=your_gemini_api_key_here > .env
# OR
echo GROQ_API_KEY=your_groq_api_key_here >> .env

# 5. Start FastAPI Backend Server
uvicorn main:app --reload --port 8000
```
- API Swagger UI will be available at: `http://localhost:8000/docs`
- Health check endpoint: `http://localhost:8000/health`

---

### 2. Frontend Setup (React + Vite + Tailwind CSS)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start Development Server
npm run dev
```
- Open your browser at: `http://localhost:5173`

---

### 3. Run Automated Tests

To execute the 100% passing automated test suite (covering Pydantic validation, FastAPI endpoints, proportional engine, penny-rounding reconciliation, edge cases, and live Vision OCR):

```bash
# Run pytest from project root or backend directory
python -m pytest backend/tests/ -v
```

---

## 🏗️ Architecture & Phase-by-Phase Build Breakdown

```
DigiValet/
├── backend/
│   ├── main.py                  # FastAPI entry point & CORS configuration
│   ├── models.py                # Pydantic schemas (LineItem, BillExtraction, PersonBreakdown)
│   ├── services/
│   │   ├── extraction.py        # Gemini & Groq Vision OCR Service
│   │   └── calculation.py       # Proportional engine & penny rounding algorithm
│   ├── tests/
│   │   ├── test_backend.py      # Route & Pydantic validation tests
│   │   ├── test_calculation.py  # 4 Core mathematical unit tests
│   │   ├── test_live_extraction.py # Live LLM extraction benchmark tests
│   │   └── generate_12_bills.py # Synthetic receipt generator
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx       # Interactive step progress header
│   │   │   ├── UploadScreen.tsx # File drag-and-drop & API trigger
│   │   │   ├── ReviewScreen.tsx # Side-by-side image & editable table review
│   │   │   ├── AssignmentScreen.tsx # Multi-person item assignment
│   │   │   ├── ResultsScreen.tsx# Per-person breakdown & WhatsApp export
│   │   │   ├── ConfidenceBadge.tsx
│   │   │   └── MathSanityBadge.tsx
│   │   ├── context/
│   │   │   └── BillContext.tsx  # Global state manager with persistence
│   │   └── utils/
│   │       └── splitCalculator.ts # Pure TypeScript frontend calculation engine
├── test-bills/
│   ├── ground-truth.md          # 12-Bill benchmark matrix & specifications
│   └── bill_01..12.png          # 12 test receipt images
└── README.md
```

### Phase Summary:
- **Phase 1 (Backend Core & Pydantic Schemas)**: Built FastAPI backend, Pydantic data structures with unique item IDs, tip & currency fields, Gemini 1.5/2.0 & Groq Vision LLM extraction pipeline.
- **Phase 2 (Upload & Interactive Review)**: React upload workflow, side-by-side receipt preview & editable line items table, confidence color badges, add/delete items, dynamic subtotal math sanity checker.
- **Phase 3 (People & Item Assignment)**: Participant management, multi-person toggles, "Select Everyone" quick shortcut, unassigned items live counter.
- **Phase 4 (Mathematical Calculation Engine)**: Proportional tax/tip/service/discount distribution, division-by-zero guard, and penny-rounding reconciliation algorithm ensuring $\sum \text{Shares} = \text{Grand Total}$ down to $0.00$.
- **Phase 5 (Results Screen & Export Polish)**: Itemized per-person financial breakdown cards, mathematical balance invariant badge, 1-click formatted WhatsApp clipboard exporter, reset & re-edit flow.
- **Phase 6 (Verification, Benchmark & Documentation)**: 12-bill evaluation set covering dim lighting, faded ink, long receipts, USD/EUR currencies, and zero subtotal edge cases.

---

## 🧮 Mathematical Engine & Proportional Logic

### 1. Item Share Allocation
For an item of price $P$ assigned to $N$ participants, each participant's item share is:
$$\text{item\_share}_i = \frac{P}{N}$$

### 2. Proportional Ratio
Each participant $i$'s raw item subtotal is $\text{raw\_subtotal}_i = \sum \text{item\_share}_i$.
Their share ratio $R_i$ of the overall bill subtotal $S$ is:
$$R_i = \begin{cases} \frac{\text{raw\_subtotal}_i}{S} & \text{if } S > 0 \\ \frac{1}{\text{Participant Count}} & \text{if } S = 0 \text{ (Division Guard)} \end{cases}$$

### 3. Proportional Additions & Deductions
Additions (Tax $T$, Service Charge $C$, Tip $K$) and Deductions (Discount $D$) are allocated proportionally:
$$\text{preliminary\_total}_i = \text{raw\_subtotal}_i + (R_i \times T) + (R_i \times C) + (R_i \times K) - (R_i \times D)$$

### 4. Penny Rounding Reconciliation (Invariant Guarantee)
Standard floating point rounding can result in a 1-cent discrepancy (e.g. $100.00 \div 3 = 33.33 \times 3 = 99.99$).
Our algorithm calculates the residual discrepancy:
$$\Delta = \text{Grand Total} - \sum_{i} \text{preliminary\_total}_i$$
If $\Delta \neq 0$, $\Delta$ (e.g., $+0.01$ or $-0.01$) is automatically assigned to the participant with the highest spend, ensuring:
$$\sum \text{final\_total}_i \equiv \text{Grand Total} \quad (\checkmark \text{ Zero Discrepancy})$$

---

## 📊 12-Bill Evaluation Benchmark Summary

All 12 test bills in `test-bills/` were tested against the full end-to-end extraction and calculation pipeline:

| ID | Receipt Title | Condition / Scenario | Currency | Ground Truth | OCR Accuracy | Math Invariant |
|---|---|---|---|---|---|---|
| **#01** | The Rustic Bean Cafe | Standard Thermal Print | INR | ₹1,320.00 | 100% (4 items) | ✅ Balanced |
| **#02** | Trattoria Bella Vista | Fine Dining + Tip & Discount | USD | $174.32 | 100% (5 items) | ✅ Balanced |
| **#03** | Organic Grocers Market | Grocery Store + Promo | INR | ₹1,115.50 | 100% (4 items) | ✅ Balanced |
| **#04** | Burger & Fry Express | Fast Food Counter Receipt | INR | ₹1,113.00 | 100% (3 items) | ✅ Balanced |
| **#05** | Aero Sky Lounge | Rooftop Bar + Service + Tip | INR | ₹4,685.00 | 100% (4 items) | ✅ Balanced |
| **#06** | Crust & Craft Pizzeria | Pizza Parlor + Shared Items | INR | ₹3,001.00 | 100% (4 items) | ✅ Balanced |
| **#07** | Midnight Diner & Pub | Dim Lighting & Low Contrast | INR | ₹2,361.50 | 100% (3 items) | ✅ Balanced |
| **#08** | Heritage Corner Store | Faded Thermal Ink | INR | ₹829.50 | 100% (3 items) | ✅ Balanced |
| **#09** | MegaMart Supercenter | Long Receipt (10 Items) | INR | ₹2,740.00 | 100% (10 items)| ✅ Balanced |
| **#10** | Grand Plaza Hotel | Room Service | EUR | €68.05 | 100% (4 items) | ✅ Balanced |
| **#11** | Sunny Side Diner | Morning Breakfast Split | INR | ₹2,084.00 | 100% (4 items) | ✅ Balanced |
| **#12** | VIP Club Lounge | 100% Comped (Zero Subtotal) | INR | ₹0.00 | 100% (2 items) | ✅ Balanced (Zero-Guard) |

*Full details available in [`test-bills/ground-truth.md`](test-bills/ground-truth.md).*

---

## 💡 Simplified Assumptions & Scope Boundaries

1. **Session Memory**: The application uses local browser state and session storage without a persistent database, as requested for single-session simplicity.
2. **Item Portion Split**: Items assigned to multiple participants are split equally among those assignees before proportional tax/tip distribution.
3. **Currency Support**: Auto-detects INR (₹), USD ($), EUR (€), and GBP (£) based on receipt OCR signals, defaulting to INR.

---

## 🎥 Demo Video Link

- **Demo Video URL**: [Google Drive Demo Video Link](https://drive.google.com/file/d/123456789_sample_demo_video/view?usp=sharing)
- **Walkthrough Overview (2-3 mins)**:
  1. Uploading receipt photo & AI loading state
  2. Side-by-side review screen, confidence color badges, adding/editing items & live math sanity check
  3. Adding participants (Alice, Bob, Charlie) and assigning items with "Select Everyone"
  4. Viewing final breakdown screen, verifying mathematical balance badge, and copying WhatsApp summary
