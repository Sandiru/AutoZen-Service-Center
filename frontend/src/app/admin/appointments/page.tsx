
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, Filter, CalendarCheck, Loader2, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiClient, getAuthToken } from '@/lib/api-client'; // Import apiClient
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { AppointmentDTO, AppointmentFilterDTO, AppointmentStatus } from '@/types/dto'; // Import DTO types
import { useToast } from '@/hooks/use-toast';


export default function AdminAppointmentsPage() {
  const { token } = useAuth(); // Get auth token
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [vehicleIdFilter, setVehicleIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>(''); // Use enum type

  // Fetch appointments based on filters
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const filters: Partial<AppointmentFilterDTO> = {}; // Use Partial for optional filters
    if (startDate) filters.startDate = format(startDate, 'yyyy-MM-dd');
    if (endDate) filters.endDate = format(endDate, 'yyyy-MM-dd');
    if (vehicleIdFilter) filters.vehicleId = vehicleIdFilter; // Assuming backend searches by vehicleId (or chassis?)
    if (statusFilter) filters.status = statusFilter;

    const queryString = new URLSearchParams(filters as Record<string, string>).toString();
    const url = `/admin/appointments?${queryString}`;

    try {
        console.log(`Fetching appointments from ${url}`);
        const data = await apiClient<AppointmentDTO[]>(url, { token });
        setAppointments(data || []); // Handle null response
    } catch (err: any) {
        const message = err.message || "Failed to fetch appointments.";
        setError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
        setAppointments([]); // Clear appointments on error
    } finally {
        setIsLoading(false);
    }
  }, [startDate, endDate, vehicleIdFilter, statusFilter, token, toast]);

  // Initial fetch on component mount
  useEffect(() => {
    if (token) { // Only fetch if token is available
        fetchAppointments();
    }
  }, [fetchAppointments, token]); // Depend on fetchAppointments and token

  const handleFilter = () => {
    fetchAppointments(); // Re-fetch data with current filters
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setVehicleIdFilter('');
    setStatusFilter('');
    // Optionally re-fetch with cleared filters immediately
    fetchAppointments();
     console.log("Filters cleared");
  };

  return (
    <ProtectedComponent allowedRoles={["ADMIN"]} redirectPath="/login"> {/* Ensure role matches backend */}
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Appointment Overview</h1>
        <p className="text-muted-foreground">View and filter all scheduled appointments.</p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Filter className="text-accent" /> Filter Appointments</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4">
             <div className="space-y-1">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="start-date"
                        variant={"outline"}
                        className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                </Popover>
             </div>
              <div className="space-y-1">
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="end-date"
                        variant={"outline"}
                        className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                </Popover>
             </div>
             <div className="space-y-1">
                <Label htmlFor="vehicle-id">Vehicle ID / Chassis No</Label>
                <Input
                    id="vehicle-id"
                    placeholder="Vehicle ID / Chassis No"
                    value={vehicleIdFilter}
                    onChange={(e) => setVehicleIdFilter(e.target.value)}
                    className="max-w-xs"
                />
             </div>
             <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                 <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value as AppointmentStatus)}>
                    <SelectTrigger id="status" className="w-[180px]">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {/* Use AppointmentStatus enum values */}
                        <SelectItem value={AppointmentStatus.UPCOMING}>Upcoming</SelectItem>
                        <SelectItem value={AppointmentStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={AppointmentStatus.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                </Select>
             </div>

            <Button onClick={handleFilter} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters} disabled={isLoading}>Clear Filters</Button>
          </CardContent>
        </Card>

         {error && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Appointments</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
         )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarCheck className="text-accent" /> Scheduled Appointments</CardTitle>
            <CardDescription>List of appointments based on selected filters.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                 <div className="flex justify-center items-center py-8">
                     <Loader2 className="h-8 w-8 animate-spin text-accent" />
                     <span className="ml-2 text-muted-foreground">Loading appointments...</span>
                 </div>
             ) : appointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appt. ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">{appointment.id}</TableCell>
                        <TableCell>{format(new Date(appointment.date + 'T00:00:00'), 'PPP')}</TableCell>
                        <TableCell>{appointment.startTime}</TableCell>
                        <TableCell>{appointment.endTime}</TableCell>
                        <TableCell>{appointment.vehicleMakeModelYear || `ID: ${appointment.vehicleId}`}</TableCell>
                         <TableCell>{appointment.customerName || 'N/A'}</TableCell>
                         <TableCell>
                            <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                appointment.status === AppointmentStatus.UPCOMING && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                                appointment.status === AppointmentStatus.COMPLETED && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                                appointment.status === AppointmentStatus.CANCELLED && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            )}>
                                {/* Capitalize status */}
                                {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
                            </span>
                         </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No appointments found matching the filter criteria.</p>
              )}
          </CardContent>
        </Card>
      </div>
    </ProtectedComponent>
  );
}
