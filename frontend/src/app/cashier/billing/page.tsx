
"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Printer, Search, User, Car, PlusCircle, MinusCircle, AlertCircle, CheckSquare, Square, Edit, UserPlus, Loader2, ArrowLeft } from "lucide-react";
// Removed direct vehicle data imports, use apiClient now
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { apiClient, getAuthToken } from '@/lib/api-client'; // Import apiClient
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import type {
    CustomerDTO,
    VehicleDTO,
    ServiceFeeDTO,
    CustomerVehicleInputDTO,
    BillingRequestDTO,
    ServiceRecordDTO,
    VehicleMakeDTO,
    VehicleModelDTO,
    CustomerAndVehicleResponse
} from '@/types/dto'; // Import DTO types
import { getVehicleMakes } from '@/services/vehicle-data';

// --- Data Structures ---
interface CustomServiceItemUI {
    id: number; // UI only identifier
    description: string;
    cost: number;
}

// Zod Schema matching CustomerVehicleInputDTO properties
const customerVehicleSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID/Plate is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Invalid year").max(new Date().getFullYear() + 1, "Invalid year"),
  chassisNo: z.string().min(1, "Chassis number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  address: z.string().min(1, "Address is required"),
  phoneNo: z.string().min(10, "Phone number seems too short").regex(/^\d{3}-\d{3}-\d{4}$/, "Use xxx-xxx-xxxx format"),
  nicNo: z.string().min(1, "NIC number is required"),
});
type CustomerVehicleFormData = z.infer<typeof customerVehicleSchema>;


