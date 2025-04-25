'use client';

import React, { useState, useEffect } from 'react';
import type { Doctor } from '@/services/doctor';
import { getAllDoctors } from '@/services/doctor';
import { DoctorCard } from './doctor-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendEmail } from '@/services/email'; // Import sendEmail

export function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoading(true);
        const fetchedDoctors = await getAllDoctors();
        // Simulate adding diverse placeholder images
        const doctorsWithImages = fetchedDoctors.map((doc, index) => ({
          ...doc,
          imageUrl: `https://picsum.photos/seed/${doc.id || index}/400/300`
        }));
        setDoctors(doctorsWithImages);
        setError(null);
      } catch (err) {
        setError('Failed to fetch doctors. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  const handleBookAppointment = async (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    // Simulate booking process
    console.log(`Booking appointment with ${doctor.name}`);

    // TODO: Replace with actual user email and proper booking logic
    const userEmail = 'patient@example.com'; // Placeholder

    try {
        await sendEmail({
            to: userEmail, // Send to patient
            subject: `Appointment Confirmation with ${doctor.name}`,
            body: `Your appointment with Dr. ${doctor.name} (${doctor.specialty}) is confirmed. We look forward to seeing you!`
        });

        // Optional: Send confirmation to doctor
        // await sendEmail({
        //     to: doctor.email, // Assuming doctor object has an email
        //     subject: `New Appointment Booking`,
        //     body: `A new appointment has been booked with you by ${userEmail}.`
        // });


      toast({
        title: 'Appointment Booked!',
        description: `Your appointment with Dr. ${doctor.name} is confirmed. Check your email for details.`,
        variant: 'default',
      });
    } catch (emailError) {
       console.error("Failed to send confirmation email:", emailError);
       toast({
        title: 'Booking Successful (Email Failed)',
        description: `Appointment booked with Dr. ${doctor.name}, but failed to send confirmation email.`,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden rounded-lg">
            <CardHeader className="p-0">
              <Skeleton className="h-48 w-full" />
            </CardHeader>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
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

  if (error) {
    return (
       <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>Error</AlertTitle>
         <AlertDescription>{error}</AlertDescription>
       </Alert>
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


// Dummy Card component to resolve dependency temporarily
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`border rounded-lg shadow-sm bg-card text-card-foreground ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const CardFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>
);

