
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { PlusCircle, UserCog, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient, getAuthToken } from '@/lib/api-client'; // Import apiClient
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import type { CashierDTO } from '@/types/dto'; // Import DTO type
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const cashierSchema = z.object({
  name: z.string().min(1, "Cashier name is required"),
  phoneNo: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\d{3}-\d{3}-\d{4}$/, "Phone number must be in xxx-xxx-xxxx format"),
  email: z.string().email("Invalid email address"),
});

type CashierFormData = z.infer<typeof cashierSchema>;

export default function AdminCashiersPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [cashiers, setCashiers] = useState<CashierDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCashier, setEditingCashier] = useState<CashierDTO | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CashierFormData>({
    resolver: zodResolver(cashierSchema),
    defaultValues: { name: '', phoneNo: '', email: '' }
  });

  // Fetch cashiers
  const fetchCashiers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching cashiers from API...");
      const data = await apiClient<CashierDTO[]>('/admin/cashiers', { token });
      setCashiers(data || []);
      console.log("Fetched cashiers:", data);
    } catch (err: any) {
       const message = err.message || "Failed to fetch cashiers.";
       setError(message);
       toast({ title: "Error", description: message, variant: "destructive" });
       setCashiers([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchCashiers();
  }, [fetchCashiers]);

  const handleOpenDialog = (cashier: CashierDTO | null = null) => {
    setEditingCashier(cashier);
    if (cashier) {
      setValue('name', cashier.name);
      setValue('phoneNo', cashier.phoneNo);
      setValue('email', cashier.email);
    } else {
      reset({ name: '', phoneNo: '', email: '' });
    }
    setIsDialogOpen(true);
  };

  // Add/Update Cashier
  const onSubmit: SubmitHandler<CashierFormData> = async (data) => {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);
    const url = editingCashier ? `/admin/cashiers/${editingCashier.id}` : '/admin/cashiers';
    const method = editingCashier ? 'PUT' : 'POST';

    try {
      console.log(`${method === 'POST' ? 'Adding' : 'Updating'} cashier:`, data);
      const savedCashier = await apiClient<CashierDTO>(url, {
        method,
        body: JSON.stringify(data),
        token,
      });
      toast({
          title: "Success",
          description: `Cashier ${editingCashier ? 'updated' : 'added'} successfully.`,
      });
      setIsDialogOpen(false);
      fetchCashiers(); // Refresh the list
      reset();
    } catch (err: any) {
       const message = err.message || `Failed to ${editingCashier ? 'update' : 'add'} cashier.`;
       setError(`Dialog Error: ${message}`); // Show error in dialog if possible, or use toast
       toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Cashier
   const handleDelete = async (id: number | undefined) => {
     if (!token || id === undefined) return;
     if (window.confirm("Are you sure you want to delete this cashier? This action cannot be undone.")) {
        setIsLoading(true); // Use general loading indicator for delete row action
        setError(null);
        try {
            console.log("Deleting cashier ID:", id);
            await apiClient<void>(`/admin/cashiers/${id}`, { method: 'DELETE', token });
            toast({ title: "Success", description: "Cashier deleted successfully." });
            fetchCashiers(); // Refresh the list
        } catch (err: any) {
            const message = err.message || "Failed to delete cashier.";
            setError(message); // Show error near table or as general alert
            toast({ title: "Error", description: message, variant: "destructive" });
             setIsLoading(false); // Stop loading only on error for delete
        }
        // No finally block here, loading stops implicitly on list refresh or error set
     }
   }

  return (
    <ProtectedComponent allowedRoles={["ADMIN"]} redirectPath="/login">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Manage Cashiers</h1>
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
               <Button className="bg-accent text-primary hover:bg-accent/90" onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Cashier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCashier ? 'Edit Cashier' : 'Add New Cashier'}</DialogTitle>
                <DialogDescription>
                  {editingCashier ? 'Update the details for this cashier.' : 'Enter the name, phone number, and email for the new cashier.'}
                </DialogDescription>
              </DialogHeader>
              {/* Display form-specific error inside dialog */}
              {error && error.startsWith("Dialog Error:") && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.replace("Dialog Error: ", "")}</AlertDescription>
                  </Alert>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="e.g., John Doe" {...register("name")} disabled={isSubmitting}/>
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phoneNo">Phone Number</Label> {/* Changed htmlFor to phoneNo */}
                    <Input id="phoneNo" placeholder="xxx-xxx-xxxx" {...register("phoneNo")} disabled={isSubmitting}/> {/* Changed register name */}
                    {errors.phoneNo && <p className="text-sm text-destructive">{errors.phoneNo.message}</p>} {/* Changed error key */}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="e.g., john.doe@example.com" {...register("email")} disabled={isSubmitting}/>
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                 <DialogFooter>
                     <DialogClose asChild>
                         <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                     </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSubmitting ? (editingCashier ? 'Updating...' : 'Adding...') : (editingCashier ? 'Update Cashier' : 'Add Cashier')}
                    </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">Add, view, and manage the details of cashier staff.</p>

        {/* Display general errors here */}
        {error && !error.startsWith("Dialog Error:") && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
         )}


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCog className="text-accent" /> Cashier List</CardTitle>
            <CardDescription>Registered cashiers in the system.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                 <div className="flex justify-center items-center py-8">
                     <Loader2 className="h-8 w-8 animate-spin text-accent" />
                     <span className="ml-2 text-muted-foreground">Loading cashiers...</span>
                 </div>
             ) : cashiers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashiers.map((cashier) => (
                      <TableRow key={cashier.id}>
                        <TableCell className="font-medium">{cashier.name}</TableCell>
                        <TableCell>{cashier.phoneNo}</TableCell> {/* Use phoneNo */}
                        <TableCell>{cashier.email}</TableCell>
                        <TableCell className="text-right space-x-2">
                           <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(cashier)} title="Edit">
                                <Edit className="h-4 w-4 text-blue-500" />
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => handleDelete(cashier.id)} title="Delete">
                                <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No cashiers added yet.</p>
              )}
          </CardContent>
        </Card>
      </div>
    </ProtectedComponent>
  );
}
