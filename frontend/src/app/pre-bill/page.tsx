
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Calculator, Car, Wrench, PlusCircle, MinusCircle, AlertCircle } from "lucide-react";
import { apiClient } from '@/lib/api-client'; // Use API client
import { ProtectedComponent } from '@/components/ProtectedComponent';
import { useToast } from '@/hooks/use-toast';
import type {
    VehicleTypeDTO,
    VehicleMakeDTO,
    VehicleModelDTO,
    ServiceFeeDTO, // For predefined service list
    PreBillRequestDTO,
    PreBillResponseDTO,
    CustomServiceItemInputDTO,
} from '@/types/dto'; // Import necessary DTO types

interface CustomServiceUI extends CustomServiceItemInputDTO {
  id: number; // Add UI identifier
}

export default function PreBillPage() {
  // Dropdown Data State
  // const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDTO[]>([]); // Less relevant if make/model is main input
  const [makes, setMakes] = useState<VehicleMakeDTO[]>([]);
  const [models, setModels] = useState<VehicleModelDTO[]>([]);
  const [predefinedServices, setPredefinedServices] = useState<ServiceFeeDTO[]>([]);

  // Form Input State
  // const [selectedType, setSelectedType] = useState<string>(''); // Less relevant
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedPredefinedServiceDescs, setSelectedPredefinedServiceDescs] = useState<string[]>([]);
  const [customServices, setCustomServices] = useState<CustomServiceUI[]>([]);
  const [partsCost, setPartsCost] = useState<string>(''); // Use string for input flexibility

  // Result State
  const [estimatedTotal, setEstimatedTotal] = useState<number | null>(null);
  const [estimateBreakdown, setEstimateBreakdown] = useState<PreBillResponseDTO['serviceBreakdown']>([]);

  // UI State
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  // --- Data Fetching ---

  // Fetch Makes
  const fetchMakes = useCallback(async () => {
    setIsLoadingMakes(true);
    setError('');
    try {
      const makesData = await apiClient<VehicleMakeDTO[]>('/public/data/vehicle-makes');
      setMakes(makesData || []);
    } catch (err) {
      setError('Failed to load vehicle makes.');
      console.error(err);
      setMakes([]);
    } finally {
      setIsLoadingMakes(false);
    }
  }, []);

  // Fetch Models when make changes
  const fetchModels = useCallback(async (makeName: string) => {
    if (!makeName) {
      setModels([]);
      setPredefinedServices([]);
      return;
    }
    setIsLoadingModels(true);
    setError('');
    try {
      const modelsData = await apiClient<VehicleModelDTO[]>(`/public/data/vehicle-models?makeName=${encodeURIComponent(makeName)}`);
      setModels(modelsData || []);
      setPredefinedServices([]); // Clear services when models load
      setSelectedPredefinedServiceDescs([]); // Clear selections
      setCustomServices([]);
      setPartsCost('');
      setEstimatedTotal(null);
    } catch (err) {
      setError('Failed to load vehicle models.');
      console.error(err);
      setModels([]);
      setPredefinedServices([]);
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  // Fetch Predefined Services when model changes
  const fetchServices = useCallback(async (makeName: string, modelName: string) => {
    if (!makeName || !modelName) {
      setPredefinedServices([]);
      return;
    }
    setIsLoadingServices(true);
    setError('');
    try {
      const servicesData = await apiClient<ServiceFeeDTO[]>(`/public/data/services?makeName=${encodeURIComponent(makeName)}&modelName=${encodeURIComponent(modelName)}`);
      setPredefinedServices(servicesData || []);
      setSelectedPredefinedServiceDescs([]); // Clear selections
      setCustomServices([]);
      setPartsCost('');
      setEstimatedTotal(null);
    } catch (err) {
      setError('Failed to load services for this vehicle.');
      console.error(err);
      setPredefinedServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  }, []);

  // Initial fetch for makes
  useEffect(() => {
    fetchMakes();
  }, [fetchMakes]);

  // Fetch models when make changes
  useEffect(() => {
    fetchModels(selectedMake);
  }, [selectedMake, fetchModels]);

  // Fetch services when model changes
  useEffect(() => {
    fetchServices(selectedMake, selectedModel);
  }, [selectedMake, selectedModel, fetchServices]);


   // --- UI Handlers ---
   const handlePredefinedServiceToggle = (description: string) => {
        setSelectedPredefinedServiceDescs(prev =>
            prev.includes(description)
                ? prev.filter(item => item !== description)
                : [...prev, description]
        );
        setEstimatedTotal(null); // Estimate needs recalculation
    };

   const addCustomService = () => {
    setCustomServices([...customServices, { id: Date.now(), description: '', cost: 0 }]);
    setEstimatedTotal(null);
  };

  const removeCustomService = (id: number) => {
    setCustomServices(customServices.filter(service => service.id !== id));
     setEstimatedTotal(null);
  };

 const handleCustomServiceChange = (id: number, field: 'description' | 'cost', value: string) => {
    setCustomServices(customServices.map(service => {
        if (service.id === id) {
            return { ...service, [field]: field === 'cost' ? Number(value) || 0 : value };
        }
        return service;
    }));
    setEstimatedTotal(null);
  };

   const handlePartsCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       setPartsCost(e.target.value); // Keep as string for input
       setEstimatedTotal(null);
   }

  // --- Calculation ---
  const calculateEstimate = async () => {
    if (!selectedMake || !selectedModel) {
      setError("Please select vehicle make and model.");
      return;
    }

    const validCustomServices = customServices
        .filter(s => s.description.trim() !== '' && s.cost > 0)
        .map(({ id, ...rest }) => rest); // Remove UI id before sending

    const parsedPartsCost = parseFloat(partsCost) || 0;

    if (selectedPredefinedServiceDescs.length === 0 && validCustomServices.length === 0 && parsedPartsCost <= 0) {
        setError("Please select at least one service or add a custom item/part cost.");
        return;
    }

    setError('');
    setIsCalculating(true);
    setEstimatedTotal(null);
    setEstimateBreakdown([]);

    const requestBody: PreBillRequestDTO = {
        make: selectedMake,
        model: selectedModel,
        selectedServiceDescriptions: selectedPredefinedServiceDescs,
        customItems: validCustomServices,
        estimatedPartsCost: parsedPartsCost > 0 ? parsedPartsCost : undefined // Send only if > 0
    };

    try {
        console.log("Sending pre-bill request:", requestBody);
        // Call backend API for calculation
        const response = await apiClient<PreBillResponseDTO>('/user/pre-bill', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            // Add token if user-specific pricing applies, otherwise public endpoint might be better
            // token: getAuthToken()
        });

        if (response) {
            setEstimatedTotal(response.estimatedTotal);
            setEstimateBreakdown(response.serviceBreakdown || []);
            toast({ title: "Estimate Calculated", description: `Total estimated cost: $${response.estimatedTotal.toFixed(2)}` });
        } else {
            throw new Error("Received empty response from server.");
        }
    } catch (err: any) {
        const message = err.message || "Failed to calculate estimate.";
        setError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
        setEstimatedTotal(null);
        setEstimateBreakdown([]);
    } finally {
        setIsCalculating(false);
    }
  };

  return (
     <ProtectedComponent allowedRoles={["USER", "CASHIER", "ADMIN"]} redirectPath="/login"> {/* Adjusted roles */}
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-primary text-center">Pre-Bill Calculator</h1>
          <p className="text-muted-foreground text-center">
            Select your vehicle and desired services to get an estimated cost.
          </p>

          {error && (
            <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Vehicle Selection Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Car className="text-accent" /> Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Make Select */}
               <div className="space-y-2">
                <Label htmlFor="vehicle-make">Make</Label>
                 <Select onValueChange={setSelectedMake} value={selectedMake} disabled={isLoadingMakes}>
                  <SelectTrigger id="vehicle-make">
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
               {/* Model Select */}
              <div className="space-y-2">
                <Label htmlFor="vehicle-model">Model</Label>
                 <Select onValueChange={setSelectedModel} value={selectedModel} disabled={!selectedMake || isLoadingModels || models.length === 0}>
                  <SelectTrigger id="vehicle-model">
                    <SelectValue placeholder={isLoadingModels ? "Loading..." : (models.length === 0 && selectedMake ? "No models" : "Select Model")} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

           {/* Service Selection Card */}
           <Card className={`shadow-lg ${!selectedModel ? 'opacity-50 pointer-events-none' : ''}`}>
             <CardHeader>
               <CardTitle className="flex items-center gap-2"><Wrench className="text-accent" /> Service Selection</CardTitle>
                <CardDescription>Select predefined services or add custom items for {selectedMake} {selectedModel}.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
               {/* Predefined Services */}
                <div>
                    <Label className="text-base font-medium block mb-2">Predefined Services</Label>
                     {isLoadingServices ? (
                         <p className="text-muted-foreground"><Loader2 className="inline mr-2 h-4 w-4 animate-spin"/>Loading services...</p>
                     ) : predefinedServices.length > 0 ? (
                         <div className="space-y-2">
                            {predefinedServices.map(service => (
                                <div key={service.description} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-secondary/50">
                                    <Checkbox
                                        id={`service-${service.description.replace(/\s+/g, '-')}`}
                                        checked={selectedPredefinedServiceDescs.includes(service.description)}
                                        onCheckedChange={() => handlePredefinedServiceToggle(service.description)}
                                    />
                                    <Label
                                        htmlFor={`service-${service.description.replace(/\s+/g, '-')}`}
                                        className="flex-grow cursor-pointer"
                                    >
                                        {service.description}
                                    </Label>
                                     <span className="text-sm font-medium text-primary">${service.fee.toFixed(2)}</span>
                                </div>
                            ))}
                         </div>
                     ) : (
                         <p className="text-muted-foreground">No predefined services found for this model, or select a model first.</p>
                     )}
                </div>

                {/* Custom Services */}
                <div>
                  <Label className="text-base font-medium block mb-2">Custom Services / Add-ons</Label>
                  {customServices.map((service, index) => (
                      <div key={service.id} className="flex items-center gap-2 mb-2 p-2 border rounded-md bg-secondary/50">
                          <Input
                              type="text"
                              placeholder={`Custom Item ${index + 1} Desc.`}
                              value={service.description}
                              onChange={(e) => handleCustomServiceChange(service.id, 'description', e.target.value)}
                              className="flex-grow h-8"
                          />
                           <Input
                              type="number"
                              placeholder="Cost"
                              value={service.cost === 0 ? '' : service.cost.toString()} // Bind to string value
                              onChange={(e) => handleCustomServiceChange(service.id, 'cost', e.target.value)}
                              className="w-24 h-8 text-right"
                              min="0"
                              step="0.01"
                          />
                           <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCustomService(service.id)}
                              className="text-destructive hover:bg-destructive/10 h-8 w-8"
                              type="button" // Prevent form submission
                            >
                              <MinusCircle className="h-4 w-4" />
                          </Button>
                      </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCustomService}
                    className="mt-2 border-accent text-accent hover:bg-accent hover:text-primary"
                    type="button" // Prevent form submission
                   >
                     <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Item
                  </Button>
              </div>

               {/* Parts Cost */}
                <div className="space-y-2">
                    <Label htmlFor="parts-cost" className="text-base font-medium">Estimated Parts Cost (Optional)</Label>
                    <Input
                        id="parts-cost"
                        type="number"
                        placeholder="$0.00"
                        value={partsCost}
                        onChange={handlePartsCostChange}
                        min="0"
                        step="0.01"
                    />
                </div>

             </CardContent>
           </Card>

           {/* Calculate Button */}
           <div className="text-center">
             <Button
              size="lg"
              onClick={calculateEstimate}
              disabled={isLoadingServices || isCalculating || !selectedModel || (selectedPredefinedServiceDescs.length === 0 && customServices.every(s => !s.description || s.cost <= 0) && (!partsCost || parseFloat(partsCost) <= 0))}
              className="bg-accent text-primary hover:bg-accent/90"
            >
              {isCalculating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                 <Calculator className="mr-2 h-4 w-4" />
              )}
              {isCalculating ? 'Calculating...' : 'Calculate Estimate'}
            </Button>
          </div>

          {/* Estimate Result */}
          {estimatedTotal !== null && (
            <Card className="mt-8 bg-primary/10 border-primary shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-primary text-center">Estimated Total Cost</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-4xl font-bold text-primary">${estimatedTotal.toFixed(2)}</p>
                 {estimateBreakdown.length > 0 && (
                     <div className='text-left max-w-sm mx-auto'>
                         <h4 className='font-semibold mb-2 text-center'>Breakdown:</h4>
                         <ul className='list-disc list-inside text-sm text-muted-foreground'>
                            {estimateBreakdown.map((item, index) => (
                                <li key={index} className='flex justify-between'>
                                    <span>{item.description}:</span>
                                    <span>${item.cost.toFixed(2)}</span>
                                </li>
                            ))}
                         </ul>
                     </div>
                 )}
                <p className="text-xs text-muted-foreground mt-2">
                  Note: This is an estimate only. Actual cost may vary based on final inspection and unforeseen issues.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
     </ProtectedComponent>
  );
}
