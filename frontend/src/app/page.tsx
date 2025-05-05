
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, LogIn, UserPlus, Wrench, ShieldCheck, CalendarCheck, Calculator, Wand2, CheckCircle, HardHat, Users } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Home() {
  const { role } = useAuth();

  const renderGuestContent = () => (
    <div className="space-y-16">
        {/* Hero Introduction */}
        <motion.section
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="text-center"
        >
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Your trusted partner for comprehensive, reliable, and efficient vehicle maintenance and repair. Experience the AutoZen difference today.
            </p>
             <Link href="/register" passHref>
                 <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 shadow-md transition-transform hover:scale-105">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
             </Link>
        </motion.section>

        {/* Core Services Section */}
         <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
            className="grid md:grid-cols-3 gap-8 text-left"
        >
            <Card className="hover:shadow-xl transition-shadow duration-300 border-primary/20">
                <CardHeader>
                    <div className="p-3 rounded-full bg-primary/10 text-primary w-fit mb-3">
                        <Wrench className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-primary">Expert Repairs</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    From routine maintenance to complex diagnostics, our certified technicians handle it all with precision and care.
                </CardContent>
            </Card>
             <Card className="hover:shadow-xl transition-shadow duration-300 border-accent/20">
                <CardHeader>
                     <div className="p-3 rounded-full bg-accent/10 text-accent w-fit mb-3">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-primary">Transparent Pricing</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    Use our Pre-Bill Calculator for an upfront estimate. No surprises, just honest service and fair pricing.
                </CardContent>
            </Card>
             <Card className="hover:shadow-xl transition-shadow duration-300 border-primary/20">
                <CardHeader>
                    <div className="p-3 rounded-full bg-primary/10 text-primary w-fit mb-3">
                        <CalendarCheck className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-primary">Easy Scheduling</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    Book your appointment online in minutes. Choose a time that works for you from our available slots.
                </CardContent>
            </Card>
        </motion.section>

        {/* AI Recommender Highlight */}
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
            className="bg-gradient-to-r from-primary/5 via-white to-accent/5 dark:from-primary/10 dark:via-background dark:to-accent/10 p-8 rounded-lg shadow-md border border-border"
        >
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 text-accent">
                    <Wand2 className="h-16 w-16" />
                </div>
                <div className="flex-grow text-left">
                    <h2 className="text-2xl font-semibold text-primary mb-3">AI-Powered Service Recommendations</h2>
                    <p className="text-muted-foreground mb-4">
                        Not sure what your vehicle needs? Our intelligent AI tool analyzes your car's make, model, and year to suggest common services and potential issues, helping you stay ahead of maintenance.
                    </p>
                    <Link href="/ai-recommender" passHref>
                        <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-primary">
                        Ask Our AI <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.section>

         {/* Why Choose Us Section */}
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
            className="text-left"
        >
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">Why Choose AutoZen?</h2>
             <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4">
                     <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold mb-1">Quality Parts & Service</h3>
                        <p className="text-muted-foreground text-sm">We use high-quality parts and follow industry best practices for every service.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4">
                     <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold mb-1">Certified Technicians</h3>
                        <p className="text-muted-foreground text-sm">Our team is highly trained and experienced in servicing a wide range of vehicles.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-4">
                    <Calculator className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold mb-1">Transparent Process</h3>
                        <p className="text-muted-foreground text-sm">From pre-bill estimates to clear communication, we keep you informed.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4">
                    <HardHat className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                     <div>
                        <h3 className="font-semibold mb-1">Customer Focused</h3>
                        <p className="text-muted-foreground text-sm">Your satisfaction and vehicle safety are our top priorities.</p>
                    </div>
                </div>
             </div>
        </motion.section>
    </div>
  );

 const renderLoggedInContent = () => (
    <>
       <p className="text-lg text-muted-foreground mb-8">
        Access your dashboard or explore our services.
      </p>
      {/* No specific action needed here as the Header link handles navigation */}
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 overflow-x-hidden px-4 md:px-8"> {/* Added px-4 md:px-8 for horizontal padding */}
        {/* Hero Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Image
                src="https://picsum.photos/seed/autocare/1200/400"
                alt="Auto Service Banner"
                width={1200}
                height={400}
                className="rounded-lg shadow-lg mb-12 object-cover w-full max-w-6xl" // Added width constraints
                priority // Load image faster
            />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-primary mb-4"
        >
            Welcome to AutoZen Services
        </motion.h1>

        {/* Dynamic Content based on Auth State */}
        {role === "guest" ? renderGuestContent() : renderLoggedInContent()}

        {/* Common Section (AI Recommender Card) - Removed for Guest page, integrated above */}
        {/*
         <Card className="mt-12 w-full max-w-4xl">
           <CardHeader>
             <CardTitle className="flex items-center gap-2"><BarChart className="text-accent"/> AI Service Recommender</CardTitle>
             <CardDescription>Get AI-powered service suggestions for your vehicle.</CardDescription>
           </CardHeader>
           <CardContent className="text-left">
               <p className="mb-4">Unsure about what services your car needs? Our AI can help! Provide your vehicle's make, model, and year to get personalized recommendations.</p>
             <Link href="/ai-recommender" passHref>
               <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-primary">
                 Try AI Recommender <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
             </Link>
           </CardContent>
         </Card>
        */}
    </div>
  );
}
