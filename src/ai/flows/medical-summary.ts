//Medical Summary
'use server';
/**
 * @fileOverview A medical record summarization AI agent.
 *
 * - summarizeMedicalRecord - A function that handles the summarization of medical records.
 * - SummarizeMedicalRecordInput - The input type for the summarizeMedicalRecord function.
 * - SummarizeMedicalRecordOutput - The return type for the summarizeMedicalRecord function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeMedicalRecordInputSchema = z.object({
  medicalRecordDataUri: z
    .string()
    .describe(
      "A medical record PDF file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeMedicalRecordInput = z.infer<typeof SummarizeMedicalRecordInputSchema>;

const SummarizeMedicalRecordOutputSchema = z.object({
  summary: z.string().describe('A summary of the medical record.'),
});
export type SummarizeMedicalRecordOutput = z.infer<typeof SummarizeMedicalRecordOutputSchema>;

export async function summarizeMedicalRecord(input: SummarizeMedicalRecordInput): Promise<SummarizeMedicalRecordOutput> {
  return summarizeMedicalRecordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMedicalRecordPrompt',
  input: {
    schema: z.object({
      medicalRecordDataUri: z
        .string()
        .describe(
          "A medical record PDF file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the medical record.'),
    }),
  },
  prompt: `You are a medical professional summarizing a patient's medical records.\n\nSummarize the following medical record, providing a concise overview of the patient's medical history, including diagnoses, treatments, and relevant medical events.\n\nMedical Record: {{media url=medicalRecordDataUri}}`,
});

const summarizeMedicalRecordFlow = ai.defineFlow<
  typeof SummarizeMedicalRecordInputSchema,
  typeof SummarizeMedicalRecordOutputSchema
>(
  {
    name: 'summarizeMedicalRecordFlow',
    inputSchema: SummarizeMedicalRecordInputSchema,
    outputSchema: SummarizeMedicalRecordOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
