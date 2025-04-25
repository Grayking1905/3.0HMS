
// src/services/fraud.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { detectFraud, type FraudDetectionInput, type FraudDetectionOutput } from '@/ai/flows/fraud-detection';

/**
 * Represents the structure of a fraud alert stored in Firestore.
 */
export interface FraudAlert {
  id: string; // Firestore document ID
  type: 'claim' | 'prescription';
  referenceId: string; // ID of the claim or prescription document
  patientId: string;
  details: string; // Summary of the claim/prescription details
  aiReasoning: string;
  suspicionScore: number; // Score from AI (0-1)
  aiConfidence: 'Low' | 'Medium' | 'High';
  status: 'new' | 'reviewing' | 'dismissed' | 'action_taken';
  timestamp: Timestamp; // When the alert was generated
  lastUpdated: Timestamp; // When the status was last updated
  reviewerNotes?: string; // Optional notes from human reviewer
}

const fraudAlertsCollection = collection(db, 'fraudAlerts');

/**
 * Analyzes claim or prescription data using the AI flow and logs an alert to Firestore if potentially suspicious.
 *
 * @param input Data for the fraud detection AI flow.
 * @returns A promise resolving to the FraudDetectionOutput from the AI, and the alert ID if one was created.
 */
export async function analyzeAndLogFraud(input: FraudDetectionInput): Promise<{ aiOutput: FraudDetectionOutput, alertId?: string }> {
  try {
    const aiOutput = await detectFraud(input);

    if (aiOutput.isPotentiallySuspicious) {
      const alertData: Omit<FraudAlert, 'id' | 'lastUpdated'> = {
        type: input.analysisType,
        referenceId: input.analysisType === 'claim' ? input.claimData!.claimId : input.prescriptionData!.prescriptionId,
        patientId: input.analysisType === 'claim' ? input.claimData!.patientId : input.prescriptionData!.patientId,
        details: `Type: ${input.analysisType}, ID: ${input.analysisType === 'claim' ? input.claimData!.claimId : input.prescriptionData!.prescriptionId}${input.analysisType === 'claim' ? ', Amount: ' + input.claimData!.claimAmount : ''}`,
        aiReasoning: aiOutput.reasoning,
        suspicionScore: aiOutput.suspicionScore,
        aiConfidence: aiOutput.confidence,
        status: 'new',
        timestamp: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(fraudAlertsCollection, {
          ...alertData,
          lastUpdated: serverTimestamp() // Set lastUpdated on creation as well
      });
      console.log(`Fraud alert logged with ID: ${docRef.id}`);
      return { aiOutput, alertId: docRef.id };
    } else {
      // Not suspicious, no alert logged
      console.log(`Fraud check completed for ${input.analysisType} ID: ${input.analysisType === 'claim' ? input.claimData?.claimId : input.prescriptionData?.prescriptionId}. Not suspicious.`);
      return { aiOutput };
    }
  } catch (error) {
    console.error('Error during fraud analysis and logging:', error);
    // Depending on requirements, you might want to return a specific error structure
    // For now, re-throw the error or return a default non-suspicious output
    throw new Error('Fraud analysis failed.');
    // Alternative: return { aiOutput: { isPotentiallySuspicious: false, suspicionScore: 0, reasoning: 'Analysis failed.', confidence: 'Low' } };
  }
}

/**
 * Retrieves all fraud alerts from Firestore, ordered by timestamp descending.
 *
 * @returns A promise resolving to an array of FraudAlert objects.
 */
export async function getAllFraudAlerts(): Promise<FraudAlert[]> {
  try {
    const q = query(fraudAlertsCollection, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const alerts: FraudAlert[] = [];
    querySnapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() } as FraudAlert);
    });
    return alerts;
  } catch (error) {
    console.error("Error fetching fraud alerts:", error);
    throw new Error("Failed to retrieve fraud alerts.");
  }
}

/**
 * Updates the status and optionally adds notes to a fraud alert.
 *
 * @param alertId The ID of the fraud alert document.
 * @param status The new status for the alert.
 * @param reviewerNotes Optional notes from the reviewer.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateFraudAlertStatus(
  alertId: string,
  status: 'reviewing' | 'dismissed' | 'action_taken',
  reviewerNotes?: string
): Promise<void> {
  try {
    const alertRef = doc(db, 'fraudAlerts', alertId);
    const updateData: Partial<FraudAlert> = {
      status: status,
      lastUpdated: serverTimestamp() as Timestamp,
    };
    if (reviewerNotes !== undefined) {
      updateData.reviewerNotes = reviewerNotes;
    }
    await updateDoc(alertRef, updateData);
    console.log(`Fraud alert ${alertId} status updated to ${status}.`);
  } catch (error) {
    console.error(`Error updating status for fraud alert ${alertId}:`, error);
    throw new Error("Failed to update fraud alert status.");
  }
}
