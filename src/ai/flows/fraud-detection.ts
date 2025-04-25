
'use server';
/**
 * @fileOverview An AI flow for detecting potential fraud in insurance claims and prescriptions.
 *
 * - detectFraud - Analyzes claim or prescription data for potential fraud indicators.
 * - FraudDetectionInput - Input type (claim/prescription details).
 * - FraudDetectionOutput - Output type (suspicion level, reasoning).
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define input schemas for claim and prescription separately for clarity
const InsuranceClaimSchema = z.object({
    claimId: z.string().describe('Unique identifier for the insurance claim.'),
    patientId: z.string().describe("The patient's identifier."),
    providerId: z.string().optional().describe("Identifier for the healthcare provider submitting the claim."),
    procedureCode: z.string().optional().describe("CPT/HCPCS code for the procedure or service."),
    diagnosisCode: z.string().optional().describe("ICD code for the diagnosis."),
    claimAmount: z.number().describe('The amount claimed.'),
    claimDate: z.string().describe('The date the claim was submitted (YYYY-MM-DD).'),
    serviceDate: z.string().optional().describe('The date the service was rendered (YYYY-MM-DD).'),
    description: z.string().optional().describe('A textual description of the service or claim details.'),
}).optional();

const PrescriptionSchema = z.object({
    prescriptionId: z.string().describe('Unique identifier for the prescription.'),
    patientId: z.string().describe("The patient's identifier."),
    doctorId: z.string().describe("Identifier for the prescribing doctor."),
    medicationName: z.string().describe('Name of the prescribed medication.'),
    dosage: z.string().optional().describe('Dosage of the medication.'),
    frequency: z.string().optional().describe('How often the medication should be taken.'),
    quantity: z.number().optional().describe('Quantity prescribed.'),
    prescriptionDate: z.string().describe('The date the prescription was written (YYYY-MM-DD).'),
}).optional();


const FraudDetectionInputSchema = z.object({
    analysisType: z.enum(['claim', 'prescription']).describe("Indicates whether a claim or prescription is being analyzed."),
    claimData: InsuranceClaimSchema.describe("Details of the insurance claim to analyze."),
    prescriptionData: PrescriptionSchema.describe("Details of the prescription to analyze."),
    // Optional context for better analysis
    patientHistorySummary: z.string().optional().describe("Brief summary of patient's relevant medical history or recent activity."),
    providerHistorySummary: z.string().optional().describe("Brief summary of provider's recent claim/prescription patterns if available."),
}).refine(data => data.analysisType === 'claim' ? data.claimData : data.prescriptionData, {
    message: "Either claimData or prescriptionData must be provided based on analysisType.",
    path: ["claimData", "prescriptionData"], // Adjust path as needed
});


export type FraudDetectionInput = z.infer<typeof FraudDetectionInputSchema>;

const FraudDetectionOutputSchema = z.object({
  isPotentiallySuspicious: z.boolean().describe('Indicates if the activity is flagged as potentially suspicious based on the analysis.'),
  suspicionScore: z.number().min(0).max(1).describe('A score from 0 (not suspicious) to 1 (highly suspicious) indicating the likelihood of fraud.'),
  reasoning: z.string().describe('Explanation of why the activity is flagged (or not flagged), highlighting specific indicators found.'),
  confidence: z.enum(['Low', 'Medium', 'High']).describe('Confidence level in the suspicion assessment.'),
});
export type FraudDetectionOutput = z.infer<typeof FraudDetectionOutputSchema>;

export async function detectFraud(input: FraudDetectionInput): Promise<FraudDetectionOutput> {
  // Add disclaimer or context checks if needed before calling the flow
  const result = await fraudDetectionFlow(input);
  result.reasoning += "\n\n**Disclaimer:** This AI analysis identifies *potential* inconsistencies or patterns commonly associated with fraudulent activity. It is NOT a definitive finding of fraud. All flagged items require human review and investigation.";
  return result;
}


const prompt = ai.definePrompt({
  name: 'fraudDetectionPrompt',
  input: {
    schema: FraudDetectionInputSchema,
  },
  output: {
    schema: FraudDetectionOutputSchema,
  },
  prompt: `You are an AI Fraud Detection Analyst for a healthcare system. Your task is to analyze the provided {{analysisType}} data for potential signs of fraud, waste, or abuse.

Analyze the following data:
{{#if (eq analysisType "claim")}}
Claim Details:
- Claim ID: {{claimData.claimId}}
- Patient ID: {{claimData.patientId}}
- Provider ID: {{#if claimData.providerId}}{{claimData.providerId}}{{else}}N/A{{/if}}
- Procedure Code: {{#if claimData.procedureCode}}{{claimData.procedureCode}}{{else}}N/A{{/if}}
- Diagnosis Code: {{#if claimData.diagnosisCode}}{{claimData.diagnosisCode}}{{else}}N/A{{/if}}
- Amount: {{claimData.claimAmount}}
- Claim Date: {{claimData.claimDate}}
- Service Date: {{#if claimData.serviceDate}}{{claimData.serviceDate}}{{else}}N/A{{/if}}
- Description: {{#if claimData.description}}{{claimData.description}}{{else}}N/A{{/if}}
{{/if}}

{{#if (eq analysisType "prescription")}}
Prescription Details:
- Prescription ID: {{prescriptionData.prescriptionId}}
- Patient ID: {{prescriptionData.patientId}}
- Doctor ID: {{prescriptionData.doctorId}}
- Medication: {{prescriptionData.medicationName}}
- Dosage: {{#if prescriptionData.dosage}}{{prescriptionData.dosage}}{{else}}N/A{{/if}}
- Frequency: {{#if prescriptionData.frequency}}{{prescriptionData.frequency}}{{else}}N/A{{/if}}
- Quantity: {{#if prescriptionData.quantity}}{{prescriptionData.quantity}}{{else}}N/A{{/if}}
- Date: {{prescriptionData.prescriptionDate}}
{{/if}}

Optional Context:
- Patient History Summary: {{#if patientHistorySummary}}{{patientHistorySummary}}{{else}}Not Provided{{/if}}
- Provider History Summary: {{#if providerHistorySummary}}{{providerHistorySummary}}{{else}}Not Provided{{/if}}

Consider common fraud indicators such as:
- **For Claims:** Upcoding, unbundling, phantom billing, billing for services not rendered, duplicate claims, excessive services compared to diagnosis/history, inconsistencies between service date and claim date.
- **For Prescriptions:** Doctor shopping (patients getting similar prescriptions from multiple doctors), script mills (doctors prescribing excessively, especially controlled substances), altered prescriptions, unusually high quantities, illogical combinations of drugs.
- **General:** Billing patterns inconsistent with patient history or provider specialty.

Based *only* on the provided data and context, assess the likelihood of fraudulent activity.
1.  Determine if the {{analysisType}} is potentially suspicious (`isPotentiallySuspicious`).
2.  Provide a suspicion score between 0 (low suspicion) and 1 (high suspicion) (`suspicionScore`).
3.  Explain your reasoning clearly, citing specific data points or patterns that contribute to the assessment (`reasoning`). If not suspicious, explain why.
4.  State your confidence level (Low, Medium, High) in this assessment (`confidence`).

**Crucially, DO NOT make definitive statements of fraud.** Your role is to flag items for human review. Frame your reasoning around *potential* issues or inconsistencies. If the data is insufficient for a meaningful analysis, state that clearly in the reasoning and assign a low score and confidence.
`,
});

const fraudDetectionFlow = ai.defineFlow<
  typeof FraudDetectionInputSchema,
  typeof FraudDetectionOutputSchema
>(
  {
    name: 'fraudDetectionFlow',
    inputSchema: FraudDetectionInputSchema,
    outputSchema: FraudDetectionOutputSchema,
  },
  async input => {
    // In a real system, you might fetch additional context (patient/provider history) here if not provided in the input.
    // Example: const history = await getRelevantHistory(input.patientId); input.patientHistorySummary = history;

    const {output} = await prompt(input);

     if (!output) {
        // Handle cases where the model might return nothing or fail
        return {
            isPotentiallySuspicious: false,
            suspicionScore: 0,
            reasoning: "AI analysis could not be completed due to an error or lack of response from the model.",
            confidence: 'Low'
        };
     }

    return output;
  }
);
