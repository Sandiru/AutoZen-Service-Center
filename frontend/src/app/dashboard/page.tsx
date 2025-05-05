
"use client"; // Add this directive

import { ProtectedComponent } from "@/components/ProtectedComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calculator, CalendarCheck, History, Wand2 } from "lucide-react";
import { AnimatedPageWrapper } from "@/components/AnimatedPageWrapper"; // Import the wrapper


export default function UserDashboardPage() {
  return (
    <ProtectedComponent allowedRoles={["USER"]} redirectPath="/login">
      <AnimatedPageWrapper> {/* Wrap content */}
         <div className="space-y-8">
              <h1 className="text-3xl font-bold text-primary">My Dashboard</h1>
              <p className="text-muted-foreground">Manage your vehicles, appointments, and view service history.</p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Calculator className="text-accent"/> Pre-Bill Calculator</CardTitle>
                          <CardDescription>Get an estimate for your next service before booking.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/pre-bill" passHref>
                              <Button className="w-full">Calculate Estimate <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                      </CardContent>
                   </Card>

                   <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><CalendarCheck className="text-accent"/> Book Appointment</CardTitle>
                          <CardDescription>Schedule your service appointment easily.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/appointment" passHref>
                               <Button className="w-full">Schedule Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                      </CardContent>
                   </Card>

                   <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><History className="text-accent"/> Service History</CardTitle>
                          <CardDescription>View records of your past vehicle services.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/service-history" passHref>
                              <Button variant="secondary" className="w-full">View History <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </Link>
                      </CardContent>
                   </Card>

                   <Card className="hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Wand2 className="text-accent"/> AI Recommendations</CardTitle>
                          <CardDescription>Get personalized service suggestions for your vehicle.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/ai-recommender" passHref>
                               <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-primary">
                                  Get Recommendations <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                          </Link>
                      </CardContent>
                   </Card>
               </div>
          </div>
        </AnimatedPageWrapper>
    </ProtectedComponent>
  );
}
