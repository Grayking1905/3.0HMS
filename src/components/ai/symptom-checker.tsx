'use client';

import React, { useState } from 'react';
import { symptomChecker, type SymptomCheckerInput, type SymptomCheckerOutput } from '@/ai/flows/symptom-checker';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, AlertCircle, Activity } from 'lucide-react';

export function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<SymptomCheckerOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
        setError('Please describe your symptoms.');
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const input: SymptomCheckerInput = { symptoms };
      const response = await symptomChecker(input);
      setResult(response);
    } catch (err) {
      console.error("Symptom checker failed:", err);
      setError('Failed to get analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Describe your symptoms in detail (e.g., 'I have a fever of 101°F, a sore throat, and a dry cough for 3 days.')"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={4}
          className="focus-visible:ring-accent"
          aria-label="Symptom description input"
          required
        />
        <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          {loading ? (
             <>
               <Activity className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
             </>
          ) : (
            'Check Symptoms'
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-4">
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                     <Skeleton className="h-4 w-3/4" />
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                     <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-4/5" />
                </CardContent>
            </Card>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <Card className="bg-secondary border-l-4 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-primary"/> Potential Causes</CardTitle>
              <CardDescription>Based on your symptoms, here are some possibilities. This is not a diagnosis.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{result.potentialCauses}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted border-l-4 border-accent">
            <CardHeader>
              <CardTitle className="flex items-center"><AlertCircle className="mr-2 h-5 w-5 text-accent"/> General Advice</CardTitle>
               <CardDescription>Please remember this advice is general. Consult a healthcare professional for personal medical guidance.</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-sm whitespace-pre-wrap">{result.advice}</p>
            </CardContent>
          </Card>
           <Alert variant="default" className="mt-4">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Disclaimer</AlertTitle>
             <AlertDescription>
                This AI assistant provides information for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
             </AlertDescription>
           </Alert>
        </div>
      )}
    </div>
  );
}
