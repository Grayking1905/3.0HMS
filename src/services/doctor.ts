/**
 * Represents a doctor's profile.
 */
export interface Doctor {
    /**
     * The unique identifier for the doctor.
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
}

/**
 * Asynchronously retrieves a doctor's profile by ID.
 *
 * @param id The ID of the doctor to retrieve.
 * @returns A promise that resolves to a Doctor object.
 */
export async function getDoctor(id: string): Promise<Doctor | undefined> {
    // TODO: Implement this by calling an API or database.

    return {
        id: '123',
        name: 'Dr. Smith',
        specialty: 'Cardiologist',
        experience: 10,
        imageUrl: 'https://example.com/dr-smith.jpg'
    };
}

/**
 * Asynchronously retrieves all doctor profiles.
 *
 * @returns A promise that resolves to an array of Doctor objects.
 */
export async function getAllDoctors(): Promise<Doctor[]> {
    // TODO: Implement this by calling an API or database.

    return [
        {
            id: '123',
            name: 'Dr. Smith',
            specialty: 'Cardiologist',
            experience: 10,
            imageUrl: 'https://example.com/dr-smith.jpg'
        },
        {
            id: '456',
            name: 'Dr. Jones',
            specialty: 'Pediatrician',
            experience: 5,
            imageUrl: 'https://example.com/dr-jones.jpg'
        }
    ];
}
