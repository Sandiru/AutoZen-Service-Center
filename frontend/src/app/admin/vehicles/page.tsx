
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
import { PlusCircle, Car, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient, getAuthToken } from '@/lib/api-client'; // Import apiClient
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import type { VehicleTypeDTO, VehicleMakeDTO, VehicleModelDTO } from '@/types/dto'; // Import DTO types
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema for Adding/Editing Vehicle Models (as Types/Makes are less frequently changed via this UI maybe)
const vehicleModelSchema = z.object({
  // type: z.string().min(1, "Vehicle type is required"), // Type selection might be separate or implicit
  makeName: z.string().min(1, "Make is required"),
  name: z.string().min(1, "Model name is required"), // Corresponds to model.name
});

type VehicleModelFormData = z.infer<typeof vehicleModelSchema>;

// Interface for the flattened catalog data for display
interface VehicleCatalogItem {
    id: number; // Model ID
    type: string; // Type name
    make: string; // Make name
    model: string; // Model name
}


export default function AdminVehiclesPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [catalog, setCatalog] = useState<VehicleCatalogItem[]>([]); // Flattened list for table display
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<VehicleCatalogItem | null>(null); // Store the flat item being edited

   // State for dropdowns in the dialog
  const [availableMakes, setAvailableMakes] = useState<VehicleMakeDTO[]>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  // Types might be needed if adding new makes/types is supported here
  // const [availableTypes, setAvailableTypes] = useState<VehicleTypeDTO[]>([]);
  // const [isLoadingTypes, setIsLoadingTypes] = useState(false);


  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<VehicleModelFormData>({
    resolver: zodResolver(vehicleModelSchema),
    defaultValues: { makeName: '', name: ''}
  });


  // Fetch Vehicle Catalog (flattened)
  const fetchCatalog = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching vehicle catalog from API...");
      // Fetch the nested structure
      const nestedCatalog = await apiClient<VehicleTypeDTO[]>('/admin/vehicles/catalog', { token });

      // Flatten the structure for table display
      const flatCatalog: VehicleCatalogItem[] = [];
      (nestedCatalog || []).forEach(type => {
          (type.makes || []).forEach(make => {
              (make.models || []).forEach(model => {
                  if (model.id !== undefined) { // Ensure model has an ID
                    flatCatalog.push({
                        id: model.id, // Use model ID
                        type: type.name,
                        make: make.name,
                        model: model.name
                    });
                  }
              });
          });
      });
      setCatalog(flatCatalog);
      console.log("Fetched and flattened catalog:", flatCatalog);

    } catch (err: any) {
       const message = err.message || "Failed to fetch vehicle catalog.";
       setError(message);
       toast({ title: "Error", description: message, variant: "destructive" });
       setCatalog([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

   // Fetch Makes for dropdown
  const fetchMakes = useCallback(async () => {
    setIsLoadingMakes(true);
    try {
      // Use the public endpoint or an admin endpoint if needed
      const makesData = await apiClient<VehicleMakeDTO[]>('/public/data/vehicle-makes'); // Or /admin/vehicles/makes
      setAvailableMakes(makesData || []);
    } catch (error) {
      console.error("Failed to fetch vehicle makes:", error);
      // toast({ title: "Error", description: "Could not load vehicle makes for dialog.", variant: "destructive" });
      setAvailableMakes([]);
    } finally {
      setIsLoadingMakes(false);
    }
  }, [toast]);


  useEffect(() => {
    fetchCatalog();
    fetchMakes(); // Fetch makes for the dialog
  }, [fetchCatalog, fetchMakes]);

  const handleOpenDialog = (modelItem: VehicleCatalogItem | null = null) => {
    setEditingModel(modelItem);
    setError(null); // Clear dialog error
    if (modelItem) {
      setValue('makeName', modelItem.make);
      setValue('name', modelItem.model);
      // Type might not be directly editable here if structure is Make -> Model
    } else {
      reset({ makeName: '', name: '' });
    }
    setIsDialogOpen(true);
  };

  // Add/Update Vehicle Model
  const onSubmit: SubmitHandler<VehicleModelFormData> = async (data) => {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);

    // Prepare payload matching backend DTO structure for POST/PUT model
    const payload: VehicleModelDTO = {
        name: data.name,
        makeName: data.makeName,
    };

    const url = editingModel ? `/admin/vehicles/models/${editingModel.id}` : '/admin/vehicles/models';
    const method = editingModel ? 'PUT' : 'POST';

    try {
      console.log(`${method === 'POST' ? 'Adding' : 'Updating'} vehicle model:`, payload);
      await apiClient<VehicleModelDTO>(url, {
        method,
        body: JSON.stringify(payload),
        token,
      });
      toast({
          title: "Success",
          description: `Vehicle model ${editingModel ? 'updated' : 'added'} successfully.`,
      });
      setIsDialogOpen(false);
      fetchCatalog(); // Refresh list
      reset();
    } catch (err: any) {
       const message = err.message || `Failed to ${editingModel ? 'update' : 'add'} vehicle model.`;
       setError(`Dialog Error: ${message}`);
       toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

   // Delete Vehicle Model
   const handleDelete = async (id: number | undefined) => {
     if (!token || id === undefined) return;
     if (window.confirm("Are you sure you want to delete this vehicle model? This may affect associated service fees.")) {
        setIsLoading(true); // Use general loading indicator
        setError(null);
        try {
            console.log("Deleting vehicle model ID:", id);
            await apiClient<void>(`/admin/vehicles/models/${id}`, { method: 'DELETE', token });
            toast({ title: "Success", description: "Vehicle model deleted successfully." });
            fetchCatalog(); // Refresh list
        } catch (err: any) {
            const message = err.message || "Failed to delete vehicle model.";
            setError(message);
            toast({ title: "Error", description: message, variant: "destructive" });
             setIsLoading(false);
        }
     }
   }

  // Mock vehicle types (replace with fetched data if needed, maybe not editable here)
  // const vehicleTypes = ["Car", "Van", "Truck", "Motorcycle"];

  return (
    <ProtectedComponent allowedRoles={["ADMIN"]} redirectPath="/login">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Manage Vehicle Catalog</h1>
           {/* Button to add NEW model */}
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
               <Button className="bg-accent text-primary hover:bg-accent/90" onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Vehicle Model
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingModel ? 'Edit Vehicle Model' : 'Add New Vehicle Model'}</DialogTitle>
                <DialogDescription>
                  {editingModel ? 'Update the details of the vehicle model.' : 'Select the make and enter the new model name.'}
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
                 {/* Type might be inferred or selected separately if adding makes/types */}
                 {/* <div className="space-y-2">... Type Select ...</div> */}

                 <div className="space-y-2">
                    <Label htmlFor="makeName">Make</Label>
                    {/* Use Controller for Select with react-hook-form */}
                     <Controller
                        name="makeName"
                        control={control}
                        render={({ field }) => (
                             <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isSubmitting || isLoadingMakes}
                            >
                                <SelectTrigger id="makeName">
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
                    {errors.makeName && <p className="text-sm text-destructive">{errors.makeName.message}</p>}
                 </div>
                <div className="space-y-2">
                    <Label htmlFor="name">Model Name</Label> {/* Field name is 'name' */}
                    <Input id="name" placeholder="e.g., Yaris, Civic" {...register("name")} disabled={isSubmitting}/>
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                 <DialogFooter>
                     <DialogClose asChild>
                         <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                     </DialogClose>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSubmitting ? (editingModel ? 'Updating...' : 'Adding...') : (editingModel ? 'Update Model' : 'Add Model')}
                    </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">Add, view, edit and delete vehicle models available in the system.</p>
         {/* TODO: Add separate UIs or sections for managing Types and Makes if needed */}

          {error && !error.startsWith("Dialog Error:") && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
         )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Car className="text-accent" /> Vehicle Catalog</CardTitle>
            <CardDescription>List of currently managed vehicle models.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="flex justify-center items-center py-8">
                     <Loader2 className="h-8 w-8 animate-spin text-accent" />
                     <span className="ml-2 text-muted-foreground">Loading catalog...</span>
                 </div>
             ) : catalog.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catalog.map((item) => (
                      <TableRow key={item.id}> {/* Use model ID as key */}
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.make}</TableCell>
                        <TableCell>{item.model}</TableCell>
                        <TableCell className="text-right space-x-2">
                            {/* Edit button opens dialog with the specific model's data */}
                           <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)} title="Edit Model">
                                <Edit className="h-4 w-4 text-blue-500" />
                           </Button>
                            {/* Delete button targets the model ID */}
                           <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} title="Delete Model">
                                <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No vehicle models found in the catalog.</p>
              )}
          </CardContent>
        </Card>
      </div>
    </ProtectedComponent>
  );
}
