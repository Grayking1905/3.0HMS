'use server';
/**
 * @fileOverview An AI-powered symptom checker flow.
 *
 * - symptomChecker - A function that provides potential causes and advice based on described symptoms.
 * - SymptomCheckerInput - The input type for the symptomChecker function.
 * - SymptomCheckerOutput - The return type for the symptomChecker function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SymptomCheckerInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A description of the symptoms the patient is experiencing.'),
});
export type SymptomCheckerInput = z.infer<typeof SymptomCheckerInputSchema>;

const SymptomCheckerOutputSchema = z.object({
  potentialCauses: z
    .string()
    .describe('A list of potential causes for the symptoms.'),
  advice: z.string().describe('General advice for the patient based on the symptoms.'),
});
export type SymptomCheckerOutput = z.infer<typeof SymptomCheckerOutputSchema>;

export async function symptomChecker(input: SymptomCheckerInput): Promise<SymptomCheckerOutput> {
  return symptomCheckerFlow(input);
}

const symptomCheckerPrompt = ai.definePrompt({
  name: 'symptomCheckerPrompt',
  input: {
    schema: z.object({
      symptoms: z
        .string()
        .describe('A description of the symptoms the patient is experiencing.'),
    }),
  },
  output: {
    schema: z.object({
      potentialCauses: z
        .string()
        .describe('A list of potential causes for the symptoms.'),
      advice: z.string().describe('General advice for the patient based on the symptoms.'),
    }),
  },
  prompt: `You are an AI medical assistant. A patient will describe their symptoms to you, and you will respond with a list of potential causes and general advice.

Symptoms: {{{symptoms}}}

Respond in a tone that is both helpful and cautious, reminding the user that this is not a substitute for professional medical advice.
`,
});

const symptomCheckerFlow = ai.defineFlow<
  typeof SymptomCheckerInputSchema,
  typeof SymptomCheckerOutputSchema
>(
  {
    name: 'symptomCheckerFlow',
    inputSchema: SymptomCheckerInputSchema,
    outputSchema: SymptomCheckerOutputSchema,
  },
  async input => {
    const {output} = await symptomCheckerPrompt(input);
    return output!;
  }
);
