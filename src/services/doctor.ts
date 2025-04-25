import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, query, where } from 'firebase/firestore';

/**
 * Represents a doctor's profile stored in Firestore.
 */
export interface Doctor {
    /**
     * The unique identifier for the doctor (same as Firebase Auth UID).
     */
    id: string;
    /**
     * The name of the doctor.
     */
    name: string;
    /**
     * The specialty of the doctor.
     */
    specialty: string;
    /**
     * The doctor's experience in years.
     */
    experience: number;
    /**
     * URL of the doctor's profile image.
     */
    imageUrl?: string;
    /**
     * Optional email for communication/confirmation.
     */
    email?: string;
}

const doctorsCollection = collection(db, 'doctors');

/**
 * Seeds initial doctor data if the collection is empty.
 * This is useful for development/demo purposes.
 */
async function seedInitialDoctors() {
    const snapshot = await getDocs(query(doctorsCollection)); // Limit to check if empty
    if (snapshot.empty) {
        console.log("Seeding initial doctor data...");
        const initialDoctors: Omit<Doctor, 'id'>[] = [
            { name: 'Dr. Anya Sharma', specialty: 'Cardiologist', experience: 12, imageUrl: `https://picsum.photos/seed/doc1/400/300`, email: 'dr.sharma@example.com' },
            { name: 'Dr. Ben Carter', specialty: 'Pediatrician', experience: 8, imageUrl: `https://picsum.photos/seed/doc2/400/300`, email: 'dr.carter@example.com' },
            { name: 'Dr. Chloe Davis', specialty: 'Dermatologist', experience: 5, imageUrl: `https://picsum.photos/seed/doc3/400/300`, email: 'dr.davis@example.com' },
            { name: 'Dr. David Rodriguez', specialty: 'Neurologist', experience: 15, imageUrl: `https://picsum.photos/seed/doc4/400/300`, email: 'dr.rodriguez@example.com' },
            { name: 'Dr. Emily White', specialty: 'General Practitioner', experience: 10, imageUrl: `https://picsum.photos/seed/doc5/400/300`, email: 'dr.white@example.com' },
            { name: 'Dr. Frank Green', specialty: 'Orthopedist', experience: 7, imageUrl: `https://picsum.photos/seed/doc6/400/300`, email: 'dr.green@example.com' },
        ];
        for (const doctorData of initialDoctors) {
            // Using specialty + name for a somewhat unique ID in seeding
            const docId = doctorData.specialty.toLowerCase().replace(/\s+/g, '-') + '-' + doctorData.name.toLowerCase().split(' ')[1];
             const docRef = doc(db, 'doctors', docId);
             // Add the id field to the data being set
            await setDoc(docRef, { ...doctorData, id: docId });
        }
        console.log("Finished seeding doctors.");
    }
}

// Call seed function - might run multiple times on dev server hot reload, but check prevents duplicates.
seedInitialDoctors().catch(console.error);


/**
 * Asynchronously retrieves a doctor's profile by ID from Firestore.
 *
 * @param id The ID of the doctor to retrieve.
 * @returns A promise that resolves to a Doctor object or undefined if not found.
 */
export async function getDoctor(id: string): Promise<Doctor | undefined> {
     try {
         const docRef = doc(db, 'doctors', id);
         const docSnap = await getDoc(docRef);

         if (docSnap.exists()) {
             return { id: docSnap.id, ...docSnap.data() } as Doctor;
         } else {
             console.log(`No doctor found with ID: ${id}`);
             return undefined;
         }
     } catch (error) {
         console.error("Error getting doctor:", error);
         throw new Error("Failed to retrieve doctor data."); // Re-throw or handle as needed
     }
}

/**
 * Asynchronously retrieves all doctor profiles from Firestore.
 *
 * @returns A promise that resolves to an array of Doctor objects.
 */
export async function getAllDoctors(): Promise<Doctor[]> {
    try {
        const querySnapshot = await getDocs(doctorsCollection);
        const doctors: Doctor[] = [];
        querySnapshot.forEach((doc) => {
            doctors.push({ id: doc.id, ...doc.data() } as Doctor);
        });
        return doctors;
    } catch (error) {
        console.error("Error getting all doctors:", error);
        throw new Error("Failed to retrieve doctors list."); // Re-throw or handle as needed
    }
}

/**
 * Adds or updates a doctor's profile in Firestore.
 * If the doctor ID exists, it updates the record. Otherwise, it creates a new one.
 *
 * @param doctorData The doctor data to add or update. The 'id' field will be used as the document ID.
 * @returns A promise that resolves when the operation is complete.
 */
export async function addOrUpdateDoctor(doctorData: Doctor): Promise<void> {
     if (!doctorData.id) {
        throw new Error("Doctor ID is required to add or update.");
     }
     try {
        const docRef = doc(db, 'doctors', doctorData.id);
        await setDoc(docRef, doctorData, { merge: true }); // Use merge to update existing fields or create new doc
        console.log("Doctor data saved successfully for ID:", doctorData.id);
    } catch (error) {
        console.error("Error saving doctor data:", error);
        throw new Error("Failed to save doctor data.");
    }
}
