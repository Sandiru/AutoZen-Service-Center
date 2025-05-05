
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, PlusCircle, CalendarOff, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, parseISO, isValid } from 'date-fns';
import { cn } from "@/lib/utils";
import { apiClient, getAuthToken } from '@/lib/api-client'; // Import apiClient
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import type { HolidayDTO } from '@/types/dto'; // Import DTO type
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper to validate time string format HH:MM
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const isValidTime = (time: string | undefined | null): boolean => !time || timeRegex.test(time);

const holidaySchema = z.object({
  date: z.date({ required_error: "Date is required." }),
  // Use refine for optional time format validation
  startTime: z.string().optional().refine(isValidTime, "Invalid start time (HH:MM)"),
  endTime: z.string().optional().refine(isValidTime, "Invalid end time (HH:MM)"),
  description: z.string().optional(),
}).refine(data => {
    if (data.startTime && data.endTime) {
        // Only compare if both times are valid HH:MM strings
        if (timeRegex.test(data.startTime) && timeRegex.test(data.endTime)) {
            return data.endTime > data.startTime;
        }
        return true; // Allow if one or both are invalid format (caught by refine above) or empty
    }
    return true; // No need to compare if one or both are missing
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});


type HolidayFormData = z.infer<typeof holidaySchema>;

export default function AdminHolidaysPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [holidays, setHolidays] = useState<HolidayDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayDTO | null>(null);

  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: { startTime: '', endTime: '', description: '', date: undefined }
  });

  const watchedDate = watch('date');

  // Fetch holidays
  const fetchHolidays = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching holidays from API...");
      const data = await apiClient<HolidayDTO[]>('/admin/holidays', { token });
      setHolidays(data || []);
       console.log("Fetched holidays:", data);
    } catch (err: any) {
      const message = err.message || "Failed to fetch holidays.";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
      setHolidays([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleOpenDialog = (holiday: HolidayDTO | null = null) => {
    setEditingHoliday(holiday);
     setError(null); // Clear previous dialog errors
    if (holiday && holiday.date) {
        // Parse the string date back into a Date object for the calendar
        const dateObject = parseISO(holiday.date); // Use parseISO for YYYY-MM-DD
        setValue('date', isValid(dateObject) ? dateObject : undefined);
        setValue('startTime', holiday.startTime || '');
        setValue('endTime', holiday.endTime || '');
        setValue('description', holiday.description || '');
    } else {
        reset({ date: undefined, startTime: '', endTime: '', description: '' });
    }
    setIsDialogOpen(true);
  };

 // Add/Update Holiday
 const onSubmit: SubmitHandler<HolidayFormData> = async (data) => {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);

    const formattedDate = format(data.date, 'yyyy-MM-dd');
    // Only include times if they are valid HH:MM strings
    const startTime = data.startTime && timeRegex.test(data.startTime) ? data.startTime : null;
    const endTime = data.endTime && timeRegex.test(data.endTime) ? data.endTime : null;

    const payload: Partial<HolidayDTO> = { // Use Partial for update/create flexibility
        date: formattedDate,
        startTime: startTime ?? undefined, // Send null if empty/invalid, undefined if not present
        endTime: endTime ?? undefined,
        description: data.description || undefined, // Send undefined if empty
    };

    const url = editingHoliday ? `/admin/holidays/${editingHoliday.id}` : '/admin/holidays';
    const method = editingHoliday ? 'PUT' : 'POST';

    try {
      console.log(`${method === 'POST' ? 'Adding' : 'Updating'} holiday:`, payload);
      const savedHoliday = await apiClient<HolidayDTO>(url, {
        method,
        body: JSON.stringify(payload),
        token,
      });
      toast({
          title: "Success",
          description: `Holiday ${editingHoliday ? 'updated' : 'added'} successfully.`,
      });
      setIsDialogOpen(false);
      fetchHolidays(); // Refresh list
      reset();
    } catch (err: any) {
        const message = err.message || `Failed to ${editingHoliday ? 'update' : 'add'} holiday.`;
        setError(`Dialog Error: ${message}`);
        toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Delete Holiday
   const handleDelete = async (id: number | undefined) => {
     if (!token || id === undefined) return;
     if (window.confirm("Are you sure you want to delete this holiday/time off period?")) {
        setIsLoading(true); // Use general loading indicator
        setError(null);
        try {
            console.log("Deleting holiday ID:", id);
            await apiClient<void>(`/admin/holidays/${id}`, { method: 'DELETE', token });
            toast({ title: "Success", description: "Holiday/Time off deleted successfully." });
            fetchHolidays(); // Refresh list
        } catch (err: any) {
            const message = err.message || "Failed to delete holiday/time off.";
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
          <h1 className="text-3xl font-bold text-primary">Manage Holidays & Time Off</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
               <Button className="bg-accent text-primary hover:bg-accent/90" onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Holiday/Time Off
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingHoliday ? 'Edit Holiday/Time Off' : 'Add New Holiday/Time Off'}</DialogTitle>
                <DialogDescription>
                  {editingHoliday ? 'Update the details for this period.' : 'Define a non-working day or specific time period (leave times blank for full day).'}
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
                    <Label htmlFor="date">Date</Label>
                    {/* Use Controller for react-hook-form with custom components */}
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                    )}
                                     disabled={isSubmitting}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange} // Use field.onChange provided by Controller
                                    initialFocus
                                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                                />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                     {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time (HH:MM)</Label>
                        <Input id="startTime" type="time" {...register("startTime")} disabled={isSubmitting}/>
                         {errors.startTime && <p className="text-sm text-destructive">{errors.startTime.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endTime">End Time (HH:MM)</Label>
                        <Input id="endTime" type="time" {...register("endTime")} disabled={isSubmitting}/>
                         {errors.endTime && <p className="text-sm text-destructive">{errors.endTime.message}</p>}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input id="description" placeholder="e.g., Christmas Day, Maintenance" {...register("description")} disabled={isSubmitting}/>
                 </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                    </DialogClose>
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSubmitting ? (editingHoliday ? 'Updating...' : 'Adding...') : (editingHoliday ? 'Update Period' : 'Add Period')}
                    </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">Define non-working days or specific time periods when the service center is closed.</p>

         {error && !error.startsWith("Dialog Error:") && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
         )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarOff className="text-accent" /> Holiday & Time Off Schedule</CardTitle>
            <CardDescription>List of defined holidays and time-off periods.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="flex justify-center items-center py-8">
                     <Loader2 className="h-8 w-8 animate-spin text-accent" />
                     <span className="ml-2 text-muted-foreground">Loading schedule...</span>
                 </div>
             ) : holidays.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holidays.map((holiday) => (
                      <TableRow key={holiday.id}>
                         {/* Add check for valid date before formatting */}
                        <TableCell>{isValid(parseISO(holiday.date)) ? format(parseISO(holiday.date), 'PPP') : 'Invalid Date'}</TableCell>
                        <TableCell>{holiday.startTime || 'All Day'}</TableCell>
                        <TableCell>{holiday.endTime || 'All Day'}</TableCell>
                         <TableCell>{holiday.description || '-'}</TableCell>
                        <TableCell className="text-right space-x-2">
                           <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(holiday)} title="Edit">
                                <Edit className="h-4 w-4 text-blue-500" />
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => handleDelete(holiday.id)} title="Delete">
                                <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 <p className="text-muted-foreground text-center py-8">No holidays or time off periods added yet.</p>
              )}
          </CardContent>
        </Card>
      </div>
    </ProtectedComponent>
  );
}
