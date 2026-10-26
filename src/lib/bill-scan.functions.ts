import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

const ScanInput = z.object({
  imageDataUrl: z.string().min(20).max(12_000_000),
});

export type BillScan = {
  units: number | null;
  billAmount: number | null;
  taxes: number | null;
  slab: string | null;
  disco: string | null;
  month: string | null;
  notes: string | null;
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    units: { type: ["number", "null"], description: "Total units consumed (kWh)" },
    billAmount: { type: ["number", "null"], description: "Total payable amount in PKR" },
    taxes: { type: ["number", "null"], description: "Sum of all taxes, GST, surcharges in PKR" },
    slab: { type: ["string", "null"], description: "Tariff slab shown on the bill, e.g. 301-400" },
    disco: {
      type: ["string", "null"],
      description: "Distribution company name, e.g. LESCO, K-Electric, IESCO",
    },
    month: { type: ["string", "null"], description: "Billing month" },
    notes: { type: ["string", "null"], description: "Short note if anything was unreadable" },
  },
  required: ["units", "billAmount", "taxes", "slab", "disco", "month", "notes"],
} as const;

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: key });
  }
  return genAIClient;
}

export const scanBill = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ScanInput.parse(input))
  .handler(async ({ data }): Promise<BillScan> => {
    const geminiKey = process.env["GEMINI_API_KEY"];
    const lovableKey = process.env["LOVABLE_API_KEY"];

    const Out = z.object({
      units: z.number().nullable(),
      billAmount: z.number().nullable(),
      taxes: z.number().nullable(),
      slab: z.string().nullable(),
      disco: z.string().nullable(),
      month: z.string().nullable(),
      notes: z.string().nullable(),
    });

    if (geminiKey) {
      const ai = getGenAI();
      if (!ai) throw new Error("Could not initialize Gemini client.");

      const match = data.imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match || !match[1] || !match[2]) {
        throw new Error("Invalid image format provided.");
      }

      const mimeType = match[1];
      const base64Data = match[2];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "You read Pakistani electricity and utility bills (LESCO, K-Electric, IESCO, MEPCO, FESCO, GEPCO, PESCO, HESCO, QESCO, SSGC, gas and water bills). Extract only what is printed. Use null for anything you cannot read confidently. Amounts are PKR numbers without commas or currency symbols.\n\nExtract the total units consumed, total payable amount, total taxes/surcharges, tariff slab, distribution company and billing month from this bill.",
              },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              units: { type: Type.NUMBER, description: "Total units consumed (kWh)" },
              billAmount: { type: Type.NUMBER, description: "Total payable amount in PKR" },
              taxes: { type: Type.NUMBER, description: "Sum of all taxes, GST, surcharges in PKR" },
              slab: {
                type: Type.STRING,
                description: "Tariff slab shown on the bill, e.g. 301-400",
              },
              disco: {
                type: Type.STRING,
                description: "Distribution company name, e.g. LESCO, K-Electric, IESCO",
              },
              month: { type: Type.STRING, description: "Billing month" },
              notes: { type: Type.STRING, description: "Short note if anything was unreadable" },
            },
            required: ["units", "billAmount", "taxes", "slab", "disco", "month", "notes"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("The scan came back empty. Try a clearer photo.");

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("The scan result could not be understood. Try a clearer photo.");
      }

      return Out.parse(parsed);
    }

    if (lovableKey) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": lovableKey,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "google/gemini-3.8-flash",
          messages: [
            {
              role: "system",
              content:
                "You read Pakistani electricity and utility bills (LESCO, K-Electric, IESCO, MEPCO, FESCO, GEPCO, PESCO, HESCO, QESCO, SSGC, gas and water bills). Extract only what is printed. Use null for anything you cannot read confidently. Amounts are PKR numbers without commas or currency symbols.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract the total units consumed, total payable amount, total taxes/surcharges, tariff slab, distribution company and billing month from this bill.",
                },
                { type: "image_url", image_url: { url: data.imageDataUrl } },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "bill_reading", strict: true, schema: responseSchema },
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        if (res.status === 429)
          throw new Error("Too many scans right now — please try again shortly.");
        if (res.status === 402)
          throw new Error(
            "AI credits for this app are used up. Please add credits to continue scanning.",
          );
        throw new Error(`Could not read the bill (${res.status}). ${body.slice(0, 200)}`);
      }

      const payload = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error("The scan came back empty. Try a clearer photo.");

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error("The scan result could not be understood. Try a clearer photo.");
      }

      return Out.parse(parsed);
    }

    throw new Error("AI is not configured. Please set GEMINI_API_KEY in your environment.");
  });

