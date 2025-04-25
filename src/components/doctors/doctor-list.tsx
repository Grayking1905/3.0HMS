// src/components/doctors/doctor-list.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { Doctor } from '@/services/doctor';
import { getAllDoctors, getDoctor } from '@/services/doctor'; // Use Firestore service
import { DoctorCard } from './doctor-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCcw } from 'lucide-react'; // Added RefreshCcw
import { useToast } from '@/hooks/use-toast';
import { sendEmail } from '@/services/email';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Button } from '@/components/ui/button'; // Import Button


export function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth(); // Get user from auth context

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDoctors = await getAllDoctors();
       // Add placeholder images if imageUrl is missing
       const doctorsWithImages = fetchedDoctors.map((doc) => ({
         ...doc,
         imageUrl: doc.imageUrl || `https://picsum.photos/seed/${doc.id}/400/300`
       }));
      setDoctors(doctorsWithImages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctors. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleBookAppointment = async (doctorId: string) => {
    // Ensure user is logged in
    if (!user) {
        toast({
            title: 'Login Required',
            description: 'Please log in to book an appointment.',
            variant: 'destructive',
        });
        // Optionally, trigger login flow here
        return;
    }

    const doctor = doctors.find(d => d.id === doctorId); // Find doctor locally first
    if (!doctor) {
        // If not found locally (shouldn't happen often), try fetching directly
         try {
            const fetchedDoctor = await getDoctor(doctorId);
            if (!fetchedDoctor) {
                 toast({ title: 'Error', description: 'Doctor not found.', variant: 'destructive' });
                 return;
            }
            // Use fetchedDoctor for email, etc.
             await sendBookingConfirmation(fetchedDoctor);

         } catch (fetchError) {
             console.error("Error fetching doctor details:", fetchError);
             toast({ title: 'Error', description: 'Could not retrieve doctor details.', variant: 'destructive' });
         }
         return; // Exit after attempting fetch
    }


    // Simulate booking process
    console.log(`Booking appointment with ${doctor.name} for user ${user.email}`);

    await sendBookingConfirmation(doctor);

  };

  const sendBookingConfirmation = async (doctor: Doctor) => {
     if (!user || !user.email) {
         console.error("User or user email is missing for booking confirmation.");
         toast({ title: 'Error', description: 'Could not send confirmation email.', variant: 'destructive' });
         return;
     }

     try {
         await sendEmail({
             to: user.email, // Send to patient
             subject: `Appointment Confirmation with ${doctor.name}`,
             body: `Dear ${user.displayName || 'Patient'},\n\nYour appointment with Dr. ${doctor.name} (${doctor.specialty}) is confirmed.\n\nWe look forward to seeing you!\n\nBest regards,\nCureNova Team` // Updated company name
         });

         // Optional: Send confirmation to doctor if email exists
         if (doctor.email) {
             await sendEmail({
                 to: doctor.email,
                 subject: `New Appointment Booking`,
                 body: `Dr. ${doctor.name},\n\nA new appointment has been booked with you by ${user.displayName} (${user.email}).\n\nPlease check your schedule.\n\nCureNova System` // Updated company name
             });
         }

       toast({
         title: 'Appointment Booked!',
         description: `Your appointment with Dr. ${doctor.name} is confirmed. Check your email (${user.email}) for details.`,
         variant: 'default', // Use default for success
       });
     } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        toast({
         title: 'Booking Successful (Email Failed)',
         description: `Appointment booked with Dr. ${doctor.name}, but failed to send confirmation email. Please contact support if needed.`,
         variant: 'destructive', // Use destructive as email failed
       });
     }
  }


  if (loading) {
    return <DoctorListSkeleton />;
  }

  if (error) {
    return (
        <div className="text-center py-10">
           <Alert variant="destructive" className="max-w-md mx-auto mb-4">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error Loading Doctors</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
           <Button onClick={fetchDoctors} variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" /> Retry
           </Button>
        </div>
    );
  }

   if (doctors.length === 0) {
       return (
         <div className="text-center py-10 text-muted-foreground">
            <p>No doctors available at the moment.</p>
             {/* Optionally add a retry button here too */}
             <Button onClick={fetchDoctors} variant="outline" className="mt-4">
                 <RefreshCcw className="mr-2 h-4 w-4" /> Check Again
             </Button>
         </div>
       );
   }


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map(doctor => (
        <DoctorCard key={doctor.id} doctor={doctor} onBook={handleBookAppointment} />
      ))}
    </div>
  );
}


// Separate Skeleton Component
function DoctorListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
          <CardHeader className="p-0">
            <Skeleton className="h-48 w-full" />
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Dummy Card components (already exist, but good practice to define if separated)
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`border rounded-lg shadow-sm bg-card text-card-foreground ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`${className}`}>{children}</div> // Adjusted padding for skeleton
);
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`${className}`}>{children}</div> // Adjusted padding for skeleton
);
const CardFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex items-center ${className}`}>{children}</div> // Adjusted padding for skeleton
);
