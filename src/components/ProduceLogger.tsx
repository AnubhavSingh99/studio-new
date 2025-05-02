'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Keep Label import if used elsewhere, otherwise remove
import { Textarea } from '@/components/ui/textarea';
import { QrCode, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components

const produceSchema = z.object({
  produceType: z.string().min(1, 'Produce type is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  origin: z.string().min(1, 'Origin details are required'),
  farmingPractices: z.string().optional(),
  transportationDetails: z.string().optional(),
});

type ProduceFormData = z.infer<typeof produceSchema>;

export function ProduceLogger() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null); // Store the full URL
  const [loggedProduceId, setLoggedProduceId] = useState<string | null>(null); // Store the ID for display/confirmation
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); // Initialize toast

  const form = useForm<ProduceFormData>({
    resolver: zodResolver(produceSchema),
    defaultValues: {
      produceType: '',
      quantity: 1,
      origin: '',
      farmingPractices: '',
      transportationDetails: '',
    },
  });

  const onSubmit = async (data: ProduceFormData) => {
    setIsGenerating(true);
    setError(null);
    setQrCodeDataUrl(null);
    setLoggedProduceId(null);
    console.log('Submitting produce data:', data);

    try {
      const response = await fetch('/api/produce/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetails = `${errorData.error}${errorData.details ? `: ${JSON.stringify(errorData.details)}` : ''}`;
        } catch (e) {
            // Ignore if response body is not JSON or empty
            console.warn("Could not parse error response JSON:", e);
        }
        throw new Error(errorDetails);
      }

      const result = await response.json();
      const produceId = result.id;

      if (!produceId) {
          throw new Error('API did not return an ID');
      }

      console.log('Produce logged successfully with ID:', produceId);
      setLoggedProduceId(produceId);


      // Generate QR code content pointing to a future traceability page
      // Replace 'YOUR_DOMAIN' with your actual domain when deployed
      const traceabilityUrl = `${window.location.origin}/trace/${produceId}`; // Use relative origin for flexibility
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(traceabilityUrl)}`;

      setQrCodeDataUrl(qrApiUrl);

      toast({
        title: "Produce Logged",
        description: `Batch successfully logged with ID: ${produceId.substring(0, 8)}...`, // Show partial ID
        variant: "default",
      });
      form.reset(); // Clear form after successful submission

    } catch (err) {
      console.error('Error logging produce:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to log produce: ${message}. Please check console for details or try again.`);
       toast({
         title: "Error Logging Produce",
         description: message,
         variant: "destructive",
       });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="produceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produce Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Organic Tomatoes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity (e.g., kg, units)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin (Farm Name/Region)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Green Valley Farms, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="farmingPractices"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farming Practices (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Organic certified, sustainable methods" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transportationDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transportation Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Refrigerated truck, shipped on 2024-07-28" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit" disabled={isGenerating} className="w-full bg-primary hover:bg-primary/90">
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? 'Logging & Generating QR...' : 'Log Produce & Generate QR'}
            </Button>
          </form>
        </Form>
          {error && (
             <Alert variant="destructive" className="mt-4">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>Logging Error</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}
       </div>

      <div className="flex items-center justify-center">
        {isGenerating && (
          <div className="flex flex-col items-center text-muted-foreground">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-2">Generating Traceability QR Code...</p>
            <p className="text-xs">(Connecting to database...)</p>
          </div>
        )}
        {qrCodeDataUrl && loggedProduceId && !isGenerating && (
          <Card className="w-full max-w-xs text-center shadow-lg border-accent">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-accent">
                 <CheckCircle className="h-5 w-5" /> Produce Logged!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">Record ID:</p>
              <p className="text-xs font-mono bg-muted px-2 py-1 rounded mb-3 break-all">{loggedProduceId}</p>
              <p className="text-sm text-muted-foreground mb-4">Scan this QR code for traceability:</p>
               <Image
                    src={qrCodeDataUrl} // Use the generated URL
                    alt="Generated QR Code"
                    width={150}
                    height={150}
                    className="mx-auto rounded-md border p-1 bg-white"
                    data-ai-hint="qr code"
                    unoptimized // Recommended for external QR code APIs if optimization causes issues
                />
            </CardContent>
             <CardFooter className="text-xs text-muted-foreground justify-center">
                Data stored in MongoDB.
             </CardFooter>
          </Card>
        )}
         {!qrCodeDataUrl && !isGenerating && !error && ( // Hide placeholder if there's an error
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-8 h-full w-full max-w-xs">
                <QrCode className="h-16 w-16 mb-4 text-primary/50" />
                <p>Your generated QR code will appear here once you log the produce.</p>
            </div>
         )}
      </div>
    </div>
  );
}
