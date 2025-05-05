
"use client"; // Add this directive

import { ProtectedComponent } from "@/components/ProtectedComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Wrench, CalendarCheck, UserPlus, Car, Tag, UserCog, DollarSign } from "lucide-react";
import { AnimatedPageWrapper } from "@/components/AnimatedPageWrapper"; // Import the wrapper

export default function AdminDashboardPage() {
  return (
    <ProtectedComponent allowedRoles={["ADMIN"]} redirectPath="/login">
      <AnimatedPageWrapper> {/* Wrap content */}
         <div className="space-y-8">
              <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage vehicles, services, staff, and appointments.</p>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Car className="text-accent"/> Vehicle Management</CardTitle>
                          <CardDescription>Add, view, and manage vehicle types, makes, and models.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/admin/vehicles" passHref>
                              <Button className="w-full">Manage Vehicles <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                      </CardContent>
                   </Card>

                   <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Tag className="text-accent"/> Service Fee Management</CardTitle>
                          <CardDescription>Set and update service fees for different vehicle models.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/admin/service-fees" passHref>
                               <Button className="w-full">Manage Fees <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                      </CardContent>
                   </Card>

                   <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><UserCog className="text-accent"/> Cashier Management</CardTitle>
                          <CardDescription>Add and manage cashier details.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/admin/cashiers" passHref>
                              <Button className="w-full">Manage Cashiers <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                      </CardContent>
                   </Card>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><CalendarCheck className="text-accent"/> Holiday Management</CardTitle>
                          <CardDescription>Define non-working days or specific time-off periods.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/admin/holidays" passHref>
                              <Button className="w-full">Manage Holidays <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                      </CardContent>
                   </Card>


                   <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><CalendarCheck className="text-accent"/> Appointment Overview</CardTitle>
                          <CardDescription>View and filter all scheduled appointments.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/admin/appointments" passHref>
                               <Button variant="secondary" className="w-full">View Appointments <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                      </CardContent>
                   </Card>

              </div>
         </div>
       </AnimatedPageWrapper>
    </ProtectedComponent>
  );
}
