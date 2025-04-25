
// src/app/admin/fraud-dashboard/page.tsx
import { FraudDashboard } from '@/components/admin/fraud-dashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function FraudDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-destructive">Fraud Detection Dashboard</h1>
      <Card className="shadow-lg rounded-lg border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <ShieldAlert className="mr-2" /> AI-Generated Fraud Alerts
            </CardTitle>
            <CardDescription>Monitor potentially suspicious insurance claims and prescriptions flagged by the AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <FraudDashboard />
          </CardContent>
      </Card>
    </div>
  );
}
