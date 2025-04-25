// src/app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, DocumentData } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Save } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface PatientRecord {
  name: string;
  dob: string; // Date of Birth
  bloodGroup: string;
  allergies: string;
  medicalHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch patient record when user is available
  useEffect(() => {
    if (user) {
      const fetchRecord = async () => {
        setLoading(true);
        setError(null);
        const recordRef = doc(db, 'patientRecords', user.uid);
        try {
          const docSnap = await getDoc(recordRef);
          if (docSnap.exists()) {
            setRecord(docSnap.data() as PatientRecord);
          } else {
            // Initialize with default values if no record exists
            setRecord({
                name: user.displayName || '',
                dob: '',
                bloodGroup: '',
                allergies: '',
                medicalHistory: '',
                emergencyContactName: '',
                emergencyContactPhone: '',
            });
            console.log('No patient record found, initializing.');
          }
        } catch (err) {
          console.error("Error fetching patient record:", err);
          setError("Failed to load patient record. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchRecord();
    } else if (!authLoading) {
        // If auth is done loading and there's no user, stop loading record
        setLoading(false);
        setRecord(null); // Clear any previous record
    }
  }, [user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!record) return;
    const { name, value } = e.target;
    setRecord({ ...record, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !record) {
        setError("User not logged in or record not loaded.");
        return;
    }

    setIsSaving(true);
    setError(null);
    const recordRef = doc(db, 'patientRecords', user.uid);

    try {
      await setDoc(recordRef, record, { merge: true }); // Use merge to avoid overwriting fields not in the form
      toast({
        title: 'Profile Updated',
        description: 'Your patient record has been saved successfully.',
      });
    } catch (err) {
      console.error("Error saving patient record:", err);
      setError("Failed to save patient record. Please try again.");
      toast({
        title: 'Error Saving',
        description: 'Could not save your patient record.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
        <div className="container mx-auto py-8">
            <Alert variant="destructive">
                 <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not Logged In</AlertTitle>
                <AlertDescription>Please log in to view and manage your profile.</AlertDescription>
            </Alert>
        </div>
    );
  }

  if (error) {
     return (
         <div className="container mx-auto py-8">
             <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Error</AlertTitle>
                 <AlertDescription>{error}</AlertDescription>
             </Alert>
         </div>
     );
  }

  if (!record) {
     // Should not happen if logic is correct, but added as a fallback
     return <div className="container mx-auto py-8">Could not load patient record.</div>;
  }


  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Patient Record</CardTitle>
          <CardDescription>Manage your personal and medical information.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Basic Information */}
             <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" value={record.name} onChange={handleInputChange} placeholder="Your full name" required />
                    </div>
                    <div>
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input id="dob" name="dob" type="date" value={record.dob} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="bloodGroup">Blood Group</Label>
                        <Input id="bloodGroup" name="bloodGroup" value={record.bloodGroup} onChange={handleInputChange} placeholder="e.g., O+" />
                    </div>
                </div>
            </div>

            {/* Medical Information */}
             <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">Medical Information</h3>
                 <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea id="allergies" name="allergies" value={record.allergies} onChange={handleInputChange} placeholder="List any known allergies (e.g., Penicillin, Peanuts)" rows={3}/>
                </div>
                <div>
                    <Label htmlFor="medicalHistory">Medical History</Label>
                    <Textarea id="medicalHistory" name="medicalHistory" value={record.medicalHistory} onChange={handleInputChange} placeholder="Describe relevant medical history (e.g., Asthma diagnosed 2010, Appendectomy 2015)" rows={4}/>
                </div>
            </div>

             {/* Emergency Contact */}
             <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">Emergency Contact</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="emergencyContactName">Contact Name</Label>
                        <Input id="emergencyContactName" name="emergencyContactName" value={record.emergencyContactName} onChange={handleInputChange} placeholder="Emergency contact's name" />
                    </div>
                     <div>
                        <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                        <Input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" value={record.emergencyContactPhone} onChange={handleInputChange} placeholder="Emergency contact's phone" />
                    </div>
                 </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {isSaving ? (
                 <>
                   <Save className="mr-2 h-4 w-4 animate-spin" /> Saving...
                 </>
              ) : (
                 <>
                   <Save className="mr-2 h-4 w-4" /> Save Changes
                 </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}


function ProfileSkeleton() {
    return (
        <div className="container mx-auto py-8">
             <Card className="max-w-2xl mx-auto shadow-lg">
                 <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2"/>
                    <Skeleton className="h-4 w-2/3"/>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    {/* Basic Info Skeleton */}
                    <div className="space-y-2">
                         <Skeleton className="h-6 w-1/4 mb-4"/>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1"><Skeleton className="h-4 w-1/5"/><Skeleton className="h-10 w-full"/></div>
                             <div className="space-y-1"><Skeleton className="h-4 w-1/4"/><Skeleton className="h-10 w-full"/></div>
                              <div className="space-y-1"><Skeleton className="h-4 w-1/4"/><Skeleton className="h-10 w-full"/></div>
                         </div>
                    </div>
                     {/* Medical Info Skeleton */}
                     <div className="space-y-2">
                         <Skeleton className="h-6 w-1/3 mb-4"/>
                         <div className="space-y-1"><Skeleton className="h-4 w-1/6"/><Skeleton className="h-20 w-full"/></div>
                         <div className="space-y-1"><Skeleton className="h-4 w-1/4"/><Skeleton className="h-24 w-full"/></div>
                    </div>
                    {/* Emergency Contact Skeleton */}
                    <div className="space-y-2">
                         <Skeleton className="h-6 w-1/3 mb-4"/>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1"><Skeleton className="h-4 w-1/4"/><Skeleton className="h-10 w-full"/></div>
                             <div className="space-y-1"><Skeleton className="h-4 w-1/4"/><Skeleton className="h-10 w-full"/></div>
                         </div>
                    </div>
                 </CardContent>
                 <CardFooter>
                    <Skeleton className="h-10 w-32" />
                 </CardFooter>
             </Card>
        </div>
    );
}
