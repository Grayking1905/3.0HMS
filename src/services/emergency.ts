// src/services/emergency.ts
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy, serverTimestamp, onSnapshot, updateDoc, Timestamp, addDoc } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';

/**
 * Represents emergency contact information (remains unchanged).
 */
export interface EmergencyContact {
  phoneNumber: string;
  name: string;
}

/**
 * Represents the structure of an SOS alert stored in Firestore.
 */
export interface SOSAlert {
  userId: string;
  userName?: string; // Optional: User's name for easier identification
  userEmail?: string; // Optional: User's email
  latitude: number;
  longitude: number;
  timestamp: Timestamp; // Use Firestore Timestamp
  status: 'new' | 'acknowledged' | 'resolved'; // Status of the alert
  message?: string; // Optional message from user
}

/**
 * Represents an SOS alert including its Firestore document ID.
 */
export interface SOSAlertWithId extends SOSAlert {
  id: string;
}

const sosAlertsCollection = collection(db, 'sosAlerts');

/**
 * Sends (saves) an emergency SOS alert to Firestore.
 *
 * @param alertData Data for the SOS alert to be created.
 * @returns A promise that resolves to the ID of the newly created alert document.
 */
export async function sendSOSAlert(alertData: Omit<SOSAlert, 'timestamp' | 'status'>): Promise<string> {
  try {
    const newAlert: Omit<SOSAlert, 'id'> = {
        ...alertData,
        timestamp: serverTimestamp() as Timestamp, // Use server timestamp
        status: 'new', // Default status is 'new'
    };
    const docRef = await addDoc(sosAlertsCollection, newAlert);
    console.log(`SOS alert sent and saved with ID: ${docRef.id} for user ${alertData.userId}`);

    // TODO: Implement actual alert sending mechanism here (SMS, Push Notification, etc.)
    // Example: Fetch emergency contacts for alertData.userId and notify them.
    // Example: Notify nearby registered responders/hospitals based on location.
    console.warn("Actual alert notification (SMS, Push, etc.) needs implementation.");

    return docRef.id;
  } catch (error) {
    console.error("Error sending/saving SOS alert:", error);
    throw new Error("Failed to send SOS alert.");
  }
}

/**
 * Sets up a real-time listener for SOS alerts in Firestore, ordered by timestamp.
 *
 * @param callback Function to call with the array of alerts whenever data changes.
 * @param onError Function to call if an error occurs during listening.
 * @returns An unsubscribe function to stop listening to updates.
 */
export function getRealtimeSOSAlerts(
  callback: (alerts: SOSAlertWithId[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  // Query to get alerts, ordered by timestamp descending (newest first)
  // You might want to filter by status ('new', 'acknowledged') depending on dashboard needs
  const q = query(sosAlertsCollection, orderBy('timestamp', 'desc')); // Add where clauses later if needed e.g. where('status', 'in', ['new', 'acknowledged'])

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const alerts: SOSAlertWithId[] = [];
    querySnapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() } as SOSAlertWithId);
    });
    callback(alerts);
  }, (error) => {
    console.error("Error listening to SOS alerts:", error);
    onError(new Error("Failed to listen for real-time alerts."));
  });

  return unsubscribe;
}

/**
 * Updates the status of a specific SOS alert in Firestore.
 *
 * @param alertId The ID of the alert document to update.
 * @param status The new status ('acknowledged' or 'resolved').
 * @returns A promise that resolves when the update is complete.
 */
export async function updateSOSAlertStatus(alertId: string, status: 'acknowledged' | 'resolved'): Promise<void> {
    try {
        const alertRef = doc(db, 'sosAlerts', alertId);
        await updateDoc(alertRef, {
            status: status,
            // Optionally, add an 'updatedAt' timestamp here if needed
            // updatedAt: serverTimestamp()
        });
        console.log(`SOS alert ${alertId} status updated to ${status}.`);
    } catch (error) {
        console.error(`Error updating status for alert ${alertId}:`, error);
        throw new Error("Failed to update alert status.");
    }
}


// --- Emergency Contact Functions (Placeholder Implementation) ---

/**
 * Retrieves emergency contacts for a given user (Placeholder).
 * In a real app, this would fetch from a 'userProfiles' or similar collection.
 *
 * @param userId The ID of the user.
 * @returns A promise resolving to an array of EmergencyContact objects.
 */
export async function getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  console.warn(`getEmergencyContacts for user ${userId} is a placeholder.`);
  // TODO: Replace with actual Firestore query (e.g., getDoc(doc(db, 'userProfiles', userId)))
  // Assuming contacts are stored within the user's profile document
  try {
      const userProfileRef = doc(db, 'patientRecords', userId); // Assuming contacts are in patientRecords
      const docSnap = await getDoc(userProfileRef);
      if (docSnap.exists() && docSnap.data().emergencyContactName && docSnap.data().emergencyContactPhone) {
          return [{
              name: docSnap.data().emergencyContactName,
              phoneNumber: docSnap.data().emergencyContactPhone
          }];
      } else {
          return []; // No contacts found or profile doesn't exist
      }
  } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      return []; // Return empty on error
  }
}

/**
 * Adds or updates emergency contacts for a user (Placeholder).
 *
 * @param userId The ID of the user.
 * @param contacts An array of EmergencyContact objects.
 * @returns A promise that resolves when the operation is complete.
 */
export async function setEmergencyContacts(userId: string, contacts: EmergencyContact[]): Promise<void> {
   console.warn(`setEmergencyContacts for user ${userId} is a placeholder.`);
   // TODO: Replace with actual Firestore update (e.g., updateDoc or setDoc with merge:true)
   // This might involve updating an array field in the user's profile.
   // For simplicity, let's assume only one contact is stored directly in patientRecords like the profile page structure
    if (contacts.length > 0) {
        const contact = contacts[0]; // Taking only the first contact for this example
        try {
            const userProfileRef = doc(db, 'patientRecords', userId);
            await setDoc(userProfileRef, {
                emergencyContactName: contact.name,
                emergencyContactPhone: contact.phoneNumber
            }, { merge: true }); // Use merge to not overwrite other profile data
        } catch (error) {
            console.error("Error setting emergency contact:", error);
            throw new Error("Failed to set emergency contact.");
        }
    } else {
         // Handle removal if needed, e.g., set fields to null or empty string
         try {
            const userProfileRef = doc(db, 'patientRecords', userId);
             await updateDoc(userProfileRef, {
                emergencyContactName: '',
                emergencyContactPhone: ''
            });
         } catch (error) {
             console.error("Error clearing emergency contact:", error);
             // Decide if this should throw an error or just log
         }
    }
}
