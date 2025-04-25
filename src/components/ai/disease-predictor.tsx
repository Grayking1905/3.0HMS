'use client';

import React, { useState } from 'react';
import { diseasePredictor, type DiseasePredictorInput, type DiseasePredictorOutput } from '@/ai/flows/disease-prediction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { HeartPulse, AlertCircle, Activity, ShieldCheck, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DiseasePredictorProps {
  patientData: {
    medicalHistory: string;
    dob?: string;
    bloodGroup?: string;
    allergies?: string;
    // Add other fields as needed by the AI flow
  };
}

export function DiseasePredictor({ patientData }: DiseasePredictorProps) {
  const [result, setResult] = useState<DiseasePredictorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!patientData.medicalHistory?.trim()) {
      setError('Medical history is required for prediction.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const input: DiseasePredictorInput = {
        medicalHistory: patientData.medicalHistory,
        dob: patientData.dob,
        bloodGroup: patientData.bloodGroup,
        allergies: patientData.allergies,
        // You could add a field for lifestyle factors if collected
        // lifestyleFactors: 'Example: Smoker, Sedentary'
      };
      const response = await diseasePredictor(input);
      setResult(response);
    } catch (err: any) {
      console.error("Disease predictor failed:", err);
      setError(err.message || 'Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadgeVariant = (severity?: 'Low' | 'Medium' | 'High'): "default" | "secondary" | "destructive" => {
    switch (severity) {
        case 'High': return 'destructive';
        case 'Medium': return 'secondary'; // Use secondary for Medium, or choose another style
        case 'Low':
        default: return 'default'; // Use default (primary) for Low or undefined
    }
   };

  return (
    <div className="space-y-6">
      <Card className="shadow-md border border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <BrainCircuit className="mr-2 h-5 w-5" /> AI Health Risk Prediction
          </CardTitle>
          <CardDescription>
            Analyze your medical record to identify potential future health risks. This tool provides informational insights and is not a substitute for professional medical advice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePredict} disabled={loading || !patientData.medicalHistory} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            {loading ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" /> Analyzing Record...
              </>
            ) : (
              <>
                <HeartPulse className="mr-2 h-4 w-4" /> Predict Potential Risks
              </>
            )}
          </Button>
           {!patientData.medicalHistory && (
                <p className="text-sm text-destructive mt-2">Medical history is missing from your profile. Please update it to enable prediction.</p>
            )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
         <Card>
            <CardHeader>
                <Skeleton className="h-7 w-2/5" /> {/* Title */}
                <Skeleton className="h-4 w-4/5" /> {/* Description */}
            </CardHeader>
             <CardContent className="space-y-4">
                 {/* Skeleton for Accordion items */}
                 <div className="space-y-2">
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-full" />
                 </div>
                 <Skeleton className="h-5 w-1/3 mt-4" /> {/* Recommendations title */}
                 <Skeleton className="h-16 w-full" /> {/* Recommendations content */}
                 <Skeleton className="h-12 w-full mt-4" /> {/* Disclaimer */}
             </CardContent>
         </Card>
      )}

      {result && !loading && (
        <Card className="bg-secondary border-l-4 border-primary animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="flex items-center"><HeartPulse className="mr-2 h-5 w-5 text-primary"/> Potential Health Risks Analysis</CardTitle>
             <CardDescription>The following potential risks were identified based on the provided data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.potentialRisks && result.potentialRisks.length > 0 ? (
                 <Accordion type="single" collapsible className="w-full">
                    {result.potentialRisks.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index} className="border-b border-border">
                            <AccordionTrigger className="text-base hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                    <span>{item.risk}</span>
                                    {item.severity && (
                                        <Badge variant={getSeverityBadgeVariant(item.severity)} className="ml-auto">
                                            {item.severity} Risk
                                        </Badge>
                                    )}
                                </div>
                            </AccordionTrigger>
                             <AccordionContent className="text-sm text-muted-foreground px-2">
                               {item.explanation}
                             </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <p className="text-sm text-muted-foreground">No specific potential risks identified based on the provided information.</p>
            )}

            {result.recommendations && (
              <div className="mt-6 pt-4 border-t border-border">
                 <h4 className="font-semibold mb-2 flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-accent" />Recommendations & Disclaimer</h4>
                <p className="text-sm whitespace-pre-wrap">{result.recommendations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
