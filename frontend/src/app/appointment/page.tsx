"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { addDays, format, isBefore, startOfDay, differenceInDays, parseISO, isValid, parse } from 'date-fns'; // Import parse
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Import CardFooter
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CalendarCheck, Clock, CreditCard, AlertCircle, Car, Wrench, CheckSquare, ArrowLeft, User } from "lucide-react"; // Added User icon
import { getTimeSlots, getHolidays, TimeSlot, Holiday, getPredefinedServicesForBooking } from '@/services/appointment'; // Import new service function
import { processPayment, PaymentConfirmation } from '@/services/payment'; // Keep simulated payment for now
import { ProtectedComponent } from '@/components/ProtectedComponent';
import { useToast } from '@/hooks/use-toast';
import { useAnnouncement } from '@/contexts/AnnouncementContext';
import { apiClient, getAuthToken } from '@/lib/api-client'; // Import apiClient
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import type { VehicleMakeDTO, VehicleModelDTO, AppointmentBookingRequestDTO, AppointmentDTO, ServiceFeeDTO, CustomerDTO, VehicleDTO } from '@/types/dto'; // Import DTO types
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { cn } from "@/lib/utils"; // Import cn
import { getVehicleAndCustomerDetails } from '@/services/vehicle-data'; // Import new service

const ADVANCE_FEE = 20; // Example advance fee - TODO: Get from configuration or service fee endpoint?

type WorkflowStage = 'vehicle_details' | 'customer_details' | 'select_services' | 'select_time' | 'confirm_booking';

