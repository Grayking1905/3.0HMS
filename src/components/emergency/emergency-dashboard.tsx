// src/components/emergency/emergency-dashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getRealtimeSOSAlerts, updateSOSAlertStatus, type SOSAlertWithId } from '@/services/emergency';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, MapPin, Siren, Activity } from 'lucide-react'; // Added Activity
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

export function EmergencyDashboard() {
  const [alerts, setAlerts] = useState<SOSAlertWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAlertId, setUpdatingAlertId] = useState<string | null>(null); // Track which alert is being updated
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = getRealtimeSOSAlerts(
      (newAlerts) => {
        // Sort alerts: Newest first, then by status (new > acknowledged > resolved)
        newAlerts.sort((a, b) => {
             const statusOrder = { 'new': 1, 'acknowledged': 2, 'resolved': 3 };
             if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
             // For same status, sort by timestamp descending (newest first)
            const timeA = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : Date.parse(a.timestamp as any);
            const timeB = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : Date.parse(b.timestamp as any);
            return timeB - timeA;
        });
        setAlerts(newAlerts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching real-time alerts:", err);
        setError("Failed to load alerts. Please check your connection or try again later.");
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

 const handleUpdateStatus = async (alertId: string, status: 'acknowledged' | 'resolved') => {
    setUpdatingAlertId(alertId); // Indicate loading state for this specific alert
    try {
        await updateSOSAlertStatus(alertId, status);
        toast({
            title: 'Status Updated',
            description: `Alert ${alertId.substring(0,6)}... marked as ${status}.`,
        });
    } catch (err) {
        console.error("Failed to update alert status:", err);
        toast({
            title: 'Update Failed',
            description: `Could not update status for alert ${alertId.substring(0,6)}...`,
            variant: 'destructive',
        });
    } finally {
        setUpdatingAlertId(null); // Clear loading state for this alert
    }
 };

 const getStatusBadgeVariant = (status: SOSAlertWithId['status']): "default" | "secondary" | "destructive" | "outline" => {
     switch (status) {
         case 'new': return 'destructive';
         case 'acknowledged': return 'secondary'; // Yellow/Orange might be better, using secondary for now
         case 'resolved': return 'default'; // Use default (greenish/teal) for resolved
         default: return 'outline';
     }
 };

 const getStatusIcon = (status: SOSAlertWithId['status']): React.ReactNode => {
     switch (status) {
         case 'new': return <Siren className="h-4 w-4 mr-1 text-destructive" />;
         case 'acknowledged': return <Activity className="h-4 w-4 mr-1 text-secondary-foreground" />; // Using Activity for acknowledged
         case 'resolved': return <CheckCircle className="h-4 w-4 mr-1 text-primary" />;
         default: return <AlertCircle className="h-4 w-4 mr-1 text-muted-foreground" />;
     }
 }


  if (loading) {
    return <DashboardSkeleton />;
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
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
             <CheckCircle className="mx-auto h-12 w-12 mb-4 text-primary" />
            <p>No active emergency alerts at the moment.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id} className={alert.status === 'new' ? 'bg-destructive/10' : alert.status === 'acknowledged' ? 'bg-secondary/50' : ''}>
                <TableCell>
                   <Badge variant={getStatusBadgeVariant(alert.status)} className="flex items-center w-fit">
                      {getStatusIcon(alert.status)}
                      {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                   </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{alert.userId.substring(0, 8)}...</TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {alert.timestamp instanceof Timestamp
                        ? formatDistanceToNow(alert.timestamp.toDate(), { addSuffix: true })
                        : 'Invalid Date'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-muted-foreground">
                     <MapPin className="h-4 w-4 mr-1" />
                    {alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)}
                     {/* Basic map link - replace with proper map component later if needed */}
                     <a href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline">(Map)</a>
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                   {alert.status === 'new' && (
                      <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleUpdateStatus(alert.id, 'acknowledged')}
                         disabled={updatingAlertId === alert.id}
                      >
                         {updatingAlertId === alert.id ? <Activity className="h-4 w-4 animate-spin mr-1" /> : <Activity className="h-4 w-4 mr-1" />}
                         Acknowledge
                      </Button>
                   )}
                  {alert.status !== 'resolved' && (
                    <Button
                      variant="default" // Changed to default (primary color)
                      size="sm"
                      onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                      disabled={updatingAlertId === alert.id}
                       className="bg-primary hover:bg-primary/90"
                    >
                       {updatingAlertId === alert.id ? <Activity className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                      Resolve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function DashboardSkeleton() {
    return (
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-5 w-20" /></TableHead>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-32" /></TableHead>
              <TableHead><Skeleton className="h-5 w-40" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                <TableCell className="text-right space-x-2">
                    <Skeleton className="h-8 w-24 inline-block" />
                    <Skeleton className="h-8 w-20 inline-block" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    );
}
