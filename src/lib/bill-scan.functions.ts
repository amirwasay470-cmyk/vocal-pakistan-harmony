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