export default function AppointmentPage() {
  const { token, username } = useAuth(); // Get auth token and username
  const { toast } = useToast();
  const { showAnnouncement } = useAnnouncement();

  // Workflow State
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('vehicle_details');

  // Vehicle Details State
  const [vehicleId, setVehicleId] = useState(''); // User input identifier
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [availableMakes, setAvailableMakes] = useState<VehicleMakeDTO[]>([]);
  const [availableModels, setAvailableModels] = useState<VehicleModelDTO[]>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingVehicleDetails, setIsLoadingVehicleDetails] = useState(false); // Loading state for fetching vehicle/customer data

  // Customer Details State (New)
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNic, setCustomerNic] = useState('');
  const [isCustomerDataPrefilled, setIsCustomerDataPrefilled] = useState(false);


  // Service Selection State
  const [availableServices, setAvailableServices] = useState<ServiceFeeDTO[]>([]);
  const [selectedServiceDescs, setSelectedServiceDescs] = useState<string[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [calculatedDuration, setCalculatedDuration] = useState<number>(0);

  // Date & Time State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>(''); // Store slot as "startTime-endTime" string
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);

  // UI State
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 30); // Allow booking for the next 30 days

  // --- Data Fetching ---

  // Fetch holidays initially
  useEffect(() => {
    const fetchHolidaysData = async () => {
      setIsLoadingHolidays(true);
      setError('');
      try {
        const fetchedHolidays = await getHolidays();
        setHolidays(fetchedHolidays);
      } catch (err) {
        setError('Failed to load holiday information.');
        console.error(err);
        setHolidays([]);
      } finally {
          setIsLoadingHolidays(false);
      }
    };
    fetchHolidaysData();
  }, []);

   // Fetch makes initially for vehicle selection
  useEffect(() => {
    const fetchMakesData = async () => {
      setIsLoadingMakes(true);
      setError('');
      try {
        const makes = await apiClient<VehicleMakeDTO[]>('/public/data/vehicle-makes');
        setAvailableMakes(makes || []);
      } catch (err) {
        console.error("Failed to load makes:", err);
        setError('Failed to load vehicle makes.');
        setAvailableMakes([]);
      } finally {
        setIsLoadingMakes(false);
      }
    };
    fetchMakesData();
  }, []);

   // Fetch models when make changes
  useEffect(() => {
    if (vehicleMake) {
      const fetchModelsData = async () => {
        setIsLoadingModels(true);
        setVehicleModel('');
        setError('');
        try {
          const models = await apiClient<VehicleModelDTO[]>(`/public/data/vehicle-models?makeName=${encodeURIComponent(vehicleMake)}`);
          setAvailableModels(models || []);
        } catch (err) {
          console.error("Failed to load models:", err);
          setError(`Failed to load models for ${vehicleMake}.`);
          setAvailableModels([]);
        } finally {
          setIsLoadingModels(false);
        }
      };
      fetchModelsData();
    } else {
      setAvailableModels([]);
      setVehicleModel('');
    }
  }, [vehicleMake]);

   // Fetch vehicle/customer details when moving to customer details stage
   const fetchAndPrefillCustomerDetails = useCallback(async () => {
    if (!vehicleId) return; // Need identifier to search
    setIsLoadingVehicleDetails(true);
    setError('');
    // Reset customer fields before fetching
    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
    setCustomerNic('');
    setIsCustomerDataPrefilled(false);

    try {
        const data = await getVehicleAndCustomerDetails(vehicleId);
        if (data?.customer && data?.vehicle) {
            console.log("Prefilling customer details:", data.customer);
            setCustomerName(data.customer.name);
            setCustomerAddress(data.customer.address);
            setCustomerPhone(data.customer.phoneNo);
            setCustomerNic(data.customer.nicNo);
            // Also update vehicle details if they were slightly different (e.g., casing)
            setVehicleMake(data.vehicle.make);
            setVehicleModel(data.vehicle.model);
            setVehicleYear(data.vehicle.year.toString());
            setIsCustomerDataPrefilled(true); // Mark as prefilled
             toast({ title: "Details Found", description: "Existing customer and vehicle details loaded.", variant: "default" });
        } else {
             console.log("No existing customer details found for vehicle ID:", vehicleId);
             // Keep fields empty for user input
             setIsCustomerDataPrefilled(false);
              toast({ title: "New Vehicle/Customer?", description: "Enter customer details for this vehicle.", variant: "default" });
        }
    } catch (err: any) {
        // Handle 404 or other errors gracefully
         if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
              console.log("No existing record found during prefill check for:", vehicleId);
               setIsCustomerDataPrefilled(false);
               toast({ title: "New Vehicle/Customer?", description: "Enter customer details for this vehicle.", variant: "default" });
         } else {
            console.error("Error fetching vehicle/customer details:", err);
            setError("Could not check for existing vehicle/customer details. Please enter manually.");
         }
    } finally {
        setIsLoadingVehicleDetails(false);
    }
   }, [vehicleId, toast]);


  // Fetch services when model is selected and moving to service stage
  useEffect(() => {
      const fetchServicesData = async () => {
        if (vehicleMake && vehicleModel) {
            setIsLoadingServices(true);
            setError('');
            try {
                 // Use the specific service layer function
                const services = await getPredefinedServicesForBooking(vehicleMake, vehicleModel);
                setAvailableServices(services);
                setSelectedServiceDescs([]); // Reset selection
                setCalculatedDuration(0);
            } catch (err: any) {
                setError(`Failed to load services for ${vehicleMake} ${vehicleModel}. ${err.message}`);
                setAvailableServices([]);
            } finally {
                setIsLoadingServices(false);
            }
        } else {
             setAvailableServices([]);
             setSelectedServiceDescs([]);
             setCalculatedDuration(0);
        }
      }
       if (workflowStage === 'select_services') {
            fetchServicesData();
       }
   }, [vehicleMake, vehicleModel, workflowStage]); // Depend on vehicleMake, vehicleModel, workflowStage


    // Calculate total duration when selected services change
    useEffect(() => {
        let duration = 0;
        selectedServiceDescs.forEach(desc => {
            const service = availableServices.find(s => s.description === desc);
            if (service && service.durationMinutes) {
                duration += service.durationMinutes;
            }
        });
        setCalculatedDuration(duration);
        // Reset time selection if duration changes
        setSelectedDate(undefined);
        setSelectedSlot('');
        setAvailableSlots([]);
    }, [selectedServiceDescs, availableServices]);


  // Fetch time slots when date and duration are available
  useEffect(() => {
    if (workflowStage === 'select_time' && selectedDate && calculatedDuration > 0) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      setIsLoadingSlots(true);
      setError('');
      setAvailableSlots([]);
      setSelectedSlot('');

      const fetchSlots = async () => {
        try {
          // Use service function that calls backend with duration
          const slots = await getTimeSlots(formattedDate, selectedServiceDescs, vehicleMake, vehicleModel);
          setAvailableSlots(slots);
           if (slots.length === 0) {
               toast({ title: "No Slots", description: "No available time slots found for the selected date and services.", variant: "default"});
           }
        } catch (err: any) {
          setError(err.message || 'Failed to load available time slots.');
          console.error(err);
          setAvailableSlots([]);
        } finally {
          setIsLoadingSlots(false);
        }
      };
      fetchSlots();
    } else {
        setAvailableSlots([]);
        //setSelectedSlot('');
    }
  }, [selectedDate, calculatedDuration, workflowStage, selectedServiceDescs, vehicleMake, vehicleModel, toast]); // Dependencies

 const isDateDisabled = (date: Date): boolean => {
    if (isBefore(date, today) || differenceInDays(date, today) > 30) {
      return true; // Disable past dates and dates beyond 30 days
    }
    const formattedDate = format(date, 'yyyy-MM-dd');
     // Check if the entire day is a holiday (no specific times set)
     return holidays.some(holiday => holiday.date === formattedDate && holiday.startTime === null && holiday.endTime === null);
   };

 const handleBooking = async () => {
    // Validate inputs across all stages
    if (!selectedDate || !selectedSlot) {
      setError("Please select a date and time slot.");
      toast({ title: "Missing Information", description: "Please select a date and time slot.", variant: "destructive" });
      return;
    }
     if (!vehicleId || !vehicleMake || !vehicleModel || !vehicleYear || selectedServiceDescs.length === 0) {
        setError("Please ensure all vehicle details and at least one service are selected.");
        toast({ title: "Missing Information", description: "Please complete vehicle details and service selection.", variant: "destructive" });
        return;
    }
    if (!customerName || !customerAddress || !customerPhone || !customerNic) {
         setError("Please ensure all customer details are entered.");
         toast({ title: "Missing Information", description: "Please complete customer details.", variant: "destructive" });
         return;
     }
     // Phone and NIC basic validation (could be more robust)
     if (customerPhone.length < 10 || !/^\d{3}-\d{3}-\d{4}$/.test(customerPhone)) {
         setError("Please enter a valid phone number (xxx-xxx-xxxx).");
         toast({ title: "Invalid Phone", description: "Please enter a valid phone number (xxx-xxx-xxxx).", variant: "destructive" });
         return;
     }
      if (customerNic.length < 5) { // Example basic NIC validation
         setError("Please enter a valid NIC number.");
         toast({ title: "Invalid NIC", description: "Please enter a valid NIC number.", variant: "destructive" });
         return;
     }
     const yearNum = parseInt(vehicleYear);
     if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
          setError("Please enter a valid vehicle year.");
          toast({ title: "Invalid Year", description: "Please enter a valid vehicle year.", variant: "destructive" });
          return;
     }
     if (!token || !username) {
         setError("Authentication error. Please log in again.");
         toast({ title: "Authentication Error", description: "Please log in to book an appointment.", variant: "destructive" });
         return;
     }


    setIsBooking(true);
    setError('');

    try {
      console.log('Attempting payment simulation for advance fee:', ADVANCE_FEE);
      const paymentResult: PaymentConfirmation = await processPayment(ADVANCE_FEE); // Keep simulated payment for now
      console.log('Simulated payment successful:', paymentResult);

      // Prepare booking request for backend
      const [startTime, ] = selectedSlot.split('-'); // Extract start time
      const bookingPayload: AppointmentBookingRequestDTO = {
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: startTime, // Send only start time, backend calculates end
          vehicleIdentifier: vehicleId, // Send user-provided identifier
          make: vehicleMake, // Send make/model/year for findOrCreate logic
          model: vehicleModel,
          year: yearNum,
          customerIdentifier: customerNic, // Using NIC as the primary identifier to link/create customer
          customerName: customerName,
          customerAddress: customerAddress,
          // Phone number might not be needed if NIC is identifier, but can include
          customerPhoneNo: customerPhone,
          selectedServiceDescriptions: selectedServiceDescs, // Include selected services
          advanceFee: ADVANCE_FEE,
          // paymentTransactionId: paymentResult.transactionId, // Can send payment ID if needed
      };

      console.log('Sending booking request to backend:', bookingPayload);

      // Call backend API to book appointment
      const createdAppointment = await apiClient<AppointmentDTO>('/user/appointments', {
          method: 'POST',
          body: JSON.stringify(bookingPayload),
          token: token,
      });

      console.log('Backend response - appointment created:', createdAppointment);

      const successMessage = `Appointment booked for ${vehicleMake} ${vehicleModel} on ${format(selectedDate, 'PPP')} at ${startTime}. Advance fee paid.`;

      toast({
        title: "Appointment Booked Successfully!",
        description: successMessage,
        variant: "default",
      });
      showAnnouncement(successMessage, 10000); // Show announcement bar

      // Reset form state completely
      setWorkflowStage('vehicle_details');
      setSelectedDate(undefined);
      setSelectedSlot('');
      setAvailableSlots([]);
      setVehicleId('');
      setVehicleMake('');
      setVehicleModel('');
      setVehicleYear('');
      setAvailableModels([]);
      setAvailableServices([]);
      setSelectedServiceDescs([]);
      setCalculatedDuration(0);
      setCustomerName('');
      setCustomerAddress('');
      setCustomerPhone('');
      setCustomerNic('');
      setIsCustomerDataPrefilled(false);


    } catch (err: any) {
      const message = err.message || 'Booking failed. Could not process payment or save appointment.';
      setError(message);
      console.error("Booking Error:", err);
       toast({
        title: "Booking Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Filter available slots based on holidays with specific times
  const timeSlotOptions = useMemo(() => {
     if (!selectedDate || !availableSlots.length || isLoadingHolidays) return [];

     const formattedDate = format(selectedDate, 'yyyy-MM-dd');
     const holidaysOnDate = holidays.filter(h => h.date === formattedDate && h.startTime && h.endTime);

     return availableSlots.filter(slot => {
         const slotStart = parse(slot.startTime, 'HH:mm', new Date()); // Use parse here
         const slotEnd = parse(slot.endTime, 'HH:mm', new Date()); // Use parse here

         for (const holiday of holidaysOnDate) {
             const holidayStart = parse(holiday.startTime!, 'HH:mm', new Date()); // Use parse here
             const holidayEnd = parse(holiday.endTime!, 'HH:mm', new Date()); // Use parse here
             // Check for overlap: (SlotStart < HolidayEnd) and (SlotEnd > HolidayStart)
             if (isBefore(slotStart, holidayEnd) && isBefore(holidayStart, slotEnd)) {
                  console.log(`Filtering out slot ${slot.startTime}-${slot.endTime} due to holiday ${holiday.startTime}-${holiday.endTime}`);
                 return false; // Slot conflicts with a holiday time-off period
             }
         }
         return true; // Slot is available
     });
  }, [availableSlots, selectedDate, holidays, isLoadingHolidays]);

   // --- Stage Progression Logic ---
   const canProceedFromVehicle = !!(vehicleId && vehicleMake && vehicleModel && vehicleYear && !isNaN(parseInt(vehicleYear)) && parseInt(vehicleYear) > 1900 && parseInt(vehicleYear) <= new Date().getFullYear() + 1);
   const canProceedFromCustomer = !!(customerName && customerAddress && customerPhone && /^\d{3}-\d{3}-\d{4}$/.test(customerPhone) && customerNic && customerNic.length >= 5);
   const canProceedFromServices = selectedServiceDescs.length > 0 && calculatedDuration > 0;
   const canProceedFromTime = !!(selectedDate && selectedSlot);

    const handleNextStage = () => {
        setError(''); // Clear errors when moving stages
        if (workflowStage === 'vehicle_details' && canProceedFromVehicle) {
            fetchAndPrefillCustomerDetails(); // Fetch details before showing customer stage
            setWorkflowStage('customer_details');
        } else if (workflowStage === 'customer_details' && canProceedFromCustomer) {
            setWorkflowStage('select_services');
        } else if (workflowStage === 'select_services' && canProceedFromServices) {
            setWorkflowStage('select_time');
        } else if (workflowStage === 'select_time' && canProceedFromTime) {
            setWorkflowStage('confirm_booking');
        }
    };

     const handlePreviousStage = () => {
         setError(''); // Clear errors
         if (workflowStage === 'customer_details') {
             setWorkflowStage('vehicle_details');
         } else if (workflowStage === 'select_services') {
             setWorkflowStage('customer_details');
         } else if (workflowStage === 'select_time') {
             setWorkflowStage('select_services');
         } else if (workflowStage === 'confirm_booking') {
             setWorkflowStage('select_time');
         }
     };

  // --- Service Selection Handler ---
   const handleServiceToggle = (description: string) => {
        setSelectedServiceDescs(prev =>
            prev.includes(description)
                ? prev.filter(item => item !== description)
                : [...prev, description]
        );
    };


  return (
    <ProtectedComponent allowedRoles={["USER", "CASHIER", "ADMIN"]} redirectPath="/login">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-primary text-center">Book Your Service Appointment</h1>
         <p className="text-muted-foreground text-center">
            Complete the steps below to schedule your service.
         </p>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stage 1: Vehicle Details Card */}
         <Card className={`shadow-lg ${workflowStage === 'vehicle_details' ? '' : 'hidden'}`}>
             <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Car className="text-accent" /> Step 1: Vehicle Details</CardTitle>
                 <CardDescription>Enter the details of the vehicle you want to book service for.</CardDescription>
             </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="vehicle-id">Vehicle ID / License Plate</Label>
                     <Input
                         id="vehicle-id"
                         placeholder="e.g., V-XYZ123 or Plate No"
                         value={vehicleId}
                         onChange={(e) => setVehicleId(e.target.value)}
                     />
                 </div>
                 <div className="space-y-2">
                     <Label htmlFor="vehicle-make">Make</Label>
                     <Select onValueChange={setVehicleMake} value={vehicleMake} disabled={isLoadingMakes}>
                         <SelectTrigger id="vehicle-make">
                             <SelectValue placeholder={isLoadingMakes ? "Loading..." : "Select Make"} />
                         </SelectTrigger>
                         <SelectContent>
                             {availableMakes.map((make) => (
                                 <SelectItem key={make.id} value={make.name}>{make.name}</SelectItem>
                             ))}
                             {availableMakes.length === 0 && !isLoadingMakes && <SelectItem value="no-makes" disabled>No makes found</SelectItem>}
                         </SelectContent>
                     </Select>
                 </div>
                  <div className="space-y-2">
                     <Label htmlFor="vehicle-model">Model</Label>
                     <Select onValueChange={setVehicleModel} value={vehicleModel} disabled={!vehicleMake || isLoadingModels}>
                         <SelectTrigger id="vehicle-model">
                             <SelectValue placeholder={isLoadingModels ? "Loading..." : "Select Model"} />
                         </SelectTrigger>
                         <SelectContent>
                             {availableModels.map((model) => (
                                 <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                             ))}
                             {availableModels.length === 0 && vehicleMake && !isLoadingModels && <SelectItem value="no-models" disabled>No models found</SelectItem>}
                             {!vehicleMake && <SelectItem value="select-make" disabled>Select make first</SelectItem>}
                         </SelectContent>
                     </Select>
                 </div>
                 <div className="space-y-2">
                     <Label htmlFor="vehicle-year">Year</Label>
                     <Input
                         id="vehicle-year"
                         type="number"
                         placeholder="e.g., 2019"
                         value={vehicleYear}
                         onChange={(e) => setVehicleYear(e.target.value)}
                         min="1900"
                         max={new Date().getFullYear() + 1}
                     />
                 </div>
             </CardContent>
              <CardFooter className="flex justify-end">
                 <Button onClick={handleNextStage} disabled={!canProceedFromVehicle || isLoadingVehicleDetails}>
                   {isLoadingVehicleDetails ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   Next: Customer Details
                 </Button>
             </CardFooter>
         </Card>

          {/* Stage 2: Customer Details Card */}
         <Card className={`shadow-lg ${workflowStage === 'customer_details' ? '' : 'hidden'}`}>
             <CardHeader>
                 <CardTitle className="flex items-center gap-2"><User className="text-accent" /> Step 2: Customer Details</CardTitle>
                 <CardDescription>Enter or confirm the customer details associated with this vehicle.</CardDescription>
             </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                     <Label htmlFor="customer-name">Name</Label>
                     <Input
                         id="customer-name"
                         placeholder="Full Name"
                         value={customerName}
                         onChange={(e) => setCustomerName(e.target.value)}
                         required
                     />
                 </div>
                 <div className="space-y-2">
                     <Label htmlFor="customer-address">Address</Label>
                     <Input
                         id="customer-address"
                         placeholder="Street Address, City"
                         value={customerAddress}
                         onChange={(e) => setCustomerAddress(e.target.value)}
                         required
                     />
                 </div>
                  <div className="space-y-2">
                     <Label htmlFor="customer-phone">Phone Number</Label>
                     <Input
                         id="customer-phone"
                         placeholder="xxx-xxx-xxxx"
                         value={customerPhone}
                         onChange={(e) => setCustomerPhone(e.target.value)}
                         required
                     />
                 </div>
                  <div className="space-y-2">
                     <Label htmlFor="customer-nic">NIC Number</Label>
                     <Input
                         id="customer-nic"
                         placeholder="National ID Card Number"
                         value={customerNic}
                         onChange={(e) => setCustomerNic(e.target.value)}
                         required
                         disabled={isCustomerDataPrefilled} // Disable if prefilled, backend handles updates if needed
                     />
                       {isCustomerDataPrefilled && <p className="text-xs text-muted-foreground mt-1">NIC cannot be changed for existing records.</p>}
                 </div>

             </CardContent>
             <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStage}>Back: Vehicle Details</Button>
                  <Button onClick={handleNextStage} disabled={!canProceedFromCustomer}>Next: Select Services</Button>
             </CardFooter>
         </Card>


        {/* Stage 3: Service Selection Card */}
         <Card className={`shadow-lg ${workflowStage === 'select_services' ? '' : 'hidden'}`}>
             <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Wrench className="text-accent" /> Step 3: Select Services</CardTitle>
                 <CardDescription>Choose the services needed for your {vehicleMake} {vehicleModel}. This will determine the appointment duration.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                  {isLoadingServices ? (
                         <p className="text-muted-foreground"><Loader2 className="inline mr-2 h-4 w-4 animate-spin"/>Loading services...</p>
                     ) : availableServices.length > 0 ? (
                         <div className="space-y-2">
                            {availableServices.map(service => (
                                <div key={service.description} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-secondary/50">
                                    <Checkbox
                                        id={`service-${service.description.replace(/\s+/g, '-')}`}
                                        checked={selectedServiceDescs.includes(service.description)}
                                        onCheckedChange={() => handleServiceToggle(service.description)}
                                    />
                                    <Label
                                        htmlFor={`service-${service.description.replace(/\s+/g, '-')}`}
                                        className="flex-grow cursor-pointer flex justify-between items-center"
                                    >
                                        <span>{service.description}</span>
                                        <span className='text-xs text-muted-foreground'>({service.durationMinutes} min)</span>
                                    </Label>
                                </div>
                            ))}
                         </div>
                     ) : (
                         <p className="text-muted-foreground">No predefined services found for this model.</p>
                     )}
                  {calculatedDuration > 0 && (
                    <p className='text-sm text-muted-foreground mt-2 font-medium'>Estimated Appointment Duration: {calculatedDuration} minutes</p>
                  )}
             </CardContent>
             <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStage}>Back: Customer Details</Button>
                  <Button onClick={handleNextStage} disabled={!canProceedFromServices}>Next: Select Time</Button>
             </CardFooter>
         </Card>


        {/* Stage 4: Date & Time Selection */}
        <Card className={`shadow-lg ${workflowStage === 'select_time' ? '' : 'hidden'}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarCheck className="text-accent" /> Step 4: Select Date & Time</CardTitle>
                 <CardDescription>Choose a date and an available time slot for your {calculatedDuration} minute appointment.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8 items-start">
                {/* Calendar */}
                 <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    fromDate={today}
                    toDate={maxDate}
                    initialFocus
                    className="rounded-md border"
                  />
                </div>
                {/* Time Slots */}
                 <div className="space-y-4">
                   <Label>Available Slots for {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}</Label>
                    {isLoadingSlots || isLoadingHolidays ? (
                     <div className="flex items-center justify-center h-20">
                        <Loader2 className="h-8 w-8 animate-spin text-accent" />
                        <span className="ml-2 text-muted-foreground">Loading slots...</span>
                     </div>
                    ) : timeSlotOptions.length > 0 ? (
                        <Select
                            onValueChange={setSelectedSlot}
                            value={selectedSlot}
                            disabled={!selectedDate || timeSlotOptions.length === 0}
                        >
                        <SelectTrigger>
                            <SelectValue placeholder="Select an available time slot" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeSlotOptions.map((slot) => {
                            const slotValue = `${slot.startTime}-${slot.endTime}`;
                            return (
                                <SelectItem key={slotValue} value={slotValue}>
                                    {slot.startTime} - {slot.endTime}
                                </SelectItem>
                            );
                            })}
                        </SelectContent>
                        </Select>
                    ) : (
                        <p className="text-center text-muted-foreground h-10 flex items-center justify-center">
                        {selectedDate ? 'No available slots for this date/duration.' : 'Select a date.'}
                        </p>
                    )}
                </div>
             </CardContent>
              <CardFooter className="flex justify-between">
                 <Button variant="outline" onClick={handlePreviousStage}>Back: Select Services</Button>
                 <Button onClick={handleNextStage} disabled={!canProceedFromTime}>Next: Confirm Booking</Button>
             </CardFooter>
        </Card>

         {/* Stage 5: Confirmation and Payment */}
         <Card className={`shadow-lg ${workflowStage === 'confirm_booking' ? '' : 'hidden'}`}>
             <CardHeader>
                 <CardTitle className="flex items-center gap-2"><CreditCard className="text-accent" /> Step 5: Confirm & Pay Advance</CardTitle>
                 <CardDescription>Review your appointment details and pay the advance fee to confirm.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                 {/* Appointment Summary */}
                 <div className="p-4 border rounded bg-secondary/50 space-y-2">
                     <h3 className="font-semibold text-primary mb-2">Appointment Summary</h3>
                     <p><strong>Vehicle:</strong> {vehicleYear} {vehicleMake} {vehicleModel} ({vehicleId})</p>
                     <p><strong>Customer:</strong> {customerName} ({customerNic})</p>
                     <p><strong>Phone:</strong> {customerPhone}</p>
                     {selectedDate && selectedSlot && (
                         <>
                             <p><strong>Date:</strong> {format(selectedDate, 'PPP')}</p>
                             {/* Display only start time */}
                             <p><strong>Time:</strong> {selectedSlot.split('-')[0]}</p>
                         </>
                     )}
                     {selectedServiceDescs.length > 0 && (
                        <div>
                            <p><strong>Services:</strong></p>
                            <ul className="list-disc list-inside pl-4 text-sm text-muted-foreground">
                                {selectedServiceDescs.map(desc => <li key={desc}>{desc}</li>)}
                            </ul>
                        </div>
                      )}
                     <p className="mt-4 text-lg font-semibold"><strong>Advance Fee:</strong> ${ADVANCE_FEE.toFixed(2)}</p>
                 </div>
             </CardContent>
             <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStage} disabled={isBooking}>Back: Select Time</Button>
                   <Button
                    size="lg"
                    onClick={handleBooking}
                    disabled={isBooking || !canProceedFromTime || !canProceedFromVehicle || !canProceedFromServices || !canProceedFromCustomer} // Check all stages
                    className="bg-accent text-primary hover:bg-accent/90"
                    >
                    {isBooking ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    {isBooking ? 'Processing...' : `Pay $${ADVANCE_FEE.toFixed(2)} & Confirm`}
                </Button>
             </CardFooter>
         </Card>

      </div>
    </ProtectedComponent>
  );
}
