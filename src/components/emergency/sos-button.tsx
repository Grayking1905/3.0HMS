// src/components/emergency/sos-button.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Siren, PhoneCall, Activity, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'; // Added AlertCircle, AlertTriangle
import { useAuth } from '@/context/AuthContext';
import { sendSOSAlert } from '@/services/emergency';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export function SOSButton() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  const handleSOSClick = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'You must be logged in to send an SOS alert.',
        variant: 'destructive',
      });
      return;
    }
     setIsConfirming(true); // Open confirmation dialog
  };

  const confirmSOS = () => {
    setIsConfirming(false); // Close dialog
    setIsLoading(true);

    // Get current location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
           const alertData = {
                userId: user!.uid, // User is checked earlier
                userName: user!.displayName || undefined,
                userEmail: user!.email || undefined,
                latitude,
                longitude,
                message: "User triggered SOS button.", // Optional: Add more context if possible
            };
          const alertId = await sendSOSAlert(alertData);
          toast({
            title: 'SOS Alert Sent',
             description: `Emergency services and contacts notified. Alert ID: ${alertId.substring(0,6)}...`,
            variant: 'default', // Use default for success
             duration: 10000, // Longer duration for important message
             action: <CheckCircle className="text-green-500"/>
          });
        } catch (error: any) {
          console.error('Error sending SOS alert:', error);
          toast({
            title: 'SOS Send Failed',
            description: error.message || 'Could not send SOS alert. Please try calling emergency services directly.',
            variant: 'destructive',
             action: <AlertCircle className="text-white"/>
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: 'Location Error',
          description: 'Could not get your location. Please enable location services and try again, or call emergency services.',
          variant: 'destructive',
           action: <AlertCircle className="text-white"/>
        });
        setIsLoading(false);
      },
      { enableHighAccuracy: true } // Request high accuracy
    );
  };

  return (
     <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogTrigger asChild>
            <Button
                variant="destructive"
                size="lg" // Make button prominent
                className={`fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg z-50 transition-all duration-300 ${!isLoading ? 'animate-pulse' : ''}`} // Correctly apply pulse only when not loading, add transition
                onClick={handleSOSClick}
                disabled={isLoading}
                aria-label="Send SOS Emergency Alert"
            >
                {isLoading ? (
                <Activity className="h-8 w-8 animate-spin" />
                ) : (
                <Siren className="h-8 w-8" />
                )}
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"> <AlertTriangle className="mr-2 text-destructive h-5 w-5"/> Confirm Emergency Alert?</AlertDialogTitle>
            <AlertDialogDescription>
                This will immediately send your location and an alert to emergency services and your registered contacts. Only use this in a genuine emergency.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
             <AlertDialogAction
                 onClick={confirmSOS}
                 disabled={isLoading}
                 className="bg-destructive hover:bg-destructive/90" // Destructive action style
             >
                 {isLoading ? <Activity className="h-4 w-4 animate-spin mr-2" /> : <PhoneCall className="mr-2 h-4 w-4" />}
                Confirm SOS
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
