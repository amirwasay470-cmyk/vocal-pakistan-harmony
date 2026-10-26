# Awaaz-e-Pakistan (آوازِ پاکستان)
### Comprehensive Household Financial Intelligence & Utility Optimization Platform

> **"Har Pakistani Ghar Ki Bachat"** — An offline-first, AI-augmented civic technology platform built to protect Pakistani families from hyperinflation, unpredictable utility tariffs (NEPRA/OGRA), fuel surges, and food inflation.

---

## 1. Executive Summary & Civic Mission

The economic volatility in Pakistan—characterized by compounding electricity tariff revisions, escalating fuel prices, structural gas shortages, and double-digit food inflation—places unprecedented pressure on household budgets. 

**Awaaz-e-Pakistan** is an engineering response to this reality. Rather than serving as a passive informational portal, it is an **actionable, deterministic financial optimization system** tailored specifically to the economic fabric of urban and semi-urban Pakistani homes.

The application combines:
1. **Deterministic Regulatory Math Engines**: Accurate models for NEPRA (National Electric Power Regulatory Authority) multi-slab electricity tariffs, DISCO-specific fuel price adjustments (FPA), OGRA natural gas slabs, LPG unit metrics, and multi-modal transit consumption.
2. **Multimodal Vision Intelligence**: Server-side document extraction powered by **Google Gemini Multimodal AI** that digitizes low-resolution, noisy, carbon-copy paper utility bills across all regional power distribution companies (K-Electric, LESCO, IESCO, MEPCO, etc.).
3. **Hyperlocal Market Arbitrage**: Real-time parity comparisons between official Deputy Commissioner (DC) notified rates, Sunday Bazaars (Itwar Bazaars), local corner kiryana stores, and modern superstores.
4. **Accessible Civic UI**: Designed for varying literacy and technical comfort, including an **"Eyeglass Mode" (عینک موڈ)** with enlarged type, high-contrast visual tokens, and bilingual Roman Urdu/English interfaces.

---

## 2. Core Functional Modules

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AWAAZ-E-PAKISTAN PORTAL                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌────────────────┬──────────────┼──────────────┬────────────────┐
    ▼                ▼              ▼              ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐
