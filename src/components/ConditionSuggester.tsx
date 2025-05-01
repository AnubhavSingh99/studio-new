'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Bot, Zap, Droplets, Bug, FlaskConical } from 'lucide-react';
import { suggestOptimalConditions, SuggestOptimalConditionsOutput } from '@/ai/flows/suggest-optimal-conditions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';


// Simple validation for the suggester form
const conditionSchema = z.object({
  produceType: z.string().min(1, 'Produce type is required'),
  origin: z.string().min(1, 'Origin is required (e.g., farm name or region)'),
  // Basic latitude/longitude validation
  latitude: z.coerce.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.coerce.number().min(-180).max(180, 'Invalid longitude'),
});

type ConditionFormData = z.infer<typeof conditionSchema>;

export function ConditionSuggester() {
  const [suggestions, setSuggestions] = useState<SuggestOptimalConditionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ConditionFormData>({
    resolver: zodResolver(conditionSchema),
    defaultValues: {
      produceType: '',
      origin: '',
      latitude: 0, // Default to 0 or prompt user
      longitude: 0,
    },
  });

  const onSubmit = async (data: ConditionFormData) => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const result = await suggestOptimalConditions({
        produceType: data.produceType,
        origin: data.origin,
        location: { lat: data.latitude, lng: data.longitude },
      });
      setSuggestions(result);
    } catch (err) {
      console.error('Error getting suggestions:', err);
      setError('Failed to get suggestions. Please check the input or try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="produceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produce Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Lettuce" {...field} />
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
                <FormLabel>Origin (Farm/Region)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sunny Acres Farm" {...field} />
                </FormControl>
                 <FormMessage />
              </FormItem>
            )}
          />
           <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                    <Input type="number" step="any" placeholder="e.g., 34.05" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                    <Input type="number" step="any" placeholder="e.g., -118.24" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
           </div>


          <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Analyzing...' : 'Get Suggestions'}
          </Button>
        </form>
       </Form>

      {error && (
         <Alert variant="destructive">
           <Zap className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}


      {suggestions && !isLoading && (
        <div className="mt-6 space-y-4 rounded-lg border border-primary/30 bg-background p-4 shadow-sm">
           <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
             <Zap className="h-5 w-5"/> AI Recommendations
            </h3>
           <Separator />
           <div className="space-y-3 text-sm">
             <div className="flex items-start gap-3">
                <Droplets className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium">Watering Schedule:</p>
                    <p className="text-muted-foreground">{suggestions.wateringSchedule}</p>
                </div>
             </div>
             <div className="flex items-start gap-3">
                 <Bug className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                 <div>
                    <p className="font-medium">Pest Control:</p>
                    <p className="text-muted-foreground">{suggestions.pestControl}</p>
                 </div>
             </div>
              <Separator className="my-3"/>
              <div className="flex items-start gap-3">
                 <FlaskConical className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                 <div>
                    <p className="font-medium">Soil pH:</p>
                    <p className="text-muted-foreground">{suggestions.soilPhRecommendation}</p>
                 </div>
             </div>
             <div className="flex items-start gap-3">
                 {/* Placeholder icon - consider a fertilizer bag or similar */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0 mt-0.5 lucide lucide-shovel"><path d="M2 22v-5l5-5 5 5-5 5z"/><path d="M9.5 14.5 16 8"/></svg>
                 <div>
                    <p className="font-medium">Fertilizer:</p>
                    <p className="text-muted-foreground">{suggestions.fertilizerRecommendation}</p>
                 </div>
             </div>
           </div>
        </div>
      )}
        {!suggestions && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-8 min-h-[200px]">
                <Bot className="h-12 w-12 mb-4 text-accent/50" />
                <p>Enter produce details above to get AI-powered growing condition suggestions.</p>
            </div>
        )}
    </div>
  );
}
