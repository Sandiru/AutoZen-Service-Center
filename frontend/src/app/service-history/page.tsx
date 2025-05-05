
"use client"; // Required for state and effects

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input"; // Import Input
import { Label } from "@/components/ui/label"; // Import Label
import { Button } from "@/components/ui/button"; // Import Button
import { History, Search, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format, parseISO } from 'date-fns'; // To format dates nicely
import { apiClient, getAuthToken } from '@/lib/api-client'; // Import apiClient
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import type { ServiceRecordDTO } from '@/types/dto'; // Import DTO type
import { useToast } from '@/hooks/use-toast';

export default function ServiceHistoryPage() {
  const { token } = useAuth(); // Get auth token
  const { toast } = useToast();
  const [serviceHistory, setServiceHistory] = useState<ServiceRecordDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [filteredHistory, setFilteredHistory] = useState<ServiceRecordDTO[]>([]);

  // Fetch history for the logged-in user
  const fetchHistory = useCallback(async () => {
    if (!token) {
        setIsLoading(false);
        setError("Authentication token not found. Please log in.");
        return;
    }
    setError('');
    setIsLoading(true);
    try {
        console.log("Fetching service history for user from API...");
        // Assuming backend endpoint /api/user/service-history requires auth
        const data = await apiClient<ServiceRecordDTO[]>('/user/service-history', { token });
        setServiceHistory(data || []);
        setFilteredHistory(data || []); // Initially show all history
        console.log("Fetched service history:", data);
    } catch (err: any) {
        const message = err.message || "Failed to load your service history.";
        setError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
        setServiceHistory([]);
        setFilteredHistory([]);
    } finally {
        setIsLoading(false);
    }
  }, [token, toast]);

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle search filtering (client-side for this example)
   useEffect(() => {
        if (!searchQuery) {
            setFilteredHistory(serviceHistory); // Show all if search is empty
            return;
        }
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = serviceHistory.filter(item =>
            item.vehicleMakeModelYear?.toLowerCase().includes(lowerQuery) || // Search vehicle desc
            item.serviceDetails?.toLowerCase().includes(lowerQuery) || // Search service details
            item.id?.toString().includes(lowerQuery) // Search service ID
        );
        setFilteredHistory(filtered);
    }, [searchQuery, serviceHistory]);


  return (
    <ProtectedComponent allowedRoles={["USER"]} redirectPath="/login"> {/* Ensure role matches backend */}
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Service History</h1>
        <p className="text-muted-foreground">View the records of your past vehicle services.</p>

         {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

         {/* Search/Filter Input */}
         <Card>
             <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Search className="text-accent" /> Filter History</CardTitle>
             </CardHeader>
             <CardContent className="flex gap-4 items-end">
                 <div className="flex-grow space-y-1">
                    <Label htmlFor="search-history">Search by Vehicle, Service, or ID...</Label>
                    <Input
                        id="search-history"
                        placeholder="Enter search term..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Button variant="outline" onClick={() => setSearchQuery('')} disabled={!searchQuery}>Clear</Button>
             </CardContent>
         </Card>


        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="text-accent" /> Your Past Services</CardTitle>
            <CardDescription>Details of maintenance and repairs performed on your vehicles.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                 <div className="flex justify-center items-center py-8">
                     <Loader2 className="h-8 w-8 animate-spin text-accent" />
                     <span className="ml-2 text-muted-foreground">Loading service history...</span>
                 </div>
            ) : filteredHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Services Performed</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      {/* Ensure date is valid before formatting */}
                      <TableCell>{item.serviceDateTime ? format(parseISO(item.serviceDateTime), 'PP p') : 'N/A'}</TableCell>
                      <TableCell>{item.vehicleMakeModelYear || `Vehicle ID: ${item.vehicleId}`}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{item.serviceDetails || 'N/A'}</TableCell>
                      <TableCell className="text-right">${item.totalCost?.toFixed(2) ?? 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : searchQuery ? (
                 <p className="text-center text-muted-foreground py-8">No service history found matching your search criteria.</p>
            ) : (
              <p className="text-center text-muted-foreground py-8">No service history found for your account.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedComponent>
  );
}
