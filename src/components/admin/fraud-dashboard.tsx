
// src/components/admin/fraud-dashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getAllFraudAlerts, updateFraudAlertStatus, type FraudAlert } from '@/services/fraud';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, Eye, ShieldCheck, UserCircle, Activity, MessageSquare, Trash2, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Timestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export function FraudDashboard() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAlertId, setUpdatingAlertId] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FraudAlert['status'] | ''>('');

  const { toast } = useToast();

   const fetchAlerts = async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedAlerts = await getAllFraudAlerts();
            setAlerts(fetchedAlerts);
        } catch (err: any) {
            console.error("Error fetching fraud alerts:", err);
            setError("Failed to load fraud alerts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };


  useEffect(() => {
    fetchAlerts();
     // Optional: Add real-time listener here if needed using onSnapshot
  }, []);

 const handleOpenUpdateDialog = (alert: FraudAlert) => {
    setSelectedAlert(alert);
    setReviewerNotes(alert.reviewerNotes || '');
    setSelectedStatus(alert.status);
    // The DialogTrigger will open the dialog
 };

 const handleStatusUpdate = async () => {
    if (!selectedAlert || !selectedStatus || selectedStatus === 'new') {
      toast({ title: "Invalid Selection", description: "Please select a valid status.", variant: "destructive" });
      return;
    }
    setUpdatingAlertId(selectedAlert.id);
    try {
        await updateFraudAlertStatus(selectedAlert.id, selectedStatus as 'reviewing' | 'dismissed' | 'action_taken', reviewerNotes);
        toast({
            title: 'Status Updated',
            description: `Alert ${selectedAlert.id.substring(0, 6)}... status updated to ${selectedStatus}.`,
        });
        // Refresh alerts list after update
        await fetchAlerts();
        setSelectedAlert(null); // Close dialog by resetting selected alert
        setReviewerNotes('');
        setSelectedStatus('');

    } catch (err) {
        console.error("Failed to update alert status:", err);
        toast({
            title: 'Update Failed',
            description: `Could not update status for alert ${selectedAlert.id.substring(0, 6)}...`,
            variant: 'destructive',
        });
    } finally {
        setUpdatingAlertId(null);
    }
 };


 const getStatusBadgeVariant = (status: FraudAlert['status']): "default" | "secondary" | "destructive" | "outline" => {
     switch (status) {
         case 'new': return 'destructive';
         case 'reviewing': return 'secondary';
         case 'dismissed': return 'outline';
         case 'action_taken': return 'default'; // Primary color for resolved/action taken
         default: return 'outline';
     }
 };

 const getStatusIcon = (status: FraudAlert['status']): React.ReactNode => {
     switch (status) {
         case 'new': return <AlertCircle className="h-4 w-4 mr-1 text-destructive" />;
         case 'reviewing': return <Eye className="h-4 w-4 mr-1 text-secondary-foreground" />;
         case 'dismissed': return <Trash2 className="h-4 w-4 mr-1 text-muted-foreground" />;
         case 'action_taken': return <ShieldCheck className="h-4 w-4 mr-1 text-primary" />;
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
     <Dialog> {/* Wrap table and dialog logic */}
        <div className="space-y-4">
        {alerts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
            <ShieldCheck className="mx-auto h-12 w-12 mb-4 text-primary" />
            <p>No fraud alerts detected.</p>
            </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Score / Confidence</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {alerts.map((alert) => (
                <TableRow key={alert.id} className={alert.status === 'new' ? 'bg-destructive/10' : alert.status === 'reviewing' ? 'bg-secondary/50' : ''}>
                    <TableCell>
                    <Badge variant={getStatusBadgeVariant(alert.status)} className="flex items-center w-fit">
                        {getStatusIcon(alert.status)}
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </Badge>
                    </TableCell>
                    <TableCell>{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</TableCell>
                    <TableCell className="font-mono text-xs flex items-center"><UserCircle className="h-4 w-4 mr-1"/> {alert.patientId.substring(0, 8)}...</TableCell>
                     <TableCell>
                         <div className="flex flex-col">
                             <span className={`font-semibold ${alert.suspicionScore > 0.7 ? 'text-destructive' : alert.suspicionScore > 0.4 ? 'text-secondary-foreground' : ''}`}>
                                 {alert.suspicionScore.toFixed(2)}
                             </span>
                             <span className="text-xs text-muted-foreground">{alert.aiConfidence} Conf.</span>
                         </div>
                     </TableCell>
                    <TableCell className="text-xs max-w-xs truncate" title={alert.details}>{alert.details}</TableCell>
                    <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {alert.timestamp instanceof Timestamp
                            ? formatDistanceToNow(alert.timestamp.toDate(), { addSuffix: true })
                            : 'Invalid Date'}
                    </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenUpdateDialog(alert)}
                            >
                                <Edit className="h-4 w-4 mr-1" /> Review
                            </Button>
                        </DialogTrigger>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
        </div>

        {/* Dialog Content - managed by the Dialog component state */}
        <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
                <DialogTitle>Review Fraud Alert</DialogTitle>
                <DialogDescription>
                    Review the details of the potential fraud alert and update its status. Alert ID: {selectedAlert?.id.substring(0, 8)}...
                </DialogDescription>
            </DialogHeader>
            {selectedAlert && (
                <div className="grid gap-4 py-4">
                    <div className="space-y-1">
                        <h4 className="font-semibold">AI Analysis</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border whitespace-pre-wrap">{selectedAlert.aiReasoning}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status-select">Update Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={(value) => setSelectedStatus(value as FraudAlert['status'])}
                        >
                            <SelectTrigger id="status-select">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="reviewing">Reviewing</SelectItem>
                                <SelectItem value="dismissed">Dismissed</SelectItem>
                                <SelectItem value="action_taken">Action Taken</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reviewer-notes">Reviewer Notes (Optional)</Label>
                        <Textarea
                            id="reviewer-notes"
                            placeholder="Add your observations or actions taken..."
                            value={reviewerNotes}
                            onChange={(e) => setReviewerNotes(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                    onClick={handleStatusUpdate}
                    disabled={updatingAlertId === selectedAlert?.id || !selectedStatus || selectedStatus === 'new'}
                    className="bg-primary hover:bg-primary/90"
                >
                    {updatingAlertId === selectedAlert?.id ? <Activity className="h-4 w-4 animate-spin mr-1" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
                    Update Status
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}

function DashboardSkeleton() {
    return (
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-5 w-20" /></TableHead>
              <TableHead><Skeleton className="h-5 w-16" /></TableHead>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-32" /></TableHead>
              <TableHead><Skeleton className="h-5 w-40" /></TableHead>
              <TableHead><Skeleton className="h-5 w-28" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                 <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    );
}
