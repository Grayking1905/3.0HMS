import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, serverTimestamp, query, where, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

/**
 * Represents a medicine item stored in Firestore.
 */
export interface Medicine {
  /**
   * The unique identifier for the medicine (document ID).
   */
  id: string;
  /**
   * The name of the medicine.
   */
  name: string;
  /**
   * The description of the medicine.
   */
  description: string;
  /**
   * The price of the medicine.
   */
  price: number;
  /**
   * URL of the medicine image. Optional.
   */
  imageUrl?: string;
   /**
    * Stock quantity. Optional.
    */
  stock?: number;
  /**
   * Category of the medicine (e.g., Pain Relief, Antibiotics). Optional.
   */
  category?: string;
}

/**
 * Represents an item within an order.
 */
export interface OrderItem {
    medicineId: string;
    name: string;
    quantity: number;
    price: number; // Price per unit at the time of order
}

/**
 * Represents an order placed by a user.
 */
export interface Order {
    id?: string; // Document ID, assigned by Firestore
    userId: string;
    userName?: string; // Optional: User's name for easier viewing
    userEmail?: string; // Optional: User's email
    items: OrderItem[];
    totalAmount: number;
    orderDate: Timestamp; // Use Firestore Timestamp
    status: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress?: any; // Define more specific structure if needed
}


const medicinesCollection = collection(db, 'medicines');
const ordersCollection = collection(db, 'orders');

/**
 * Seeds initial medicine data if the collection is empty.
 */
async function seedInitialMedicines() {
    const snapshot = await getDocs(query(medicinesCollection));
    if (snapshot.empty) {
        console.log("Seeding initial medicine data...");
        const initialMedicines: Omit<Medicine, 'id'>[] = [
            // Prices updated to reflect Rupees (₹)
            { name: 'Paracetamol 500mg', description: 'Relieves mild to moderate pain and reduces fever.', price: 30.00, stock: 150, category: 'Pain Relief', imageUrl: 'https://picsum.photos/seed/paracetamol/200/200' },
            { name: 'Ibuprofen 200mg', description: 'Anti-inflammatory drug for pain relief.', price: 45.50, stock: 120, category: 'Pain Relief', imageUrl: 'https://picsum.photos/seed/ibuprofen/200/200' },
            { name: 'Amoxicillin 500mg', description: 'Antibiotic for bacterial infections (Prescription Required).', price: 120.00, stock: 80, category: 'Antibiotics', imageUrl: 'https://picsum.photos/seed/amoxicillin/200/200' },
            { name: 'Loratadine 10mg', description: 'Antihistamine for allergy relief.', price: 75.00, stock: 200, category: 'Allergy', imageUrl: 'https://picsum.photos/seed/loratadine/200/200' },
            { name: 'Vitamin C 1000mg', description: 'Supplement for immune support.', price: 99.99, stock: 300, category: 'Vitamins', imageUrl: 'https://picsum.photos/seed/vitaminc/200/200' },
            { name: 'Omeprazole 20mg', description: 'Reduces stomach acid (Prescription often required).', price: 150.75, stock: 95, category: 'Gastrointestinal', imageUrl: 'https://picsum.photos/seed/omeprazole/200/200' },
        ];

        for (const medData of initialMedicines) {
            // Using name for a somewhat unique ID in seeding, converting to lowercase and replacing spaces
            const docId = medData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const docRef = doc(db, 'medicines', docId);
             // Add the id field to the data being set
            await setDoc(docRef, { ...medData, id: docId });
        }
        console.log("Finished seeding medicines.");
    }
}

// Call seed function
seedInitialMedicines().catch(console.error);


/**
 * Asynchronously retrieves all medicines from Firestore.
 *
 * @returns A promise that resolves to an array of Medicine objects.
 */
export async function getAllMedicines(): Promise<Medicine[]> {
  try {
    const querySnapshot = await getDocs(medicinesCollection);
    const medicines: Medicine[] = [];
    querySnapshot.forEach((doc) => {
        // Ensure the id from the document snapshot is included
        medicines.push({ id: doc.id, ...doc.data() } as Medicine);
    });
    return medicines;
  } catch (error) {
      console.error("Error getting all medicines:", error);
      throw new Error("Failed to retrieve medicines list.");
  }
}

/**
 * Asynchronously retrieves a single medicine by its ID from Firestore.
 *
 * @param id The ID of the medicine to retrieve.
 * @returns A promise that resolves to a Medicine object or undefined if not found.
 */
export async function getMedicine(id: string): Promise<Medicine | undefined> {
    try {
        const docRef = doc(db, 'medicines', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Medicine;
        } else {
            console.log(`No medicine found with ID: ${id}`);
            return undefined;
        }
    } catch (error) {
        console.error("Error getting medicine:", error);
        throw new Error("Failed to retrieve medicine data.");
    }
}

/**
 * Simulates placing a medicine order and saves it to Firestore.
 *
 * @param user The authenticated user placing the order.
 * @param items An array of items being ordered.
 * @param totalAmount The total cost of the order.
 * @returns A promise that resolves to the ID of the newly created order document.
 */
export async function placeOrder(user: User, items: OrderItem[], totalAmount: number): Promise<string> {
     if (!user) {
        throw new Error("User must be logged in to place an order.");
     }
     if (!items || items.length === 0) {
        throw new Error("Cannot place an empty order.");
     }

     const newOrder: Omit<Order, 'id'> = {
         userId: user.uid,
         userName: user.displayName || 'N/A',
         userEmail: user.email || 'N/A',
         items: items,
         totalAmount: totalAmount,
         orderDate: serverTimestamp() as Timestamp, // Use serverTimestamp for accurate time
         status: 'placed',
         // shippingAddress: {} // Add logic to get shipping address if needed
     };

     try {
         const docRef = await addDoc(ordersCollection, newOrder);
         console.log("Order placed successfully with ID:", docRef.id);
         return docRef.id;
     } catch (error) {
         console.error("Error placing order:", error);
         throw new Error("Failed to place the order.");
     }
}

// Optional: Function to add/update medicine (for admin purposes)
/**
 * Adds or updates a medicine in Firestore.
 *
 * @param medicineData The medicine data to add or update.
 * @returns A promise that resolves when the operation is complete.
 */
export async function addOrUpdateMedicine(medicineData: Medicine): Promise<void> {
    if (!medicineData.id) {
        throw new Error("Medicine ID is required to add or update.");
    }
    try {
        const docRef = doc(db, 'medicines', medicineData.id);
        // Ensure the id field is part of the data being set
        await setDoc(docRef, medicineData, { merge: true });
        console.log("Medicine data saved successfully for ID:", medicineData.id);
    } catch (error) {
        console.error("Error saving medicine data:", error);
        throw new Error("Failed to save medicine data.");
    }
}
