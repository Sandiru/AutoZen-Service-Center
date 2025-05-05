
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Tag, Edit, Trash2, Loader2, AlertCircle, Clock } from "lucide-react";
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient, getAuthToken } from '@/lib/api-client'; // Import apiClient
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import type { ServiceFeeDTO, VehicleMakeDTO, VehicleModelDTO } from '@/types/dto'; // Import DTO types
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Zod schema using backend DTO names
const serviceFeeSchema = z.object({
  description: z.string().min(1, "Service description is required"),
  make: z.string().min(1, "Vehicle make is required"), // Store make name
  model: z.string().min(1, "Vehicle model is required"), // Store model name
  fee: z.coerce.number().min(0.01, "Fee must be positive"), // Ensure positive, allow decimals
  durationMinutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute"), // Added duration
});

type ServiceFeeFormData = z.infer<typeof serviceFeeSchema>;

export default function AdminServiceFeesPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [serviceFees, setServiceFees] = useState<ServiceFeeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<ServiceFeeDTO | null>(null);

  // State for dropdowns
  const [availableMakes, setAvailableMakes] = useState<VehicleMakeDTO[]>([]);
  const [availableModels, setAvailableModels] = useState<VehicleModelDTO[]>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ServiceFeeFormData>({
    resolver: zodResolver(serviceFeeSchema),
    defaultValues: { description: '', make: '', model: '', fee: 0, durationMinutes: 30 } // Added default duration
  });

  const watchedMake = watch('make'); // Watch the 'make' field from the form

  // Fetch Service Fees
  const fetchServiceFees = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching service fees from API...");
      const data = await apiClient<ServiceFeeDTO[]>('/admin/service-fees', { token });
      setServiceFees(data || []);
      console.log("Fetched service fees:", data);
    } catch (err: any) {
        const message = err.message || "Failed to fetch service fees.";
        setError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
        setServiceFees([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  // Fetch Makes for dropdown
  const fetchMakes = useCallback(async () => {
    setIsLoadingMakes(true);
    try {
      // Use the public endpoint for makes
      const makesData = await apiClient<VehicleMakeDTO[]>('/public/data/vehicle-makes');
      setAvailableMakes(makesData || []);
    } catch (error) {
      console.error("Failed to fetch vehicle makes:", error);
      toast({ title: "Error", description: "Could not load vehicle makes.", variant: "destructive" });
      setAvailableMakes([]);
    } finally {
      setIsLoadingMakes(false);
    }
  }, [toast]);

  // Fetch Models for dropdown when make changes
  const fetchModels = useCallback(async (makeName: string) => {
    if (!makeName) {
      setAvailableModels([]);
      return;
    }
    setIsLoadingModels(true);
    try {
      // Use the public endpoint for models
      const modelsData = await apiClient<VehicleModelDTO[]>(`/public/data/vehicle-models?makeName=${encodeURIComponent(makeName)}`);
      setAvailableModels(modelsData || []);
    } catch (error) {
      console.error("Failed to fetch vehicle models:", error);
       toast({ title: "Error", description: `Could not load models for ${makeName}.`, variant: "destructive" });
      setAvailableModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  }, [toast]);

  // Initial fetches
  useEffect(() => {
    fetchServiceFees();
    fetchMakes();
  }, [fetchServiceFees, fetchMakes]);

  // Fetch models when watchedMake changes
  useEffect(() => {
    if (watchedMake) {
      fetchModels(watchedMake);
    } else {
      setAvailableModels([]); // Clear models if no make is selected
    }
  }, [watchedMake, fetchModels]); // Depend on watchedMake and fetchModels


  const handleOpenDialog = (fee: ServiceFeeDTO | null = null) => {
    setEditingFee(fee);
    setError(null); // Clear dialog errors
    if (fee) {
      setValue('description', fee.description);
      setValue('make', fee.make); // Set the make name
      setValue('model', fee.model); // Set the model name
      setValue('fee', fee.fee);
      setValue('durationMinutes', fee.durationMinutes); // Set duration
      // Trigger model fetch for the selected make
       if (fee.make) {
           fetchModels(fee.make);
       } else {
           setAvailableModels([]);
       }
    } else {
      reset({ description: '', make: '', model: '', fee: 0, durationMinutes: 30 }); // Reset with default duration
      setAvailableModels([]); // Clear models for new entry
    }
    setIsDialogOpen(true);
  };

  // Add/Update Service Fee
  const onSubmit: SubmitHandler<ServiceFeeFormData> = async (data) => {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);

    const payload: ServiceFeeDTO = {
      // id is omitted for POST, included for PUT by backend
      description: data.description,
      make: data.make,
      model: data.model,
      fee: data.fee,
      durationMinutes: data.durationMinutes, // Include duration
    };

    const url = editingFee ? `/admin/service-fees/${editingFee.id}` : '/admin/service-fees';
    const method = editingFee ? 'PUT' : 'POST';

    try {
      console.log(`${method === 'POST' ? 'Adding' : 'Updating'} service fee:`, payload);
      await apiClient<ServiceFeeDTO>(url, {
        method,
        body: JSON.stringify(payload),
        token,
      });
      toast({
          title: "Success",
          description: `Service fee ${editingFee ? 'updated' : 'added'} successfully.`,
      });
      setIsDialogOpen(false);
      fetchServiceFees(); // Refresh list
      reset();
    } catch (err: any) {
       const message = err.message || `Failed to ${editingFee ? 'update' : 'add'} service fee.`;
       setError(`Dialog Error: ${message}`);
       toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

   // Delete Service Fee
   const handleDelete = async (id: number | undefined) => {
     if (!token || id === undefined) return;
     if (window.confirm("Are you sure you want to delete this service fee?")) {
        setIsLoading(true); // Use general loading
        setError(null);
        try {
            console.log("Deleting service fee ID:", id);
            await apiClient<void>(`/admin/service-fees/${id}`, { method: 'DELETE', token });
            toast({ title: "Success", description: "Service fee deleted successfully." });
            fetchServiceFees(); // Refresh list
        } catch (err: any) {
             const message = err.message || "Failed to delete service fee.";
             setError(message);
             toast({ title: "Error", description: message, variant: "destructive" });
             setIsLoading(false);
        }
     }
   }

  return (
    <ProtectedComponent allowedRoles={["ADMIN"]} redirectPath="/login">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Manage Service Fees</h1>
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
               <Button className="bg-accent text-primary hover:bg-accent/90" onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Service Fee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md"> {/* Adjusted width */}
              <DialogHeader>
                <DialogTitle>{editingFee ? 'Edit Service Fee' : 'Add New Service Fee'}</DialogTitle>
                <DialogDescription>
                  {editingFee ? 'Update the details for this service fee.' : 'Enter the service details, vehicle, duration, and fee.'}
                </DialogDescription>
              </DialogHeader>
               {error && error.startsWith("Dialog Error:") && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.replace("Dialog Error: ", "")}</AlertDescription>
                  </Alert>
               )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="description">Service Description</Label>
                    <Textarea id="description" placeholder="e.g., Standard Oil Change, Brake Inspection" {...register("description")} disabled={isSubmitting}/>
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="make">Make</Label>
                        {/* Use Controller for Select with react-hook-form */}
                        <Controller
                            name="make"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value); // Update form state
                                        setValue('model', ''); // Reset model when make changes
                                    }}
                                    value={field.value} // Use value from Controller
                                    disabled={isSubmitting || isLoadingMakes}
                                >
                                    <SelectTrigger id="make">
                                        <SelectValue placeholder={isLoadingMakes ? "Loading..." : "Select Make"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableMakes.map(make => (
                                            <SelectItem key={make.id} value={make.name}>{make.name}</SelectItem>
                                        ))}
                                        {availableMakes.length === 0 && !isLoadingMakes && <SelectItem value="no-makes" disabled>No makes found</SelectItem>}
                                    </SelectContent>
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
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={!watchedMake || isSubmitting || isLoadingModels}
                                >
                                    <SelectTrigger id="model">
                                        <SelectValue placeholder={isLoadingModels ? "Loading..." : "Select Model"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableModels.map(model => (
                                            <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                                        ))}
                                         {availableModels.length === 0 && watchedMake && !isLoadingModels && <SelectItem value="no-models" disabled>No models found</SelectItem>}
                                         {!watchedMake && <SelectItem value="select-make" disabled>Select make first</SelectItem>}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                        <Input id="durationMinutes" type="number" step="1" placeholder="e.g., 60" {...register("durationMinutes")} disabled={isSubmitting}/>
                        {errors.durationMinutes && <p className="text-sm text-destructive">{errors.durationMinutes.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fee">Fee (Rs.)</Label>
                        <Input id="fee" type="number" step="0.01" placeholder="e.g., 55.00" {...register("fee")} disabled={isSubmitting}/>
                        {errors.fee && <p className="text-sm text-destructive">{errors.fee.message}</p>}
                    </div>
                 </div>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                    </DialogClose>
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSubmitting ? (editingFee ? 'Updating...' : 'Adding...') : (editingFee ? 'Update Fee' : 'Add Fee')}
                    </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">Define and update the costs and estimated duration for various services based on vehicle make and model.</p>

        {error && !error.startsWith("Dialog Error:") && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
         )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Tag className="text-accent" /> Service Fee List</CardTitle>
            <CardDescription>Current service fees defined in the system.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                 <div className="flex justify-center items-center py-8">
                     <Loader2 className="h-8 w-8 animate-spin text-accent" />
                     <span className="ml-2 text-muted-foreground">Loading service fees...</span>
                 </div>
             ) : serviceFees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceFees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">{fee.description}</TableCell>
                        <TableCell>{fee.make}</TableCell>
                        <TableCell>{fee.model}</TableCell>
                        <TableCell className="text-right">{fee.durationMinutes} min</TableCell>
                        <TableCell className="text-right">Rs.{fee.fee.toFixed(2)}</TableCell>
                         <TableCell className="text-right space-x-2">
                           <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(fee)} title="Edit">
                                <Edit className="h-4 w-4 text-blue-500" />
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => handleDelete(fee.id)} title="Delete">
                                <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No service fees added yet.</p>
              )}
          </CardContent>
        </Card>
      </div>
    </ProtectedComponent>
  );
}
