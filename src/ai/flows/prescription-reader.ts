'use server';
/**
 * @fileOverview An AI agent for reading and interpreting doctor prescriptions from images.
 *
 * - prescriptionReader - Reads text from a prescription image.
 * - PrescriptionReaderInput - Input type (prescription image data URI).
 * - PrescriptionReaderOutput - Output type (extracted text).
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PrescriptionReaderInputSchema = z.object({
  prescriptionDataUri: z
    .string()
    .describe(
      "A photo of a doctor's prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PrescriptionReaderInput = z.infer<typeof PrescriptionReaderInputSchema>;

const PrescriptionReaderOutputSchema = z.object({
  extractedText: z.string().describe('The raw text extracted from the prescription image.'),
  // Future enhancement: Add structured data like medication, dosage, frequency
  // medicationDetails: z.array(z.object({
  //   name: z.string(),
  //   dosage: z.string().optional(),
  //   frequency: z.string().optional(),
  // })).optional().describe("Structured details of medications found."),
});
export type PrescriptionReaderOutput = z.infer<typeof PrescriptionReaderOutputSchema>;

export async function prescriptionReader(input: PrescriptionReaderInput): Promise<PrescriptionReaderOutput> {
  return prescriptionReaderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prescriptionReaderPrompt',
  input: {
    schema: PrescriptionReaderInputSchema,
  },
  output: {
    schema: PrescriptionReaderOutputSchema,
  },
  prompt: `You are an AI assistant specialized in reading handwritten and printed medical prescriptions.

Analyze the provided image of a doctor's prescription. Extract all the text content accurately. If possible, identify key information like medication names, dosages, and instructions, but prioritize extracting the full text accurately.

Prescription Image: {{media url=prescriptionDataUri}}

Return the extracted text.
`,
});

const prescriptionReaderFlow = ai.defineFlow<
  typeof PrescriptionReaderInputSchema,
  typeof PrescriptionReaderOutputSchema
>(
  {
    name: 'prescriptionReaderFlow',
    inputSchema: PrescriptionReaderInputSchema,
    outputSchema: PrescriptionReaderOutputSchema,
  },
  async input => {
    // Basic implementation: directly call the prompt
    // Future enhancements could involve pre-processing, OCR refinement, or structuring the output.
    const {output} = await prompt(input);

    if (!output) {
        throw new Error("Failed to get a response from the AI model.");
    }

    // For now, just return the output. If adding structured data, process here.
    return output;
  }
);
