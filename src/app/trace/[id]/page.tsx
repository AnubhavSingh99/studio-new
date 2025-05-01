'use client'; // Needs client-side interaction for fetching and potentially location

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Correct hook for App Router
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, ServerCrash, Leaf, CalendarDays, Scale, MapPin, Sun, Thermometer, Droplets, Bug, FlaskConical, Truck, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns'; // For date formatting
import { Header } from '@/components/Header'; // Assuming you want the header here too

// Define the expected structure of the produce data fetched from the API
interface ProduceDetails {
  _id: string;
  produceType: string;
  quantity: number;
  origin: string;
  farmingPractices?: string;
  transportationDetails?: string;
  loggedAt: string; // ISO date string
  blockchainTransactionHash: string; // Simulated hash
}

export default function TraceabilityPage() {
  const params = useParams();
  const id = params.id as string; // Extract ID from URL path

  const [produceData, setProduceData] = useState<ProduceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Produce ID not found in URL.");
      setIsLoading(false);
      return;
    }

    const fetchProduceData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/produce/trace/${id}`);
        if (!response.ok) {
            const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch data (Status: ${response.status})`);
        }
        const data: ProduceDetails = await response.json();
        setProduceData(data);
      } catch (err) {
        console.error("Error fetching produce data:", err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to load produce details: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduceData();
  }, [id]); // Re-run effect if ID changes

  return (
    <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-secondary/30 p-4 md:p-8">
            <div className="container mx-auto max-w-2xl">
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Leaf className="h-6 w-6" /> Produce Traceability Details
                </CardTitle>
                <CardDescription>
                    Tracking the journey of produce batch ID: <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{id}</span>
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p>Loading produce details...</p>
                    </div>
                )}
                {error && !isLoading && (
                    <Alert variant="destructive">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>Error Loading Data</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {produceData && !isLoading && !error && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem icon={Leaf} label="Produce Type" value={produceData.produceType} />
                            <InfoItem icon={Scale} label="Quantity" value={produceData.quantity.toString()} />
                            <InfoItem icon={MapPin} label="Origin" value={produceData.origin} />
                            <InfoItem icon={CalendarDays} label="Logged On" value={format(new Date(produceData.loggedAt), 'PPP p')} />
                        </div>

                        { (produceData.farmingPractices || produceData.transportationDetails) && <Separator /> }

                        {produceData.farmingPractices && (
                             <InfoItem icon={Sun} label="Farming Practices" value={produceData.farmingPractices} />
                        )}

                         {produceData.transportationDetails && (
                             <InfoItem icon={Truck} label="Transportation" value={produceData.transportationDetails} />
                        )}

                        <Separator />

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1"><Info className="h-4 w-4"/>Record Details</h4>
                            <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                                Database ID: {produceData._id}<br />
                                Blockchain Tx (Simulated): {produceData.blockchainTransactionHash}
                            </p>
                        </div>
                    </div>
                )}
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


// Helper component for displaying information items
interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <div>
                <p className="font-medium">{label}:</p>
                <p className="text-muted-foreground">{value}</p>
            </div>
        </div>
    )
}