export type GasBillScan = {
  isGasBill: boolean;
  provider: string | null;
  consumerNumber: string | null;
  billingMonth: string | null;
  consumptionValue: number | null;
  consumptionUnit: string | null;
  mmbtu: number | null;
  hm3: number | null;
  category: "Protected" | "Non-protected" | null;
  fixedCharges: number | null;
  totalAmount: number | null;
  dueDate: string | null;
  notes: string | null;
};

const gasResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    isGasBill: {
      type: "boolean",
      description: "True if image is a recognizable Pakistani gas bill (SSGC or SNGPL), false if unrelated, blank, or completely unreadable",
    },
    provider: {
      type: ["string", "null"],
      description: "Gas utility provider: 'SSGC' or 'SNGPL', or null if unreadable",
    },
    consumerNumber: {
      type: ["string", "null"],
      description: "Consumer ID or account number printed on the bill, or null if unreadable",
    },
    billingMonth: {
      type: ["string", "null"],
      description: "Billing month or billing period printed on the bill, or null if unreadable",
    },
    consumptionValue: {
      type: ["number", "null"],
      description: "Numeric gas consumption printed on the bill, or null if unreadable",
    },
    consumptionUnit: {
      type: ["string", "null"],
      description: "Exact consumption unit printed on bill (e.g. hm³, m³, MMBTU, ft³), or null if unreadable",
    },
    mmbtu: {
      type: ["number", "null"],
      description: "MMBTU consumption value if explicitly printed on the bill, or null if missing",
    },
    hm3: {
      type: ["number", "null"],
      description: "Consumption in hm³ (hundred cubic meters) if explicitly printed on the bill, or null if missing",
    },
    category: {
      type: ["string", "null"],
      description: "Protected or Non-protected ONLY if explicitly printed on the bill. If not explicitly shown, must be null.",
    },
    fixedCharges: {
      type: ["number", "null"],
      description: "Meter rent / fixed charges / service charges in PKR if printed on the bill, or null if missing",
    },
    totalAmount: {
      type: ["number", "null"],
      description: "Total payable amount within due date in PKR, or null if unreadable",
    },
    dueDate: {
      type: ["string", "null"],
      description: "Payment due date printed on the bill, or null if unreadable",
    },
    notes: {
      type: ["string", "null"],
      description: "Observations regarding readability, missing fields, or image blurriness",
    },
  },
  required: [
    "isGasBill",
    "provider",
    "consumerNumber",
    "billingMonth",
    "consumptionValue",
    "consumptionUnit",
    "mmbtu",
    "hm3",
    "category",
    "fixedCharges",
    "totalAmount",
    "dueDate",
    "notes",
  ],
} as const;

