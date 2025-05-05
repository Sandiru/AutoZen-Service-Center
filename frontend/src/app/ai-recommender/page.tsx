
"use client";

import { useState, useEffect, cloneElement } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, Car, AlertCircle } from "lucide-react";
import { apiClient } from '@/lib/api-client'; // Use API client
import type { VehicleMakeDTO, VehicleModelDTO } from '@/types/dto'; // Import DTO types
import { getServiceRecommendations, ServiceRecommendationInput, ServiceRecommendationOutput } from '@/ai/flows/service-recommendation';
import { ProtectedComponent } from '@/components/ProtectedComponent';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Function to parse and render recommendations
const RenderRecommendations = ({ text }: { text: string }) => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const elements: JSX.Element[] = [];

  lines.forEach((line, index) => {
    line = line.trim();
    if (line.startsWith('- ') || line.startsWith('* ')) {
      // Treat as list item
      elements.push(
        <li key={`li-${index}`} className="ml-4 list-disc text-muted-foreground">
          {line.substring(2)}
        </li>
      );
    } else if (line.endsWith(':')) {
        // Treat as heading
        elements.push(<h4 key={`h4-${index}`} className="font-semibold text-primary mt-3 mb-1">{line.slice(0, -1)}</h4>);
        // Add ul wrapper for subsequent list items
        if (lines[index+1]?.match(/^[-*]\s/)) {
            elements.push(<ul key={`ul-${index}`} className="space-y-1"></ul>); // Placeholder for list items
        }
    }
     else if (/^[A-Z\s]+:?$/.test(line) && line.length > 5) { // Check for potential all-caps headings
        elements.push(<h4 key={`h4-${index}`} className="font-semibold text-primary mt-3 mb-1">{line.replace(/:$/, '')}</h4>);
        // Add ul wrapper for subsequent list items
        if (lines[index+1]?.match(/^[-*]\s/)) {
            elements.push(<ul key={`ul-${index}`} className="space-y-1"></ul>); // Placeholder for list items
        }
    }
    else {
      // Treat as paragraph, but if preceded by a heading, add to the last ul
      const lastElement = elements[elements.length - 1];
       if (lastElement?.type === 'ul') {
           // If the previous element was a ul wrapper, assume this line is a list item (even without '-')
            elements.push(
               <li key={`li-${index}`} className="ml-4 list-disc text-muted-foreground">
                 {line}
               </li>
            );
       } else {
            elements.push(<p key={`p-${index}`} className="text-muted-foreground">{line}</p>);
       }
    }
  });

   // Structure the list items correctly within ULs
    const structuredElements: JSX.Element[] = [];
    let currentListItems: JSX.Element[] = [];

    elements.forEach((el, index) => {
        if (el.type === 'ul') {
            // Start collecting list items for this UL
            currentListItems = [];
        } else if (el.type === 'li') {
            // Add list item to the current collection
            currentListItems.push(el);
        } else {
            // If we have collected list items, wrap them in the last UL placeholder
            if (currentListItems.length > 0) {
                 const ulIndex = structuredElements.findIndex(e => e.type === 'ul' && e.key === elements[index-currentListItems.length-1]?.key);
                if(ulIndex !== -1) {
                    structuredElements[ulIndex] = cloneElement(structuredElements[ulIndex], {}, currentListItems);
                } else {
                     // Fallback: if no preceding <ul> found, just add the items directly (less likely with current logic)
                     structuredElements.push(...currentListItems);
                }
                currentListItems = []; // Reset collection
            }
             // Add the non-list element
             structuredElements.push(el);
        }
    });
     // Handle any remaining list items at the end
     if (currentListItems.length > 0) {
         const ulIndex = structuredElements.findIndex(e => e.type === 'ul' && e.key === elements[elements.length-currentListItems.length-1]?.key);
         if(ulIndex !== -1) {
            structuredElements[ulIndex] = cloneElement(structuredElements[ulIndex], {}, currentListItems);
         } else {
              structuredElements.push(...currentListItems);
         }
     }

  return <div className="space-y-2">{structuredElements}</div>;
};


