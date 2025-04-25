/**
 * Represents a medicine item.
 */
export interface Medicine {
  /**
   * The unique identifier for the medicine.
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
   * URL of the medicine image.
   */
  imageUrl?: string;
}

/**
 * Asynchronously retrieves all medicines.
 *
 * @returns A promise that resolves to an array of Medicine objects.
 */
export async function getAllMedicines(): Promise<Medicine[]> {
  // TODO: Implement this by calling an API or database.

  return [
    {
      id: '1',
      name: 'Aspirin',
      description: 'Pain reliever',
      price: 5.99,
      imageUrl: 'https://example.com/aspirin.jpg'
    },
    {
      id: '2',
      name: 'Amoxicillin',
      description: 'Antibiotic',
      price: 12.50,
      imageUrl: 'https://example.com/amoxicillin.jpg'
    }
  ];
}