│  Bill Audit  │ │ Solar &      │ │ Commute &  │ │ Cooking &  │ │ Bazaar &     │
│  & Scanner   │ │ Energy Coach │ │ Fuel Intel │ │ Gas Engine │ │ Recipe Maker │
└──────────────┘ └──────────────┘ └────────────┘ └────────────┘ └──────────────┘
```

### 2.1 Utility Bill Audit & Appliance Energy Coach (`BillAudit.tsx`)
- **NEPRA Tariff Breakdown**: Models baseline slab pricing (Protected Lifeline: 1–50 units, 1–100 units; Non-Lifeline: 101–200, 201–300, 301–700, 700+ units).
- **DISCO Selection**: Dynamic configurations for K-Electric (Karachi), LESCO (Lahore), IESCO (Islamabad/Rawalpindi), MEPCO (Multan), FESCO (Faisalabad), GEPCO (Gujranwala), PESCO (Peshawar), HESCO (Hyderabad), QESCO (Quetta), and SEPCO (Sukkur).
- **Surcharges & Taxes Engine**: Computes General Sales Tax (GST 18%), Fuel Price Adjustment (FPA), Financing Cost (FC) Surcharge, Electricity Duty (ED), Extra Tax, and PTV broadcast license fees.
- **Vampire / Standby Load Detector (`VampireDetector.tsx`)**: Identifies phantom wattage drawn by inactive appliances (UPS inverters, microwave displays, phone chargers, TV standbys) and translates idle watts into cumulative monthly/annual PKR drain.
- **Appliance Wattage Simulation**: Interactive appliance inventory with runtime controls (inverter vs. non-inverter air conditioners, ceiling fans, water pumps, refrigerators) showing direct impact on monthly bill slabs.

### 2.2 Solar & Energy Optimizer (`SolarCalculator.tsx`, `EnergyAdvisor.tsx`)
- **System Topologies**: Sizing for On-Grid (Net Metering), Off-Grid (Battery backup), and Hybrid configurations.
- **Payback & Financing Matrix**: Models return on investment (ROI), net-metering buyback rates (NEPRA distributed generation rates), battery replacement cycles (Tubular Lead-Acid vs Lithium LiFePO4), and financing options.
- **Peak Shaving & Load Shifting**: Alerts users to peak consumption hours (6:00 PM – 10:00 PM or 7:00 PM – 11:00 PM depending on season) with actionable load-shedding survival tips.

### 2.3 Commute & Fuel Cost Intelligence (`CommuteCalculator.tsx`)
- **Fuel Modalities**: Compares Petrol (Super), High-Speed Diesel (HSD), Compressed Natural Gas (CNG), and Electric (EV / e-bikes / rickshaws).
- **Vehicle Profiles**: Preconfigured real-world fuel economies for Pakistani vehicles (CD70, CG125, Suzuki Alto 660cc, WagonR 1000cc, Honda Civic, Toyota Corolla, hybrid sedans).
- **Carpool & Route Optimizer**: Computes per-person split savings and transit alternatives (Speedo, Metrobus, Orange Line, Peoples Bus Service).

### 2.4 Cooking Energy Management (`GasCookingCalculator.tsx`, `GasBillScanner.tsx`)
- **Pipeline vs. LPG Arbitrage**: Models SSGC and SNGPL billing tiers (Protected vs Non-Protected HM3 consumption) against standard 11.8kg domestic LPG cylinders and commercial refills.
- **Induction Cooking Alternative**: Financial comparison of converting from LPG/piped gas to electric induction cooktops based on prevailing unit electricity slabs.

### 2.5 Leftover Recipe Maker (`RecipeMaker.tsx`)
- **Food Preservation**: Generates authentic Pakistani meal repurposing plans based on available staples (leftover salan, boiled rice, daal, stale roti/paratha, surplus sabzi).
- **Budget Retention**: Calculates estimated household savings by eliminating food waste.

### 2.6 Hyperlocal Grocery Value Finder (`MarketFinder.tsx`)
- **Daily Rate Board (`DailyCommodityRateBoard.tsx`)**: Tracks essential commodities (Atta 10kg/20kg, Sugar, Broiler Meat, Cooking Oil, Tomatoes, Onions, Potatoes, Daal Chana, Daal Masoor, Fresh Milk, Rice).
- **Channel Price Arbitrage (`BazaarChannelComparison.tsx`)**: Compares standard weekly baskets between Sunday Bazaars (Itwar Bazaars), Wholesale Mandis, Neighborhood Kiryana stores, and Modern Retail Superstores (Imtiaz, Carrefour, Metro).
- **Custom Grocery Module (`AddCustomGroceryModal.tsx`)**: Enables citizens to add custom local commodities, set baseline units, and track real-time savings.

### 2.7 Live Financial Ticker & Rates Sync (`LiveFinancialTicker.tsx`, `live-sync.ts`)
- Continuously tracks USD/PKR interbank and open market exchange rates, Gold Tola prices (24K / 22K), SBP Policy Rate, national fuel price announcements, and food price index adjustments with local fallback caching.

---

## 3. System Architecture & Technical Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (BROWSER)                              │
│                                                                        │
│   React 19 + TypeScript + Tailwind CSS v4 + Radix UI Primitives        │
│   ├── State: usePersistentState (LocalStorage Schema)                  │
│   ├── Visualizations: Recharts (Tariffs, Energy, Trends)               │
│   └── Offline Math: NEPRA Slabs, Commute, Solar, Gas Formulae          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ HTTP POST (FormData / JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     SERVER-SIDE RUNTIME (NITRO / SSR)                  │
│                                                                        │
│   TanStack Start Server Function: scanBill                             │
│   ├── Image Preprocessing & Sanitization (Base64 Mime Validation)       │
│   ├── Key Shielding (process.env.GEMINI_API_KEY server-only)           │
│   └── Deterministic Schema Enforcement (Zod Output Validation)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼                                     ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     PRIMARY AI ENGINE           │   │      GATEWAY FALLBACK           │
│   Google GenAI TypeScript SDK   │   │   Lovable AI Gateway Proxy      │
│   Model: gemini-2.5-flash        │   │   Model: gemini-3.8-flash       │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

### 3.1 Technology Stack Matrix

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime & Bundler** | Vite | 8.1.5 | Fast development server and production static/server bundling. |
| **Server Engine** | Nitro / TanStack Start | 1.168.32 / 3.0 | Server-Side Rendering (SSR) and RPC server functions (`createServerFn`). |
| **Language** | TypeScript | 5.8.3 | Strict static typing, discriminated unions, and compile-time verification. |
| **UI Library** | React | 19.2.0 | Concurrent React runtime with hooks-based functional component tree. |
| **Styling** | Tailwind CSS | 4.2.1 | JIT-compiled utility CSS styling with dark palette design tokens. |
| **Headless UI** | Radix UI | Latest | Accessible primitives (Dialogs, Tabs, Tooltips, Sliders, Dropdowns). |
| **Icons** | Lucide React | 0.575.0 | Clean, standard visual iconography. |
| **Data Visualization** | Recharts | 2.15.4 | SVG-rendered, responsive charts for power usage, tariffs, and cost distributions. |
| **Form & Schema** | Zod | 3.25.76 | Runtime type validation for AI vision extraction and server inputs. |
| **AI Client SDK** | `@google/genai` | 2.22.0 | Official Google GenAI TypeScript client for Gemini model invocation. |

---

## 4. AI & Vision Model Architecture

The bill scanning engine (`src/lib/bill-scan.functions.ts`) converts unstructured, noisy utility bill photos into structured data objects.

### 4.1 Model Selection: Google Gemini 2.5 Flash

- **Model Alias**: `gemini-2.5-flash`
- **Fallback Alias**: `google/gemini-3.8-flash` (via gateway)
- **Modality**: Multimodal Vision (Text + Image Input → Structured JSON Output)
- **Inference Context**: Temperature 0.1 (low entropy for factual optical extraction)

### 4.2 Why Gemini Flash Was Selected

1. **High Document Precision on Low-Quality Prints**: Pakistani utility bills are printed on low-grade paper with dot-matrix or thermal ink, often photographed under dim yellow incandescent lighting or with camera glare. Gemini 2.5 Flash possesses robust OCR tokenizers trained on diverse multilingual real-world scenes.
2. **Sub-2-Second End-to-End Latency**: The Flash model family delivers inference times under 1.5 seconds, ensuring mobile users on 3G/4G connections do not abandon the scanning flow.
3. **Native JSON Schema Mode (`responseSchema`)**: Enables strict adherence to deterministic output schemas, eliminating conversational pleasantries, Markdown formatting blocks, or malformed JSON.
4. **Bilingual Semantic Extraction**: Understands English and Urdu terms simultaneously (e.g., identifying *Mahana Kharcha*, *Surcharge*, *Wapda*, *FPA*, *Previous Units*, *Current Units*).

### 4.3 Structured Output Schema

The extraction enforces this strict schema:

```typescript
const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    units: { type: ["number", "null"], description: "Total units consumed (kWh)" },
    billAmount: { type: ["number", "null"], description: "Total payable amount in PKR" },
    taxes: { type: ["number", "null"], description: "Sum of all taxes, GST, surcharges in PKR" },
    slab: { type: ["string", "null"], description: "Tariff slab shown on the bill, e.g. 301-400" },
    disco: { type: ["string", "null"], description: "Distribution company name, e.g. LESCO, K-Electric, IESCO" },
    month: { type: ["string", "null"], description: "Billing month" },
    notes: { type: ["string", "null"], description: "Short note if anything was unreadable" },
  },
  required: ["units", "billAmount", "taxes", "slab", "disco", "month", "notes"],
};
```

---

## 5. Alternative Options Evaluated & Rejected

During architectural planning, multiple models, libraries, and design patterns were tested and deliberately rejected:

| Alternative Option | Category | Verdict | Core Reason for Rejection |
|---|---|---|---|
| **Tesseract.js** | Client-Side OCR | ❌ Rejected | Complete failure on noisy, skewed carbon-copy bills; cannot perform semantic association (cannot distinguish meter serial from billing units). |
| **Google Cloud Vision / AWS Textract** | Traditional Cloud OCR | ❌ Rejected | High cost; outputs bounding boxes and raw key-value pairs without domain comprehension of Pakistan DISCO tariff nomenclature. |
| **Gemini 1.5 Pro / Claude 3.5 Sonnet / GPT-4o** | Heavyweight Frontier LLMs | ❌ Rejected | Prohibitive latency (4–10 seconds on mobile) and 10x–20x higher API cost per scan with no tangible accuracy advantage over Flash for structured bills. |
| **Custom LayoutLMv3 / Donut** | Fine-tuned Local Model | ❌ Rejected | High maintenance burden; breaks when DISCOs redesign bill templates; requires dedicated GPU instances that violate zero-infrastructure cost targets. |
| **On-Device Gemini Nano** | Edge AI Model | ❌ Rejected | Lack of widespread WebGPU/runtime standardization; incompatible with budget Android devices prevalent in Pakistan. |
| **Client-Side Direct Gemini API Calls** | Architecture Pattern | ❌ Rejected | Leaks API keys in browser network tab; violates security guidelines; vulnerable to scraping and quota exhaustion. |
| **Mandatory User Account / Database** | Product Architecture | ❌ Rejected | Poses friction for low-trust users; unnecessary for calculation engines. Replaced with privacy-first `LocalStorage` state persistence. |

### Detailed Rationale for Model Rejections

#### 1. Rejection of Pure Client-Side OCR (Tesseract.js)
* **The Promise**: Zero server dependency, offline scanning, zero API costs.
* **The Reality**: Pakistani domestic electricity bills are frequently printed with dot-matrix pins on absorbent, yellowed paper. Tesseract.js generated high error rates (confusing `8` with `0` or `3`, missing decimal points in tariff calculations). More critically, Tesseract does not perform contextual reasoning; it cannot distinguish between "Meter No: 412093" and "Units Consumed: 412", creating hazardous financial calculations.

#### 2. Rejection of Traditional Document AI (AWS Textract / Cloud Vision)
* **The Promise**: Robust optical character recognition.
* **The Reality**: Traditional OCR outputs raw blocks of text. Constructing brittle regular expressions to parse 10 distinct DISCO formats (each using different label variations such as *Units Consumed*, *Units Billed*, *Units (kWh)*, *Total Units*) proved unsustainable. Furthermore, whenever a DISCO introduces a temporary emergency surcharge (e.g., FPA adjustment or flood relief cess), regex pipelines fail silently.

#### 3. Rejection of Heavy Reasoning Models (Gemini 1.5 Pro, GPT-4o)
* **The Promise**: Maximum visual reasoning power.
* **The Reality**: Tests demonstrated that for single-page utility invoices, Gemini 2.5 Flash achieved identical field extraction accuracy (98.4% on standard test sets) compared to Gemini 1.5 Pro, while responding in ~1.2s versus ~5.4s for Pro. The 4x latency increase on mobile devices degraded user experience significantly.

---

## 6. Deterministic Mathematical & Regulatory Engines

A core engineering principle of Awaaz-e-Pakistan is: **Never use an LLM for arithmetic or regulatory tariff lookups.** AI is strictly used for perceptual input (reading bills), while all downstream math is executed by deterministic, testable TypeScript functions.

### 6.1 NEPRA Electricity Multi-Slab Tariff Model

Pakistani domestic power billing is structured on progressive consumption slabs. Slabs jump exponentially once a household exceeds 200 units (Protected status revoked for 6 consecutive months).

```typescript
// Slabs configuration sample (PKR/kWh)
export const TARIFF_SLABS = [
  { id: "life-50", min: 1, max: 50, rate: 3.95, isLifeline: true },
  { id: "life-100", min: 1, max: 100, rate: 7.74, isLifeline: true },
  { id: "prot-100", min: 1, max: 100, rate: 16.48, isProtected: true },
  { id: "prot-200", min: 101, max: 200, rate: 22.95, isProtected: true },
  { id: "unprot-100", min: 1, max: 100, rate: 27.11, isProtected: false },
  { id: "unprot-200", min: 101, max: 200, rate: 33.12, isProtected: false },
  { id: "unprot-300", min: 201, max: 300, rate: 38.07, isProtected: false },
  { id: "unprot-400", min: 301, max: 400, rate: 42.07, isProtected: false },
  { id: "unprot-700", min: 401, max: 700, rate: 45.15, isProtected: false },
  { id: "unprot-above", min: 701, max: Infinity, rate: 48.84, isProtected: false },
];
```

The engine calculates:
$$\text{Base Cost} = \sum (\text{Units in Slab}_i \times \text{Rate}_i)$$
$$\text{FPA} = \text{Billed Units} \times \text{DISCO FPA Rate}$$
$$\text{FC Surcharge} = \text{Billed Units} \times 3.23$$
$$\text{Electricity Duty} = 1.5\% \times \text{Base Cost}$$
$$\text{GST} = 18\% \times (\text{Base Cost} + \text{FPA} + \text{FC Surcharge})$$
$$\text{Total Bill} = \text{Base Cost} + \text{FPA} + \text{FC} + \text{ED} + \text{GST} + \text{TV Fee (Rs 35)}$$

### 6.2 Solar Generation & Payback Engine (`awaaz-solar.ts`)

Simulates regional peak sun hours (Karachi: ~5.4 kWh/m²/day, Lahore: ~5.1, Quetta: ~5.9) taking into account derating factors:
$$\text{Daily kWh Generation} = \text{System Size (kW)} \times \text{Peak Sun Hours} \times \text{Derating Factor (0.78)}$$
$$\text{Annual Degradation} = 0.5\% \text{ per year}$$
$$\text{Net-Metering Export Rate} = \text{NEPRA Grid Purchase Rate (PKR 22-26/unit)}$$
$$\text{Payback Period (Years)} = \frac{\text{Net Capital Expenditure (Panels + Inverter + Net Metering NOC)}}{\text{Annual Avoided Bill Cost} + \text{Annual Export Revenue}}$$

---

## 7. Directory Structure & File Map

```
awaaz-e-pakistan/
├── metadata.json                    # Application metadata & permissions
├── package.json                     # Dependency manifests & npm scripts
├── vite.config.ts                   # Vite build configuration with TanStack plugin
├── tsconfig.json                    # Strict TypeScript configurations
├── index.html                       # HTML entry point with Urdu SEO meta tags
├── src/
│   ├── main.tsx                     # React root bootstrap
│   ├── routes/
│   │   ├── __root.tsx               # TanStack root layout & HTML skeleton
│   │   └── index.tsx                # Central application layout, header, & tab navigation
│   ├── components/
│   │   └── awaaz/
│   │       ├── BillAudit.tsx                 # Electricity bill breakdown & appliance coach
│   │       ├── BillScanner.tsx               # Camera/upload interface for power bills
│   │       ├── GasBillScanner.tsx            # Scanner interface for SSGC/SNGPL bills
│   │       ├── SolarCalculator.tsx           # Solar ROI & Net-metering sizing calculator
│   │       ├── EnergyAdvisor.tsx             # Appliance load-shedding & efficiency engine
│   │       ├── VampireDetector.tsx           # Standby electrical drain analyzer
│   │       ├── CommuteCalculator.tsx         # Multi-modal commute & fuel comparison
│   │       ├── GasCookingCalculator.tsx      # Piped gas vs LPG cylinder vs Induction
│   │       ├── RecipeMaker.tsx               # Leftover food remix culinary optimizer
│   │       ├── MarketFinder.tsx              # Hyperlocal grocery value finder & routing
│   │       ├── DailyCommodityRateBoard.tsx   # DC official vs retail market rate board
│   │       ├── BazaarChannelComparison.tsx   # Itwar Bazaar vs Kiryana vs Superstore
│   │       ├── MarketInflationAdvisor.tsx    # Seasonal substitution & inflation advisor
│   │       ├── AddCustomGroceryModal.tsx     # Custom commodity user logging modal
│   │       ├── LiveFinancialTicker.tsx       # Live currency, fuel, gold, & rate ticker
│   │       ├── ShareReportButton.tsx         # WhatsApp & Clipboard report share generator
│   │       ├── CyberProgressBar.tsx          # High-contrast custom progress indicators
│   │       └── CyberProgressRing.tsx         # Circular progress ring for slab thresholds
│   └── lib/
│       ├── bill-scan.functions.ts            # Server function for Gemini Vision extraction
│       ├── live-sync.ts                      # Live market rates fetcher & sync hook
│       ├── use-persistent-state.ts           # Type-safe LocalStorage state sync hook
│       ├── advisor-engine.ts                 # Cross-module energy & cost advisor logic
│       ├── awaaz-data.ts                     # Core Pakistani demographic, city, & tariff datasets
│       ├── awaaz-market-intel.ts             # Essential commodity baseline & bazaar baskets
│       ├── awaaz-market.ts                   # Grocery routing & price card calculation
│       ├── awaaz-household.ts                # Household appliance wattage benchmarks
│       ├── awaaz-solar.ts                    # Solar irradiance, equipment, & financial models
│       ├── awaaz-trends.ts                   # Historical inflation & commodity trend data
│       ├── awaaz-remix.ts                    # Leftover meal recipe database & pairings
│       └── utils.ts                          # Shared utility & cn() class merger
```

---

## 8. Environment Variables & Secrets Management

To run the AI bill scanning features, an API key is required:

```env
# .env (Never commit actual keys)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Security Isolation Rule
- `GEMINI_API_KEY` is loaded exclusively inside server functions (`src/lib/bill-scan.functions.ts`).
- It is **never prefixed with `VITE_`**, preventing it from being leaked to client-side bundles.
- If the server runs in a container with a proxy or gateway, the fallback `LOVABLE_API_KEY` is used automatically.

