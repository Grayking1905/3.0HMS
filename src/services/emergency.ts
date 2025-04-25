/**
 * Represents emergency contact information.
 */
export interface EmergencyContact {
  /**
   * The phone number of the emergency contact.
   */
  phoneNumber: string;
  /**
   * The name of the emergency contact.
   */
  name: string;
}

/**
 * Represents an emergency SOS alert.
 */
export interface SOSAlert {
  /**
   * The user ID of the person sending the alert.
   */
  userId: string;
  /**
   * The location of the person sending the alert (latitude).
   */
  latitude: number;
  /**
   * The location of the person sending the alert (longitude).
   */
  longitude: number;
}

/**
 * Asynchronously sends an emergency SOS alert to registered contacts and local hospitals.
 *
 * @param alert The SOS alert to send.
 * @returns A promise that resolves when the alert is sent.
 */
export async function sendSOSAlert(alert: SOSAlert): Promise<void> {
  // TODO: Implement this by calling an API or sending SMS/email to emergency contacts and hospitals.
  console.log("Sending SOS alert to registered contacts and local hospitals.");
}

/**
 * Asynchronously retrieves emergency contacts for a given user.
 *
 * @param userId The ID of the user to retrieve emergency contacts for.
 * @returns A promise that resolves to an array of EmergencyContact objects.
 */
export async function getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  // TODO: Implement this by calling an API or database.
  return [
    {
      phoneNumber: "555-123-4567",
      name: "John Doe",
    },
    {
      phoneNumber: "555-987-6543",
      name: "Jane Smith",
    },
  ];
}