export default function AiRecommenderPage() {
  const [makes, setMakes] = useState<VehicleMakeDTO[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [models, setModels] = useState<VehicleModelDTO[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [recommendations, setRecommendations] = useState<ServiceRecommendationOutput | null>(null);
  const [isLoadingMakes, setIsLoadingMakes] = useState<boolean>(false);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  // Fetch makes initially
  useEffect(() => {
    const fetchMakesData = async () => {
      setIsLoadingMakes(true);
      setError('');
      try {
        const fetchedMakes = await apiClient<VehicleMakeDTO[]>('/public/data/vehicle-makes');
        setMakes(fetchedMakes || []);
      } catch (err) {
        setError('Failed to load vehicle makes.');
        console.error(err);
         setMakes([]);
      } finally {
        setIsLoadingMakes(false);
      }
    };
    fetchMakesData();
  }, []);

  // Fetch models when make changes
  useEffect(() => {
    if (selectedMake) {
      const fetchModelsData = async () => {
        setIsLoadingModels(true);
        setError('');
         setModels([]); // Clear previous models
         setSelectedModel(''); // Reset model selection
         setRecommendations(null); // Clear previous recommendations
        try {
          const fetchedModels = await apiClient<VehicleModelDTO[]>(`/public/data/vehicle-models?makeName=${encodeURIComponent(selectedMake)}`);
          setModels(fetchedModels || []);
        } catch (err) {
          setError('Failed to load vehicle models.');
          console.error(err);
           setModels([]);
        } finally {
          setIsLoadingModels(false);
        }
      };
      fetchModelsData();
    } else {
      setModels([]);
      setSelectedModel('');
       setRecommendations(null);
    }
  }, [selectedMake]);

  const handleGetRecommendations = async () => {
    if (!selectedMake || !selectedModel || !year) {
      setError("Please select make, model, and enter the year.");
      return;
    }
    const vehicleYear = parseInt(year, 10);
    if (isNaN(vehicleYear) || vehicleYear < 1900 || vehicleYear > new Date().getFullYear() + 1) {
        setError("Please enter a valid year.");
        return;
    }

    setIsLoadingRecommendations(true);
    setError('');
    setRecommendations(null);

    try {
      const input: ServiceRecommendationInput = {
        make: selectedMake,
        model: selectedModel,
        year: vehicleYear,
      };
      const result = await getServiceRecommendations(input);
      setRecommendations(result);
    } catch (err) {
      setError('Failed to get recommendations from AI. Please try again.');
      console.error(err);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  return (
     <ProtectedComponent allowedRoles={["USER", "CASHIER", "ADMIN"]} redirectPath="/login">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-primary text-center flex items-center justify-center gap-2">
            <Wand2 className="h-8 w-8 text-accent" /> AI Service Recommender
          </h1>
          <p className="text-muted-foreground text-center">
            Enter your vehicle details to get AI-powered service recommendations and identify potential issues.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Car className="text-accent" /> Enter Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="ai-vehicle-make">Make</Label>
                    <Select onValueChange={setSelectedMake} value={selectedMake} disabled={isLoadingMakes}>
                      <SelectTrigger id="ai-vehicle-make">
                        <SelectValue placeholder={isLoadingMakes ? "Loading..." : "Select Make"} />
                      </SelectTrigger>
                      <SelectContent>
                        {makes.map((make) => (
                          <SelectItem key={make.id} value={make.name}>{make.name}</SelectItem>
                        ))}
                        {makes.length === 0 && !isLoadingMakes && <SelectItem value="no-makes" disabled>No makes found</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-vehicle-model">Model</Label>
                     <Select onValueChange={setSelectedModel} value={selectedModel} disabled={!selectedMake || isLoadingModels || models.length === 0}>
                      <SelectTrigger id="ai-vehicle-model">
                        <SelectValue placeholder={isLoadingModels ? "Loading..." : (models.length === 0 && selectedMake ? "No models" : "Select Model")} />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-vehicle-year">Year</Label>
                    <Input
                      id="ai-vehicle-year"
                      type="number"
                      placeholder="e.g., 2019"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      min="1900"
                      max={new Date().getFullYear() + 1} // Allow next year's models
                      disabled={!selectedModel}
                    />
                  </div>
              </div>
              <div className="text-center pt-4">
                 <Button
                  size="lg"
                  onClick={handleGetRecommendations}
                  disabled={isLoadingRecommendations || !selectedMake || !selectedModel || !year}
                  className="bg-accent text-primary hover:bg-accent/90"
                >
                  {isLoadingRecommendations ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                     <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Get Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>


          {isLoadingRecommendations && (
             <Card className="mt-8 shadow-lg">
                <CardHeader>
                    <CardTitle>Generating Recommendations...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-4 w-1/2" />
                     <Skeleton className="h-4 w-5/6" />
                     <Skeleton className="h-4 w-2/3" />
                </CardContent>
             </Card>
          )}


          {recommendations && !isLoadingRecommendations && (
            <Card className="mt-8 bg-secondary/50 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-primary">AI Recommendations for {year} {selectedMake} {selectedModel}</CardTitle>
              </CardHeader>
              <CardContent>
                 {/* Use the RenderRecommendations component */}
                 <RenderRecommendations text={recommendations.recommendations} />
                 <p className="text-xs text-muted-foreground mt-4 italic">
                    Note: These are AI-generated suggestions. Always consult with a certified mechanic for accurate diagnosis and service decisions.
                 </p>
              </CardContent>
            </Card>
          )}
        </div>
    </ProtectedComponent>
  );
}