export const scanGasBill = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ScanInput.parse(input))
  .handler(async ({ data }): Promise<GasBillScan> => {
    const geminiKey = process.env["GEMINI_API_KEY"];
    const lovableKey = process.env["LOVABLE_API_KEY"];

    const GasBillScanOut = z.object({
      isGasBill: z.boolean().default(true),
      provider: z.string().nullable().catch(null),
      consumerNumber: z.string().nullable().catch(null),
      billingMonth: z.string().nullable().catch(null),
      consumptionValue: z.number().nullable().catch(null),
      consumptionUnit: z.string().nullable().catch(null),
      mmbtu: z.number().nullable().catch(null),
      hm3: z.number().nullable().catch(null),
      category: z.string().nullable().catch(null),
      fixedCharges: z.number().nullable().catch(null),
      totalAmount: z.number().nullable().catch(null),
      dueDate: z.string().nullable().catch(null),
      notes: z.string().nullable().catch(null),
    });

    const normalizeResult = (raw: z.infer<typeof GasBillScanOut>): GasBillScan => {
      if (!raw.isGasBill) {
        return {
          isGasBill: false,
          provider: null,
          consumerNumber: null,
          billingMonth: null,
          consumptionValue: null,
          consumptionUnit: null,
          mmbtu: null,
          hm3: null,
          category: null,
          fixedCharges: null,
          totalAmount: null,
          dueDate: null,
          notes:
            raw.notes ||
            "The uploaded image does not appear to be a recognizable Pakistani gas bill (SNGPL or SSGC). Please upload a clear photo of your Sui Gas bill.",
        };
      }

      let normalizedProvider = raw.provider;
      if (normalizedProvider) {
        const up = normalizedProvider.toUpperCase();
        if (up.includes("SNGPL") || up.includes("NORTHERN")) {
          normalizedProvider = "SNGPL (Sui Northern)";
        } else if (up.includes("SSGC") || up.includes("SOUTHERN")) {
          normalizedProvider = "SSGC (Sui Southern)";
        }
      }

      let normalizedCategory: "Protected" | "Non-protected" | null = null;
      if (raw.category) {
        const cat = raw.category.toLowerCase();
        if (cat.includes("non-protected") || cat.includes("non protected") || cat.includes("ghair")) {
          normalizedCategory = "Non-protected";
        } else if (cat.includes("protected") || cat.includes("mahfooz")) {
          normalizedCategory = "Protected";
        }
      }

      return {
        isGasBill: true,
        provider: normalizedProvider,
        consumerNumber: raw.consumerNumber,
        billingMonth: raw.billingMonth,
        consumptionValue: raw.consumptionValue,
        consumptionUnit: raw.consumptionUnit,
        mmbtu: raw.mmbtu,
        hm3: raw.hm3,
        category: normalizedCategory,
        fixedCharges: raw.fixedCharges,
        totalAmount: raw.totalAmount,
        dueDate: raw.dueDate,
        notes: raw.notes,
      };
    };

    const promptText =
      "You are an expert document reading AI specialized in Pakistani Sui Gas utility bills issued by SNGPL (Sui Northern Gas Pipelines Limited) and SSGC (Sui Southern Gas Company Limited).\n\n" +
      "Analyze this bill image carefully. Extract ONLY factual data visibly printed on the bill. NEVER invent, estimate, or assume numbers or values. If any field is blurred, absent, or unreadable, return null.\n\n" +
      "Required fields to extract:\n" +
      "1. isGasBill: boolean. Set to false if the image is NOT a gas/utility bill or is completely unreadable/blank.\n" +
      "2. provider: 'SNGPL' or 'SSGC' if identifiable from the header or logo, else null.\n" +
      "3. consumerNumber: Consumer / Account / Customer ID number printed on the bill, else null.\n" +
      "4. billingMonth: Billing month printed on the bill (e.g. 'Aug 2024'), else null.\n" +
      "5. consumptionValue: Numeric value of gas consumed in this billing cycle, else null.\n" +
      "6. consumptionUnit: Exact unit printed on the bill (e.g. 'hm³', 'm³', 'MMBTU', 'ft³'), else null.\n" +
      "7. mmbtu: MMBTU volume if explicitly printed on the bill, else null.\n" +
      "8. hm3: hm³ (hundred cubic meters) if explicitly printed on the bill, else null.\n" +
      "9. category: In Pakistan, domestic consumers are classified as 'Protected' or 'Non-protected'. ONLY return 'Protected' or 'Non-protected' if EXPLICITLY printed on the bill. If not explicitly printed, return null.\n" +
      "10. fixedCharges: Meter rent / fixed charges in PKR if printed, else null.\n" +
      "11. totalAmount: Net payable amount within due date in PKR (digits only, no commas or Rs), else null.\n" +
      "12. dueDate: Payment due date printed on the bill, else null.\n" +
      "13. notes: Brief explanation if any fields are blurred, cropped, or illegible, else null.";

    if (geminiKey) {
      const ai = getGenAI();
      if (!ai) throw new Error("Could not initialize Gemini client.");

      const match = data.imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match || !match[1] || !match[2]) {
        throw new Error("Invalid image format provided.");
      }

      const mimeType = match[1];
      const base64Data = match[2];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isGasBill: {
                type: Type.BOOLEAN,
                description: "True if image is a recognizable Pakistani gas bill (SSGC or SNGPL)",
              },
              provider: {
                type: Type.STRING,
                description: "Gas utility provider: SSGC or SNGPL, or null",
                nullable: true,
              },
              consumerNumber: {
                type: Type.STRING,
                description: "Consumer ID or account number printed on bill, or null",
                nullable: true,
              },
              billingMonth: {
                type: Type.STRING,
                description: "Billing month printed on bill, or null",
                nullable: true,
              },
              consumptionValue: {
                type: Type.NUMBER,
                description: "Numeric gas consumed, or null",
                nullable: true,
              },
              consumptionUnit: {
                type: Type.STRING,
                description: "Unit printed on bill (hm³, m³, MMBTU, ft³), or null",
                nullable: true,
              },
              mmbtu: {
                type: Type.NUMBER,
                description: "MMBTU volume if explicitly printed on bill, or null",
                nullable: true,
              },
              hm3: {
                type: Type.NUMBER,
                description: "hm³ volume if explicitly printed on bill, or null",
                nullable: true,
              },
              category: {
                type: Type.STRING,
                description:
                  "Protected or Non-protected ONLY if explicitly printed on bill, else null",
                nullable: true,
              },
              fixedCharges: {
                type: Type.NUMBER,
                description: "Meter rent / fixed charges in PKR if printed, or null",
                nullable: true,
              },
              totalAmount: {
                type: Type.NUMBER,
                description: "Total payable amount within due date in PKR, or null",
                nullable: true,
              },
              dueDate: {
                type: Type.STRING,
                description: "Payment due date printed on bill, or null",
                nullable: true,
              },
              notes: {
                type: Type.STRING,
                description: "Notes on legibility or missing fields, or null",
                nullable: true,
              },
            },
            required: [
              "isGasBill",
              "provider",
              "consumerNumber",
              "billingMonth",
              "consumptionValue",
              "consumptionUnit",
              "mmbtu",
              "hm3",
              "category",
              "fixedCharges",
              "totalAmount",
              "dueDate",
              "notes",
            ],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("The scan returned empty. Please provide a clearer photo of the gas bill.");

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("Could not parse the scan output. Please try a clearer, higher-resolution photo.");
      }

      const validated = GasBillScanOut.parse(parsed);
      return normalizeResult(validated);
    }

    if (lovableKey) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": lovableKey,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "google/gemini-3.8-flash",
          messages: [
            {
              role: "system",
              content:
                "You read Pakistani Sui Gas utility bills (SNGPL and SSGC). Extract only factual data visibly printed on the bill. NEVER invent, estimate, or hallucinate values. Return null for any unreadable or missing fields. If the image is not a recognizable gas bill, set isGasBill to false.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: promptText,
                },
                { type: "image_url", image_url: { url: data.imageDataUrl } },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "gas_bill_reading", strict: true, schema: gasResponseSchema },
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        if (res.status === 429) {
          throw new Error("Too many scans right now — please try again in a moment.");
        }
        if (res.status === 402) {
          throw new Error("AI scanning quota exceeded. Please check credits.");
        }
        throw new Error(`Failed to process gas bill image (${res.status}). ${body.slice(0, 150)}`);
      }

      const payload = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error("The scan returned empty. Please try a clearer photo.");

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error("Could not understand the gas bill reading. Please try a clearer photo.");
      }

      const validated = GasBillScanOut.parse(parsed);
      return normalizeResult(validated);
    }

    throw new Error("AI is not configured. Please set GEMINI_API_KEY in your environment.");
  });
