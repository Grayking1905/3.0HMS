# Firebase Studio - CureNova

This is a Next.js application built with Firebase Studio, demonstrating various healthcare-related features powered by Firebase and Google AI (Genkit), focusing on innovation and high-quality care.

## Features

*   **User Authentication:** Secure sign-in/sign-up using Firebase Authentication (Google Provider).
*   **Patient Profile:** Manage patient records (name, DOB, medical history, etc.) stored in Firestore.
*   **Doctor Appointments:** Browse doctors and simulate booking appointments (includes email notifications via placeholder service).
*   **Doctor Chat:** Placeholder interface for secure doctor-patient communication.
*   **Online Pharmacy:** Browse medicines, add to cart, and simulate placing orders stored in Firestore.
*   **AI Symptom Checker:** Get potential causes and general advice based on symptom descriptions using Genkit.
*   **AI Prescription Reader:** Upload prescription images to extract text using Genkit and Google AI Vision capabilities.
*   **AI Disease Prediction:** Analyze patient medical history from their profile to predict potential future health risks using Genkit.
*   **Emergency SOS:** Trigger an SOS alert sending user location to Firestore (requires user location permission).
*   **Emergency Dashboard:** Real-time view of incoming SOS alerts from Firestore.
*   **Fraud Detection:** AI analysis of insurance claims and prescriptions to flag potentially fraudulent activity using Genkit, logging alerts to Firestore.
*   **Fraud Dashboard:** Admin view to monitor and manage AI-flagged fraud alerts from Firestore.
*   **UI:** Built with Next.js App Router, TypeScript, Tailwind CSS, and ShadCN UI components.

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm
*   A Firebase Project ([Create one here](https://console.firebase.google.com/))
*   A Google Cloud Project with the Generative Language API enabled.
*   An API Key for Google AI ([Get one here](https://aistudio.google.com/app/apikey))

### Setup

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Configure Firebase:**
    *   Go to your Firebase Project Settings > General tab.
    *   Under "Your apps", find your Web app (or create one if needed).
    *   Select "Config" for the SDK setup and configuration.
    *   Copy the Firebase configuration values.

4.  **Configure Environment Variables:**
    *   Create a file named `.env.local` in the root of the project.
    *   Add the following lines, replacing the placeholder values with your actual Firebase config values and your Google AI API Key:

        ```dotenv
        # Firebase App configuration
        NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
        NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
        # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID" # Optional for Analytics

        # Google Generative AI API Key
        GOOGLE_GENAI_API_KEY="YOUR_GOOGLE_GENAI_API_KEY"
        ```
    *   **Important:** The `.env.local` file is already listed in `.gitignore` to prevent committing your keys.

5.  **Enable Firebase Services:**
    *   Go to your Firebase Console.
    *   Enable **Authentication**:
        *   Navigate to Authentication > Sign-in method.
        *   Enable the **Google** provider.
        *   Ensure your app's domain (e.g., `localhost`) is listed in Authentication > Settings > Authorized domains.
    *   Enable **Firestore Database**:
        *   Navigate to Firestore Database.
        *   Create a database (choose Native mode).
        *   Select a location.
        *   Start in **test mode** for initial development (allows open access - **change security rules for production!**).

### Running the Development Server

1.  **Start the Genkit Development Server (for AI flows):**
    Open a terminal and run:
    ```bash
    npm run genkit:dev
    # or yarn genkit:dev / pnpm genkit:dev
    ```
    This starts the Genkit flow server, typically on port 4000. It will watch for changes in your `src/ai/` directory.

2.  **Start the Next.js Application:**
    Open *another* terminal and run:
    ```bash
    npm run dev
    # or yarn dev / pnpm dev
    ```
    This starts the Next.js app, typically on port 9003.

3.  Open [http://localhost:9003](http://localhost:9003) in your browser to see the application.

## Key Project Files

*   `src/app/` - Next.js App Router pages and layouts.
*   `src/components/` - Reusable UI components (including ShadCN UI).
*   `src/ai/` - Genkit AI flows and configuration.
    *   `src/ai/flows/` - Individual AI flow implementations (Symptom Checker, Prescription Reader, etc.).
    *   `src/ai/ai-instance.ts` - Genkit initialization and configuration.
    *   `src/ai/dev.ts` - Development server entry point for Genkit flows.
*   `src/services/` - Firebase Firestore interaction logic (fetching/updating data for doctors, medicines, orders, alerts, etc.).
*   `src/context/AuthContext.tsx` - Manages Firebase Authentication state.
*   `src/lib/firebase.ts` - Firebase initialization.
*   `src/app/globals.css` - Global styles and Tailwind CSS theme configuration.
*   `tailwind.config.ts` - Tailwind CSS configuration.
*   `components.json` - ShadCN UI configuration.
*   `.env.local` - **(You need to create this)** Environment variables (API keys, etc.).

## Notes

*   **Security Rules:** The default Firestore setup uses test mode rules. **Remember to configure secure Firestore Security Rules before deploying to production.**
*   **Email Service:** The `src/services/email.ts` file contains a placeholder `sendEmail` function. You'll need to integrate a real email service (like SendGrid, Nodemailer with an SMTP provider, or Firebase Extensions) for actual email notifications.
*   **Error Handling:** Basic error handling is included, but robust production applications may require more comprehensive error tracking and reporting.
*   **Admin Roles:** The Fraud Dashboard currently lacks role-based access control. Implement proper authorization checks in a production environment.
