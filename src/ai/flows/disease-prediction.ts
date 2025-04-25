'use server';
/**
 * @fileOverview An AI flow for predicting potential health risks based on patient medical records.
 *
 * - diseasePredictor - Predicts potential health risks based on provided patient data.
 * - DiseasePredictorInput - Input type (medical history, demographics).
 * - DiseasePredictorOutput - Output type (potential risks, recommendations).
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DiseasePredictorInputSchema = z.object({
  medicalHistory: z
    .string()
    .describe('Detailed medical history of the patient, including past diagnoses, treatments, surgeries, chronic conditions, and significant medical events.'),
  dob: z.string().optional().describe("Patient's Date of Birth (YYYY-MM-DD format preferred) for age calculation."),
  bloodGroup: z.string().optional().describe("Patient's blood group (e.g., O+, AB-)."),
  allergies: z.string().optional().describe("Known allergies of the patient."),
  lifestyleFactors: z.string().optional().describe("Optional: Additional lifestyle factors like smoking status, diet, exercise habits, family history relevant to health risks."),
});
export type DiseasePredictorInput = z.infer<typeof DiseasePredictorInputSchema>;

const DiseasePredictorOutputSchema = z.object({
  potentialRisks: z.array(
      z.object({
          risk: z.string().describe('The specific potential health risk identified (e.g., Hypertension, Type 2 Diabetes, Cardiovascular Disease).'),
          explanation: z.string().describe('A brief explanation of why this risk is considered potential based on the provided data.'),
          severity: z.enum(['Low', 'Medium', 'High']).optional().describe('An estimated severity or likelihood level for the identified risk.'),
      })
    ).describe('An array of potential health risks identified from the patient data.'),
  recommendations: z
    .string()
    .optional()
    .describe('General recommendations for preventative measures or further screening based on the identified risks. Should include a strong disclaimer.'),
});
export type DiseasePredictorOutput = z.infer<typeof DiseasePredictorOutputSchema>;

export async function diseasePredictor(input: DiseasePredictorInput): Promise<DiseasePredictorOutput> {
  // Add disclaimer directly here before calling the flow, or ensure the prompt includes it.
  const result = await diseasePredictorFlow(input);
   const disclaimer = "\n\n**Disclaimer:** This prediction is based on AI analysis of the provided data and is not a substitute for professional medical diagnosis or advice. Consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or treatment.";
   if (result.recommendations) {
       result.recommendations += disclaimer;
   } else {
       result.recommendations = disclaimer;
   }
  return result;
}


const prompt = ai.definePrompt({
  name: 'diseasePredictorPrompt',
  input: {
    schema: DiseasePredictorInputSchema,
  },
  output: {
    schema: DiseasePredictorOutputSchema,
  },
  prompt: `You are an AI medical analyst specializing in identifying potential future health risks based on patient history and data. Analyze the following patient information:

Medical History:
{{{medicalHistory}}}

Date of Birth: {{#if dob}}{{dob}}{{else}}Not provided{{/if}}
Blood Group: {{#if bloodGroup}}{{bloodGroup}}{{else}}Not provided{{/if}}
Allergies: {{#if allergies}}{{allergies}}{{else}}Not provided{{/if}}
Lifestyle Factors: {{#if lifestyleFactors}}{{lifestyleFactors}}{{else}}Not provided{{/if}}

Based *only* on the information provided, identify potential future health risks for this patient. For each risk, provide:
1.  The name of the risk (e.g., "Hypertension", "Type 2 Diabetes").
2.  A brief explanation linking the provided data to the potential risk.
3.  Estimate a severity or likelihood level (Low, Medium, High) if possible based on the data.

Provide the output as a structured list under 'potentialRisks'.

Additionally, provide general, non-personalized recommendations for preventative care or screening relevant to the identified risks under 'recommendations'.

**Crucially, emphasize that this is an AI prediction based *only* on the limited data provided and is NOT a medical diagnosis. Advise consulting a healthcare professional.** Do not invent information not present in the input. If the data is insufficient to make a prediction, state that clearly.
`,
});

const diseasePredictorFlow = ai.defineFlow<
  typeof DiseasePredictorInputSchema,
  typeof DiseasePredictorOutputSchema
>(
  {
    name: 'diseasePredictorFlow',
    inputSchema: DiseasePredictorInputSchema,
    outputSchema: DiseasePredictorOutputSchema,
  },
  async input => {
    // Future enhancements could involve calling external medical knowledge bases or tools here.
    const {output} = await prompt(input);

     if (!output) {
        // Handle cases where the model might return nothing or fail
        return {
            potentialRisks: [],
            recommendations: "Could not generate prediction based on the provided data. Please ensure the medical history is detailed enough."
        };
     }

    // Ensure recommendations always exist, even if empty array from model
    if (!output.recommendations) {
      output.recommendations = "No specific recommendations generated based on the provided data. General healthy lifestyle advice applies.";
    }

    return output;
  }
);
