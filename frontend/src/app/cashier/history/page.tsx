
"use client";

import React, { useState, useCallback } from 'react';
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { History, Search, AlertCircle, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format, parseISO } from 'date-fns';
import { apiClient, getAuthToken } from '@/lib/api-client'; // Import apiClient
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import type { ServiceRecordDTO } from '@/types/dto'; // Import DTO type
import { useToast } from '@/hooks/use-toast';

export default function CashierHistoryPage() {
  const { token } = useAuth(); // Get auth token
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceHistory, setServiceHistory] = useState<ServiceRecordDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false); // Track if a search has been done
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    if (!token) {
        setError("Authentication error. Please log in again.");
        toast({ title: "Error", description: "Authentication token not found.", variant: "destructive"});
        return;
    }
    if (!searchQuery) {
      setError("Please enter a search term (Vehicle ID, Chassis No, Customer Name, or NIC).");
      setServiceHistory([]);
      setSearchPerformed(true);
      return;
    }
    setIsLoading(true);
    setSearchPerformed(true);
    setError('');
    setServiceHistory([]); // Clear previous results

    try {
        const url = `/cashier/history/search?query=${encodeURIComponent(searchQuery)}`;
        console.log(`Searching history from API: ${url}`);
        const results = await apiClient<ServiceRecordDTO[]>(url, { token });
        setServiceHistory(results || []);
        console.log("Fetched history results:", results);
         if (!results || results.length === 0) {
             toast({ title: "No Results", description: "No service history found for the search criteria.", variant: "default" });
         }
    } catch (err: any) {
        const message = err.message || "Failed to fetch service history.";
        setError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
        setServiceHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, token, toast]);

  return (
    <ProtectedComponent allowedRoles={["CASHIER", "ADMIN"]} redirectPath="/login"> {/* Allow Admin too */}
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Vehicle Service History</h1>
        <p className="text-muted-foreground">Look up past service records for any vehicle or customer.</p>

         {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="text-accent" /> Find Service History</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 items-end">
            <div className="flex-grow space-y-1">
              <Label htmlFor="search-history">Search Term</Label>
              <Input
                  id="search-history"
                  placeholder="Vehicle ID, Chassis No, Customer Name, NIC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isLoading}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !searchQuery}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              {isLoading ? 'Searching...' : 'Search History'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="text-accent" /> Service Records</CardTitle>
            <CardDescription>
                {searchPerformed && !isLoading ? `Displaying service history based on search for "${searchQuery}"` : 'Enter a search term above to view history.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                 <div className="flex justify-center items-center py-8">
                     <Loader2 className="h-8 w-8 animate-spin text-accent" />
                     <span className="ml-2 text-muted-foreground">Loading history...</span>
                 </div>
            ) : serviceHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    {<TableHead>ProceedBy</TableHead>} {/* Add Customer Column */}
                    <TableHead>Services Performed</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.serviceDateTime ? format(parseISO(item.serviceDateTime), 'PP p') : 'N/A'}</TableCell>
                      <TableCell>{item.vehicleMakeModelYear || `Vehicle ID: ${item.vehicleId}`}</TableCell>
                       {/* Customer name might not be directly on ServiceRecordDTO, depends on backend mapping */}
                       {<TableCell>{item.processedByCashierName || 'N/A'}</TableCell>} {/* Placeholder - need customer name from backend */}
                      <TableCell className="whitespace-pre-wrap text-xs">{item.serviceDetails || 'N/A'}</TableCell>
                      <TableCell className="text-right">${item.totalCost?.toFixed(2) ?? 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : searchPerformed ? (
              <p className="text-center text-muted-foreground py-8">No service history found for the search criteria.</p>
            ) : (
              <p className="text-center text-muted-foreground py-8">Enter a search term above to begin.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedComponent>
  );
}
