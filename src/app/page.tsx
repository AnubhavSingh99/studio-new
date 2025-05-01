import { Header } from '@/components/Header';
import { ProduceLogger } from '@/components/ProduceLogger';
import { ConditionSuggester } from '@/components/ConditionSuggester';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScanLine, Lightbulb, Tractor } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30 p-4 md:p-8">
        <div className="container mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tractor className="h-6 w-6 text-primary" />
                Log New Produce Batch
              </CardTitle>
              <CardDescription>Enter details about your produce and generate a QR code for traceability.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProduceLogger />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-accent" />
                Optimal Condition Suggestions
              </CardTitle>
               <CardDescription>Get AI-powered suggestions for watering, pest control, and more based on your produce type and location.</CardDescription>
            </CardHeader>
            <CardContent>
              <ConditionSuggester />
            </CardContent>
          </Card>

          {/* Placeholder for Traceability Scan - Feature to be fully implemented */}
           <Card className="lg:col-span-3">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <ScanLine className="h-6 w-6 text-primary" />
                 Trace Produce (Coming Soon)
               </CardTitle>
                <CardDescription>Scan a QR code to view the journey of your produce from farm to table.</CardDescription>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">The traceability scanning feature is under development. Consumers will be able to scan QR codes generated here to see the full history.</p>
                {/* Add QR code scanning UI elements later */}
             </CardContent>
           </Card>
        </div>
      </main>
      <footer className="bg-muted py-4 text-center text-muted-foreground text-sm">
         © {new Date().getFullYear()} AgriTrace. All rights reserved.
      </footer>
    </div>
  );
}