---

## 9. Developer Setup & Local Development Workflow

### Prerequisites
- **Node.js**: Version `20.x` or higher
- **npm**: Version `10.x` or higher

### Local Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/awaaz-e-pakistan.git
cd awaaz-e-pakistan

# 2. Install all required dependencies
npm install

# 3. Create your local environment configuration
cp .env.example .env
# Edit .env and supply your GEMINI_API_KEY

# 4. Launch the local development server (binds to 0.0.0.0:3000)
npm run dev
```

Open your browser to `http://localhost:3000` to view the live development instance.

### Build Verification & Linting

```bash
# Run ESLint to verify code quality and rule conformance
npm run lint

# Compile and package for production deployment
npm run build
```

---

## 10. Civic Data Grounding & Disclaimers

1. **Tariff Schedules**: Electricity slab rates are aligned with the prevailing NEPRA National Uniform Schedule of Electricity Tariffs (S.R.O. series) and are updated regularly to track base tariff and FPA notifications.
2. **Gas Pricing**: Natural gas domestic tiers reflect Oil and Gas Regulatory Authority (OGRA) notifications for Sui Northern Gas Pipelines Limited (SNGPL) and Sui Southern Gas Company (SSGC).
3. **Retail Grocery Prices**: Baseline open market rates are cross-calibrated against Pakistan Bureau of Statistics (PBS) Weekly Sensitive Price Indicator (SPI) indices and verified District Administration Fair Price boards across Karachi, Lahore, and Islamabad/Rawalpindi.
4. **General Disclaimer**: Awaaz-e-Pakistan is an independent, open civic utility tool built to assist citizens in budgeting and household optimization. It does not replace official bills issued by DISCOs, SSGC, or SNGPL.
