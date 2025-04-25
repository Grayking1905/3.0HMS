'use client';

import React, { useState, useRef } from 'react';
import { prescriptionReader, type PrescriptionReaderInput, type PrescriptionReaderOutput } from '@/ai/flows/prescription-reader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, AlertCircle, FileText, Activity } from 'lucide-react';
import Image from 'next/image';

export function PrescriptionReader() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PrescriptionReaderOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Basic validation (optional: add more checks like size)
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file (JPEG, PNG, GIF, WEBP).');
        setFile(null);
        setPreviewUrl(null);
        return;
      }
      setError(null); // Clear previous errors
      setFile(selectedFile);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null); // Clear previous results
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a prescription image first.');
      return;
    }
    if (!previewUrl) {
        setError('Could not read the selected file.');
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // The previewUrl is already a data URI
      const input: PrescriptionReaderInput = { prescriptionDataUri: previewUrl };
      const response = await prescriptionReader(input);
      setResult(response);
    } catch (err) {
      console.error("Prescription reader failed:", err);
      setError('Failed to analyze prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Upload Prescription</CardTitle>
          <CardDescription>Select an image of your prescription to extract the text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*" // Accept common image types
            className="hidden" // Hide default input, use button instead
            aria-label="Prescription image upload input"
          />
          <Button onClick={handleUploadClick} variant="outline" className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            {file ? `Selected: ${file.name}` : 'Choose Prescription Image'}
          </Button>

          {previewUrl && (
            <div className="mt-4 p-2 border rounded-md flex justify-center max-h-60 overflow-hidden">
              <Image
                src={previewUrl}
                alt="Prescription Preview"
                width={200} // Adjust size as needed
                height={200} // Adjust size as needed
                style={{ objectFit: 'contain' }} // Use contain to avoid cropping
                className="rounded"
              />
            </div>
          )}
        </CardContent>
         <CardFooter>
           <Button onClick={handleSubmit} disabled={loading || !file} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {loading ? (
                 <>
                   <Activity className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                 </>
              ) : (
                 <>
                   <FileText className="mr-2 h-4 w-4" /> Read Prescription
                 </>
              )}
            </Button>
         </CardFooter>
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
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
         </Card>
      )}

      {result && !loading && (
        <Card className="bg-secondary border-l-4 border-primary animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary"/> Extracted Text
            </CardTitle>
            <CardDescription>This is the text recognized from the image. Please verify its accuracy.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap p-4 bg-background rounded-md border font-mono">
                {result.extractedText || "No text extracted."}
            </pre>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
                Disclaimer: AI extraction may not be perfect. Always consult your doctor or pharmacist to confirm prescription details.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