// --- Component ---
export default function CashierBillingPage() {
  type WorkflowStage = 'find_customer' | 'select_services';
  const {username}=useAuth();

  // Workflow State
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('find_customer');
  const [searchVehicleId, setSearchVehicleId] = useState(''); // Input field for search
  const [customerData, setCustomerData] = useState<CustomerDTO | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleDTO | null>(null);
  const [isEditingCustomerVehicle, setIsEditingCustomerVehicle] = useState(false); // If existing data was loaded

  // Billing State
  const [availableServices, setAvailableServices] = useState<ServiceFeeDTO[]>([]);
  const [selectedPredefinedServices, setSelectedPredefinedServices] = useState<string[]>([]);
  const [customServiceItems, setCustomServiceItems] = useState<CustomServiceItemUI[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [partsCost, setPartsCost] = useState<string>(''); // Parts cost input

  // Loading & Error State
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form/billing submission
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState('');
  const [dialogError, setDialogError] = useState(''); // For form errors

  // Suggestion State
  const [suggestionPopoverOpen, setSuggestionPopoverOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<VehicleDTO[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // UI Hooks
  const { toast } = useToast();
  const { token } = useAuth();

  // Form Hook for Customer/Vehicle
  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CustomerVehicleFormData>({
    resolver: zodResolver(customerVehicleSchema),
  });
  const watchedMake = watch('make');
  const [availableMakes, setAvailableMakes] = useState<VehicleMakeDTO[]>([]);
  const [availableModels, setAvailableModels] = useState<VehicleModelDTO[]>([]);
   const [isLoadingDropdownMakes, setIsLoadingDropdownMakes] = useState(false);
   const [isLoadingDropdownModels, setIsLoadingDropdownModels] = useState(false);

   // --- Effects ---

   // Fetch makes for the dropdown
  useEffect(() => {
    const fetchDropdownMakes = async () => {
      setIsLoadingDropdownMakes(true);
      try {
        const makes = await apiClient<VehicleMakeDTO[]>('/public/data/vehicle-makes');
        setAvailableMakes(makes || []);
      } catch (error) {
        console.error("Failed to fetch makes for dropdown:", error);
      } finally {
        setIsLoadingDropdownMakes(false);
      }
    };
    fetchDropdownMakes();
  }, []);

   // Fetch models for the dropdown when make changes in the form
  useEffect(() => {
    const fetchDropdownModels = async (makeName: string) => {
       if (!makeName) { setAvailableModels([]); return; }
       setIsLoadingDropdownModels(true);
       try {
         const models = await apiClient<VehicleModelDTO[]>(`/public/data/vehicle-models?makeName=${encodeURIComponent(makeName)}`);
         setAvailableModels(models || []);
       } catch (error) {
         console.error("Failed to fetch models for dropdown:", error);
         setAvailableModels([]);
       } finally {
         setIsLoadingDropdownModels(false);
       }
     };

    if (watchedMake) {
      fetchDropdownModels(watchedMake);
    } else {
      setAvailableModels([]);
    }
  }, [watchedMake]); // Depend only on watchedMake

   // Fetch available services when vehicle data is loaded/updated
   useEffect(() => {
    const loadServices = async () => {
        if (vehicleData?.make && vehicleData?.model) {
            setIsLoadingServices(true);
            setError("");
            try {
                const services = await apiClient<ServiceFeeDTO[]>(`/public/data/services?makeName=${encodeURIComponent(vehicleData.make)}&modelName=${encodeURIComponent(vehicleData.model)}`);
                setAvailableServices(services || []);
            } catch (err: any) {
                console.error("Failed to load available services:", err);
                setError("Could not load services for this vehicle.");
                setAvailableServices([]);
            } finally {
                setIsLoadingServices(false);
            }
        } else {
            setAvailableServices([]);
        }
    };
    if (workflowStage === 'select_services' && vehicleData) {
       loadServices();
    }
   }, [vehicleData, workflowStage]); // Depend on vehicleData and workflowStage

   // Calculate total amount whenever selected/custom services change
   useEffect(() => {
    if (workflowStage !== 'select_services') {
        setTotalAmount(0);
        return;
    }

    let newTotal = 0;
    selectedPredefinedServices.forEach(desc => {
      const service = availableServices.find(s => s.description === desc);
      if (service) newTotal += service.fee;
    });
    customServiceItems.forEach(item => { newTotal += item.cost; });
    newTotal += parseFloat(partsCost) || 0; // Add parts cost

    setTotalAmount(newTotal);

   }, [selectedPredefinedServices, customServiceItems, availableServices, workflowStage, partsCost]);

    // Fetch suggestions when searchVehicleId changes (debounced)
     useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchVehicleId.length < 2 || !token) { // Only search if length >= 2 and logged in
                setSuggestions([]);
                setSuggestionPopoverOpen(false);
                return;
            }
            setIsLoadingSuggestions(true);
            try {
                const data = await apiClient<VehicleDTO[]>(`/cashier/customer-vehicle/suggestions?query=${encodeURIComponent(searchVehicleId)}`, { token });
                setSuggestions(data || []);
                setSuggestionPopoverOpen((data || []).length > 0);
            } catch (error) {
                console.error("Failed to fetch suggestions:", error);
                setSuggestions([]);
                 setSuggestionPopoverOpen(false);
            } finally {
                 setIsLoadingSuggestions(false);
            }
        };

         // Debounce the API call
         const handler = setTimeout(() => {
             fetchSuggestions();
         }, 300); // 300ms delay

         // Cleanup function to cancel the timeout if the input changes again quickly
         return () => {
             clearTimeout(handler);
         };

     }, [searchVehicleId, token]); // Rerun effect when searchVehicleId or token changes

   // --- Handlers ---

  const handleSearch = useCallback(async (vehicleIdToSearch?: string) => {
    const query = vehicleIdToSearch || searchVehicleId;
    if (!query || !token) {
      setError("Please enter a Vehicle ID/Identifier and ensure you are logged in.");
      return;
    }
    setIsLoadingCustomer(true);
    setError('');
    setSuggestionPopoverOpen(false); // Close suggestions on search
    resetFormAndBillingState(query); // Reset form but keep search query

    try {
      const foundRecord = await apiClient<CustomerAndVehicleResponse>(`/cashier/customer-vehicle?vehicleIdentifier=${encodeURIComponent(query)}`, { token });

      if (foundRecord && foundRecord.customer && foundRecord.vehicle) {
          const fetchedVehicle: VehicleDTO = foundRecord.vehicle;
          const fetchedCustomer: CustomerDTO = foundRecord.customer;
        populateForm(fetchedVehicle, fetchedCustomer);
        setCustomerData(fetchedCustomer);
        setVehicleData(fetchedVehicle);
        setIsEditingCustomerVehicle(true); // Indicate loaded data
        setWorkflowStage('select_services'); // Move to next stage
        toast({ title: "Vehicle Found", description: `Loaded data for ${fetchedCustomer.name} - ${fetchedVehicle.make} ${fetchedVehicle.model}.` });
      } else {
         // Backend returns 404 if not found, apiClient throws error
         // This else block might not be reached if apiClient throws
        setError(`No record found for Vehicle ID/Identifier: ${query}. Please add the customer/vehicle details below.`);
        toast({ title: "Not Found", description: `Identifier ${query} not found. Enter details to add.`, variant: "default" });
        setValue('vehicleId', query); // Keep the searched ID in the input
        setIsEditingCustomerVehicle(false);
        setWorkflowStage('find_customer'); // Stay in find stage
      }
    } catch (err: any) {
        // Handle 404 specifically
        if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
             setError(`No record found for: ${query}. Please add the details below.`);
             toast({ title: "Not Found", description: `Identifier ${query} not found. Enter details to add.`, variant: "default" });
             setValue('vehicleId', query); // Keep the searched ID in the input
             setIsEditingCustomerVehicle(false);
             setWorkflowStage('find_customer'); // Stay in find stage
        } else {
             setError(`Error searching for vehicle: ${err.message}`);
             toast({ title: "Search Error", description: err.message, variant: "destructive" });
        }
        console.error("Search error:", err);
    } finally {
      setIsLoadingCustomer(false);
    }
  }, [searchVehicleId, token, reset, setValue, toast]); // Added dependencies

   // Handler for submitting the Customer/Vehicle form (Add or Update)
   const onSubmitCustomerVehicle: SubmitHandler<CustomerVehicleFormData> = async (data) => {
     if (!token) {
         setDialogError("Authentication error.");
         return;
     };
     setIsSubmitting(true);
     setDialogError('');

     const payload: CustomerVehicleInputDTO = { ...data }; // Matches the backend input DTO

     try {
         console.log("Submitting customer/vehicle data:", payload);
         // Use the single endpoint for add/update
         const savedData = await apiClient<CustomerVehicleInputDTO>('/cashier/customer-vehicle', {
             method: 'POST', // Backend handles create/update logic based on identifiers
             body: JSON.stringify(payload),
             token,
         });

         // Need to refetch the structured data after save/update
         const refetchedRecord = await apiClient<CustomerAndVehicleResponse>(`/cashier/customer-vehicle?vehicleIdentifier=${encodeURIComponent(savedData.vehicleId)}`, { token });

         if (refetchedRecord && refetchedRecord.vehicle && refetchedRecord.customer) {
             setCustomerData(refetchedRecord.customer);
             setVehicleData(refetchedRecord.vehicle);
             setIsEditingCustomerVehicle(true); // Mark as existing data now
             toast({ title: "Success", description: `Customer/Vehicle record ${isEditingCustomerVehicle ? 'updated' : 'added'} successfully.`});
             setWorkflowStage('select_services'); // Proceed to billing
             setError(''); // Clear main page error
         } else {
              throw new Error("Failed to refetch saved customer/vehicle data.");
         }

     } catch (err: any) {
         const message = err.message || "Failed to save customer/vehicle data.";
         console.error("Save Error:", err);
         setDialogError(message); // Show error in the form area
         toast({ title: "Error", description: message, variant: "destructive" });
     } finally {
         setIsSubmitting(false);
     }
   };


  // Custom Service Item Handlers
  const addCustomItem = () => {
     const newItem: CustomServiceItemUI = { id: Date.now(), description: '', cost: 0 };
     setCustomServiceItems(prev => [...prev, newItem]);
     setTotalAmount(prev => prev); // Trigger recalculation if needed
  };
  const updateCustomItem = (id: number, field: 'description' | 'cost', value: string) => {
     setCustomServiceItems(prev => prev.map(item => {
         if (item.id === id) {
             const updatedItem = { ...item, [field]: field === 'cost' ? Number(value) || 0 : value };
             return updatedItem;
         }
         return item;
     }));
      // Recalculation happens in useEffect
  };
  const removeCustomItem = (id: number) => {
     setCustomServiceItems(prev => prev.filter(item => item.id !== id));
     // Recalculation happens in useEffect
  };

  // Predefined Service Handler
   const handlePredefinedServiceToggle = (description: string) => {
        setSelectedPredefinedServices(prev =>
            prev.includes(description) ? prev.filter(item => item !== description) : [...prev, description]
        );
        // Recalculation happens in useEffect
    };

   // --- Billing Actions ---

   // Finalize Bill
   const handleFinalizeBill = async () => {
     const hasServices = selectedPredefinedServices.length > 0 || customServiceItems.some(item => item.cost > 0) || (parseFloat(partsCost) || 0) > 0;
     if (!vehicleData?.id || !hasServices) {
        toast({ title: "Cannot Finalize", description: "Load vehicle data and select/add at least one service item or parts cost.", variant: "destructive"});
        return;
     }
      if (!token) {
         toast({ title: "Auth Error", description: "Please log in again.", variant: "destructive"});
        return;
     }

     setIsSubmitting(true); // Use submitting state for billing action
     setError('');

     const billingPayload: BillingRequestDTO = {
         vehicleId: vehicleData.id,
         selectedServiceDescriptions: selectedPredefinedServices,
         customItems: customServiceItems
             .filter(item => item.description.trim() !== '' && item.cost > 0)
             .map(({ id, ...rest }) => rest), // Remove UI id
         partsCost: parseFloat(partsCost) || 0,
         processedByCashierUsername: username?username:undefined
     };

     try {
         console.log("Finalizing bill with payload:", billingPayload);
         const finalizedRecord = await apiClient<ServiceRecordDTO>('/cashier/billing/calculate', {
             method: 'POST',
             body: JSON.stringify(billingPayload),
             token,
         });
         toast({ title: "Bill Finalized", description: `Total: Rs.${finalizedRecord.totalCost.toFixed(2)}. Record ID: ${finalizedRecord.id}`});
         // Optionally reset after finalizing
         // resetFormAndBillingState();
         // setWorkflowStage('find_customer');

         // Maybe just clear the service selections?
         //setSelectedPredefinedServices([]);
         //setCustomServiceItems([]);
         //setPartsCost('');

     } catch (err: any) {
         const message = err.message || "Failed to finalize bill.";
         setError(message);
         toast({ title: "Error", description: message, variant: "destructive"});
     } finally {
          setIsSubmitting(false);
     }
   };

   // Print Receipt (Simulated)
   const handlePrintReceipt = async (serviceRecordId?: number) => {
       if (!serviceRecordId) {
           toast({ title: "Cannot Print", description: "Bill must be finalized first to get a Service Record ID.", variant: "destructive"});
           return; // Need a service record ID, usually from finalize response
       }
       if (!token) {
            toast({ title: "Auth Error", description: "Please log in again.", variant: "destructive"});
            return;
       }

        const hasServices = selectedPredefinedServices.length > 0 || customServiceItems.some(item => item.cost > 0) || (parseFloat(partsCost) || 0) > 0;
        if (!customerData || !vehicleData || !hasServices) {
            toast({ title: "Cannot Print", description: "Load vehicle data and select/add service items first.", variant: "destructive"});
            return;
        }
        setIsPrinting(true); // Use printing state
        setError('');

      try {
          console.log(`Requesting receipt content for Service Record ID: ${serviceRecordId}`);
          // Call backend endpoint to get receipt content (assuming it returns text/plain or similar)
          const receiptContent = await apiClient<string>(`/cashier/billing/receipt/${serviceRecordId}`, {
             token,
             headers: { 'Accept': 'text/plain' } // Request plain text if applicable
          });

          console.log("Received receipt content:\n", receiptContent);
          toast({ title: "Printing Receipt...", description: "Receipt content received, simulating print...", duration: 5000 });

          // Simulate opening print dialog
           const printWindow = window.open('', '_blank');
           if (printWindow) {
                printWindow.document.write('<pre>' + receiptContent + '</pre>'); // Use <pre> for formatting
                printWindow.document.close(); // Necessary for some browsers.
                printWindow.focus(); // Focus on the new window (optional)
                printWindow.print();
                // printWindow.close(); // Close automatically after print (optional)
           } else {
                throw new Error("Could not open print window. Please check browser pop-up settings.");
           }

      } catch (err: any) {
            const message = err.message || "Failed to generate or print receipt.";
            setError(message);
            toast({ title: "Error", description: message, variant: "destructive"});
      } finally {
           setIsPrinting(false);
      }
   };

  const handleGoBackToCustomer = () => {
    setWorkflowStage('find_customer');
    // Keep customer data populated in the form for potential edits
  };

   const handleAddNewCustomer = () => {
        resetFormAndBillingState();
        setWorkflowStage('find_customer');
        setIsEditingCustomerVehicle(false); // Ensure it's add mode
        toast({ title: "Add New Record", description: "Enter new customer and vehicle details."});
   }

   // --- Helper Functions ---
  const resetFormAndBillingState = (keepSearchQuery = '') => {
    reset({ vehicleId: '', make: '', model: '', year: undefined, chassisNo: '', customerName: '', address: '', phoneNo: '', nicNo: '' });
    setCustomerData(null);
    setVehicleData(null);
    setAvailableModels([]);
    setSelectedPredefinedServices([]);
    setCustomServiceItems([]);
    setTotalAmount(0);
    setAvailableServices([]);
    setIsEditingCustomerVehicle(false);
    setPartsCost('');
    setSearchVehicleId(keepSearchQuery); // Keep search input value if provided
    setError('');
    setDialogError('');
  };

   const populateForm = (vehicle: VehicleDTO, customer: CustomerDTO) => {
    setValue('vehicleId', vehicle.vehicleId);
    setValue('make', vehicle.make);
    setValue('model', vehicle.model);
    setValue('year', vehicle.year);
    setValue('chassisNo', vehicle.chassisNo);
    setValue('customerName', customer.name);
    setValue('address', customer.address);
    setValue('phoneNo', customer.phoneNo);
    setValue('nicNo', customer.nicNo);
     // Fetch models for the populated make
     if (vehicle.make) {
        getVehicleMakes(vehicle.make);
     }
  };

  // --- Render Logic ---
  return (
    <ProtectedComponent allowedRoles={["CASHIER", "ADMIN"]} redirectPath="/login">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Billing & Customer Management</h1>
        <p className="text-muted-foreground">Find or add customer/vehicle information, then calculate the service bill.</p>

        {/* General Error Display Area */}
        {error && ( <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> )}

        {/* Stage 1: Find/Add/Update Customer & Vehicle */}
        <Card className={workflowStage === 'find_customer' ? '' : 'hidden'}>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><Search className="text-accent" /> Find or Add Customer/Vehicle</CardTitle>
                <Button variant="outline" size="sm" onClick={handleAddNewCustomer}><UserPlus className="mr-2 h-4 w-4" /> Add New</Button>
            </div>
            <CardDescription>Search by Vehicle ID/Plate or Chassis No to load existing data, or fill the form to add a new record.</CardDescription>
          </CardHeader>
          <CardContent>
             {/* Search Input with Suggestions */}
            <Popover open={suggestionPopoverOpen} onOpenChange={setSuggestionPopoverOpen}>
              <PopoverAnchor asChild>
                 <div className="flex gap-4 items-end mb-6">
                    <div className="flex-grow space-y-1 relative">
                        <Label htmlFor="search-vehicle-id">Search by Vehicle ID, Chassis, Customer Name</Label>
                        <Input
                            id="search-vehicle-id"
                            ref={searchInputRef}
                            placeholder="Start typing..."
                            value={searchVehicleId}
                            onChange={(e) => setSearchVehicleId(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                            disabled={isLoadingCustomer}
                            autoComplete="off"
                        />
                         {isLoadingSuggestions && <Loader2 className="absolute right-3 top-8 h-4 w-4 animate-spin text-muted-foreground"/>}
                    </div>
                    <Button onClick={() => handleSearch()} disabled={isLoadingCustomer || !searchVehicleId}>
                     {isLoadingCustomer ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                    </Button>
                </div>
              </PopoverAnchor>
               <PopoverContent
                className="p-0 w-[--radix-popover-trigger-width] max-h-[300px] overflow-auto z-50" // Ensure high z-index
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focus stealing
               >
                <Command>
                    <CommandList>
                        <CommandEmpty>{isLoadingSuggestions ? 'Loading...' : 'No matching vehicles found.'}</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                        {suggestions.map((vehicle) => (
                            <CommandItem
                            key={vehicle.id}
                            value={vehicle.vehicleId} // Use unique value
                            onSelect={() => {
                                setSearchVehicleId(vehicle.vehicleId); // Fill input
                                setSuggestionPopoverOpen(false); // Close popover
                                handleSearch(vehicle.vehicleId); // Trigger search
                            }}
                            className="cursor-pointer"
                            >
                            <div className="flex justify-between w-full items-center">
                                <span className='font-medium'>{vehicle.vehicleId} <span className='text-xs text-muted-foreground'>({vehicle.make} {vehicle.model})</span></span>
                                <span className="text-muted-foreground text-xs">{vehicle.ownerName}</span>
                            </div>
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                    </Command>
               </PopoverContent>
             </Popover>

             {/* Form Area Error Display */}
             {dialogError && ( <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Form Error</AlertTitle><AlertDescription>{dialogError}</AlertDescription></Alert> )}

             {/* Customer & Vehicle Form */}
            <form onSubmit={handleSubmit(onSubmitCustomerVehicle)} className="space-y-6 border-t pt-6">
              {/* Vehicle Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-primary flex items-center gap-2"><Car /> Vehicle Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="vehicleId">Vehicle ID / Plate No</Label>
                        <Input id="vehicleId" placeholder="e.g., ABC-1234" {...register("vehicleId")} disabled={isSubmitting || isEditingCustomerVehicle} />
                        {errors.vehicleId && <p className="text-sm text-destructive">{errors.vehicleId.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="make">Make</Label>
                        <Controller
                             name="make"
                             control={control}
                             render={({ field }) => (
                                 <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || isLoadingDropdownMakes}>
                                     <SelectTrigger id="make"><SelectValue placeholder={isLoadingDropdownMakes ? "Loading..." : "Select Make"} /></SelectTrigger>
                                     <SelectContent>{availableMakes.map(make => <SelectItem key={make.id} value={make.name}>{make.name}</SelectItem>)}</SelectContent>
                                 </Select>
                             )}
                         />
                        {errors.make && <p className="text-sm text-destructive">{errors.make.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                         <Controller
                             name="model"
                             control={control}
                             render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || !watchedMake || isLoadingDropdownModels}>
                                    <SelectTrigger id="model"><SelectValue placeholder={isLoadingDropdownModels ? "Loading..." : "Select Model"} /></SelectTrigger>
                                    <SelectContent>{availableModels.map(model => <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>)}</SelectContent>
                                </Select>
                              )}
                         />
                        {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Input id="year" type="number" placeholder="e.g., 2020" {...register("year")} disabled={isSubmitting}/>
                        {errors.year && <p className="text-sm text-destructive">{errors.year.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="chassisNo">Chassis Number</Label>
                        <Input id="chassisNo" placeholder="Enter chassis number" {...register("chassisNo")} disabled={isSubmitting || isEditingCustomerVehicle}/>
                        {errors.chassisNo && <p className="text-sm text-destructive">{errors.chassisNo.message}</p>}
                    </div>
                </div>
              </div>
              {/* Customer Details Section */}
               <div className="space-y-4 border-t pt-4">
                 <h3 className="text-lg font-medium text-primary flex items-center gap-2"><User /> Customer Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="customerName">Name</Label>
                        <Input id="customerName" placeholder="Full Name" {...register("customerName")} disabled={isSubmitting}/>
                        {errors.customerName && <p className="text-sm text-destructive">{errors.customerName.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" placeholder="Street Address, City" {...register("address")} disabled={isSubmitting}/>
                        {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phoneNo">Phone Number</Label>
                        <Input id="phoneNo" placeholder="xxx-xxx-xxxx" {...register("phoneNo")} disabled={isSubmitting || isEditingCustomerVehicle}/>
                        {errors.phoneNo && <p className="text-sm text-destructive">{errors.phoneNo.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nicNo">NIC Number</Label>
                        <Input id="nicNo" placeholder="National ID Card Number" {...register("nicNo")} disabled={isSubmitting || isEditingCustomerVehicle}/>
                        {errors.nicNo && <p className="text-sm text-destructive">{errors.nicNo.message}</p>}
                    </div>
                 </div>
               </div>
              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                 <Button type="submit" className="bg-accent text-primary hover:bg-accent/90" disabled={isSubmitting || isLoadingCustomer}>
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                    {isSubmitting ? 'Saving...' : (isEditingCustomerVehicle ? 'Update & Proceed' : 'Save & Proceed')}
                 </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Stage 2: Select Services & Bill Calculation */}
        <Card className={workflowStage === 'select_services' ? '' : 'hidden'}>
            <CardHeader>
               <div className="flex justify-between items-center">
                 <CardTitle className="flex items-center gap-2"><DollarSign className="text-accent" /> Bill Calculation</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleGoBackToCustomer}><ArrowLeft className="mr-2 h-4 w-4"/> Back to Customer/Vehicle</Button>
               </div>
               <CardDescription>Select services performed, add custom items/parts, and finalize the bill.</CardDescription>
            </CardHeader>
            <CardContent>
                {(customerData && vehicleData) && (
                    <div className="space-y-6">
                        {/* Display Customer/Vehicle Info */}
                        <div className="p-4 border rounded bg-secondary/50 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <p><strong>Customer:</strong> {customerData.name} ({customerData.nicNo})</p>
                          <p><strong>Phone:</strong> {customerData.phoneNo}</p>
                          <p><strong>Vehicle:</strong> {vehicleData.year} {vehicleData.make} {vehicleData.model}</p>
                          <p><strong>Vehicle ID:</strong> {vehicleData.vehicleId}</p>
                          <p><strong>Chassis No:</strong> {vehicleData.chassisNo}</p>
                          <p className="md:col-span-2"><strong>Address:</strong> {customerData.address}</p>
                        </div>

                         {/* Service Selection Area */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-medium text-primary">Service Items</h3>
                            {/* Predefined Services */}
                            <div>
                                <Label className="text-base font-medium block mb-2">Predefined Services</Label>
                                {isLoadingServices ? (<p className="text-muted-foreground"><Loader2 className="inline animate-spin mr-2"/>Loading services...</p>)
                                : availableServices.length > 0 ? (
                                    <div className="space-y-2">
                                        {availableServices.map(service => (
                                            <div key={service.description} className="flex items-center space-x-3 p-2 border rounded-md hover:bg-secondary/50">
                                                <Checkbox
                                                    id={`service-${service.description.replace(/\s+/g, '-')}`}
                                                    checked={selectedPredefinedServices.includes(service.description)}
                                                    onCheckedChange={() => handlePredefinedServiceToggle(service.description)} />
                                                <Label htmlFor={`service-${service.description.replace(/\s+/g, '-')}`} className="flex-grow cursor-pointer font-normal">{service.description}</Label>
                                                <span className="text-sm font-medium text-primary">Rs.{service.fee.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (<p className="text-muted-foreground">No predefined services found for this vehicle model.</p>)}
                            </div>
                            {/* Custom Items */}
                            <div>
                                <Label className="text-base font-medium block mb-2 mt-4">Custom Items / Parts</Label>
                                {customServiceItems.length > 0 && (
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right w-[100px]">Cost</TableHead><TableHead className="text-right w-[60px]">Actions</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {customServiceItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell><Input type="text" value={item.description} onChange={(e) => updateCustomItem(item.id, 'description', e.target.value)} placeholder="Custom Item/Part Description" className="h-8" /></TableCell>
                                                <TableCell className="text-right"><Input type="number" value={item.cost === 0 ? '' : item.cost.toString()} onChange={(e) => updateCustomItem(item.id, 'cost', e.target.value)} placeholder="0.00" step="0.01" min="0" className="h-8 w-24 text-right" /></TableCell>
                                                <TableCell className="text-right"><Button type="button" variant="ghost" size="icon" onClick={() => removeCustomItem(item.id)} className="text-destructive h-8 w-8"><MinusCircle className="h-4 w-4" /></Button></TableCell>
                                            </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                                <Button type="button" variant="outline" size="sm" onClick={addCustomItem} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Custom Item/Part</Button>
                            </div>
                             {/* Parts Cost Input */}
                             <div className="space-y-2 pt-4 border-t">
                                <Label htmlFor="parts-cost" className="text-base font-medium">Additional Parts Cost</Label>
                                <Input
                                    id="parts-cost"
                                    type="number"
                                    placeholder="Rs.0.00"
                                    value={partsCost}
                                    onChange={(e) => setPartsCost(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className="w-32"
                                />
                            </div>
                        </div>

                        {/* Total Amount */}
                        <div className="text-right font-bold text-xl text-primary pt-4 border-t">
                        Total Amount: Rs.{totalAmount.toFixed(2)}
                        </div>

                        {/* Billing Actions */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Button className="bg-accent text-primary hover:bg-accent/90" onClick={handleFinalizeBill} disabled={isSubmitting || totalAmount <= 0}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <DollarSign className="mr-2 h-4 w-4" />}
                                {isSubmitting ? 'Finalizing...' : 'Finalize Bill'}
                            </Button>
                            <Button variant="outline" onClick={() => handlePrintReceipt(vehicleData?.id /* Need Service Record ID */)} disabled={isPrinting || totalAmount <= 0 /* || !finalizedRecordId */}>
                                {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Printer className="mr-2 h-4 w-4" />}
                                {isPrinting ? 'Printing...' : 'Print Receipt'}
                            </Button>
                        </div>
                    </div>
                )}
                 {!(customerData && vehicleData) && (
                     <p className='text-muted-foreground text-center py-6'>Load customer and vehicle data first.</p>
                 )}
            </CardContent>
        </Card>
      </div>
    </ProtectedComponent>
  );
}
