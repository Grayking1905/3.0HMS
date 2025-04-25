// src/app/emergency-dashboard/page.tsx
import { EmergencyDashboard } from '@/components/emergency/emergency-dashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function EmergencyDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-destructive">Emergency Alert Dashboard</h1>
      <Card className="shadow-lg rounded-lg border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2" /> Real-Time SOS Alerts
            </CardTitle>
            <CardDescription>Monitor incoming emergency requests and prioritize critical cases.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmergencyDashboard />
          </CardContent>
      </Card>
    </div>
  );
}
