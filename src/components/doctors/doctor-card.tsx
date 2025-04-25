import type { Doctor } from '@/services/doctor';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Calendar, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctorId: string) => void;
}

export function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  return (
    <Card className={cn(
        "overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm", // Base styles from Card component
        "transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02]" // Added transition and hover effects
    )}>
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
           <Image
            src={doctor.imageUrl || `https://picsum.photos/seed/${doctor.id}/400/300`}
            alt={`Dr. ${doctor.name}`}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg" // Ensure image corners match card top corners
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold mb-1">{doctor.name}</CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground mb-2">
          <Stethoscope className="mr-1 h-4 w-4" /> {doctor.specialty}
        </CardDescription>
        <p className="text-sm text-muted-foreground">{doctor.experience} years experience</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={() => onBook(doctor.id)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors">
          <Calendar className="mr-2 h-4 w-4" /> Book Appointment
        </Button>
      </CardFooter>
    </Card>
  );
}
