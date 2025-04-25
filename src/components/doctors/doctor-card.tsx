import type { Doctor } from '@/services/doctor';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Calendar, Stethoscope } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctorId: string) => void;
}

export function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl rounded-lg">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
           <Image
            src={doctor.imageUrl || `https://picsum.photos/seed/${doctor.id}/400/300`}
            alt={`Dr. ${doctor.name}`}
            layout="fill"
            objectFit="cover"
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
        <Button onClick={() => onBook(doctor.id)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Calendar className="mr-2 h-4 w-4" /> Book Appointment
        </Button>
      </CardFooter>
    </Card>
  );
}
