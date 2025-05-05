
"use client"; // Add this directive

import { ProtectedComponent } from "@/components/ProtectedComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Users, Car, DollarSign, FileText, History, Search } from "lucide-react";
import { AnimatedPageWrapper } from "@/components/AnimatedPageWrapper"; // Import the wrapper


export default function CashierDashboardPage() {
  return (
    <ProtectedComponent allowedRoles={["CASHIER"]} redirectPath="/login">
      <AnimatedPageWrapper> {/* Wrap content */}
          <div className="space-y-8">
              <h1 className="text-3xl font-bold text-primary">Cashier Dashboard</h1>
              <p className="text-muted-foreground">Manage customer data, process payments, and view service history.</p>

               <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6"> {/* Adjusted grid columns */}
                   {/* Combined Customer/Billing Card */}
                   <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Search className="text-accent"/> Customer Lookup & Billing</CardTitle>
                          <CardDescription>Find/add customer & vehicle data, calculate bills, and print receipts.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/cashier/billing" passHref>
                               <Button className="w-full">Start Billing Process <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                      </CardContent>
                   </Card>

                   {/* Service History Card */}
                   <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><History className="text-accent"/> Vehicle Service History</CardTitle>
                          <CardDescription>Look up past service records for any vehicle or customer.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/cashier/history" passHref>
                              <Button variant="secondary" className="w-full">View History <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                      </CardContent>
                   </Card>
               </div>
          </div>
        </AnimatedPageWrapper>
    </ProtectedComponent>
  );
}
