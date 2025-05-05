// src/types/dto.ts

// --- Auth ---
export interface AuthRequestDTO {
    username: string;
    password?: string; // Password might be optional in some contexts if using tokens
}

export interface RegisterRequestDTO {
    username: string;
    password?: string;
    role?: "ADMIN" | "CASHIER" | "USER"; // Match backend enum
}

export interface AuthResponseDTO {
    username: string;
    role: "ADMIN" | "CASHIER" | "USER"; // Match backend enum
    token: string;
}

// --- Vehicle Data ---
export interface VehicleTypeDTO {
    id?: number;
    name: string;
    makes?: VehicleMakeDTO[]; // For catalog view
}

export interface VehicleMakeDTO {
    id?: number;
    name: string;
    models?: VehicleModelDTO[]; // For catalog view
}

export interface VehicleModelDTO {
    id?: number;
    name: string;
    makeName?: string; // Use makeName for input, make object might be in response
}

export interface VehicleDTO {
     id?: number;
     vehicleId: string;
     make: string;
     model: string;
     year: number;
     chassisNo: string;
     ownerId?: number;
     ownerName?: string;
     ownerPhoneNo?: string;
}

// --- Service Fee ---
export interface ServiceFeeDTO {
    id?: number;
    description: string;
    make: string;
    model: string;
    fee: number; // Keep as number for simplicity on frontend, or use a BigDecimal library
    durationMinutes: number; // Added duration
}

// --- Cashier ---
export interface CashierDTO {
    id?: number;
    name: string;
    phoneNo: string;
    email: string;
}

// --- Holiday ---
export interface HolidayDTO {
    id?: number;
    date: string; // Use string for ISO date format
    startTime?: string; // Use string for HH:MM format
    endTime?: string;
    description?: string;
}

// --- Appointment ---
export enum AppointmentStatus {
    UPCOMING = 'UPCOMING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface AppointmentDTO {
    id?: number;
    date: string; // ISO date string
    startTime: string; // HH:MM string
    endTime: string; // HH:MM string
    vehicleId: number;
    vehicleMakeModelYear?: string;
    customerName?: string;
    vehicleIdentifier?: string;
    advanceFeePaid?: number; // Keep as number for frontend, backend uses BigDecimal
    paymentTransactionId?: string;
    status: AppointmentStatus;
}

export interface AppointmentFilterDTO {
    startDate?: string; // ISO date string
    endDate?: string;
    vehicleId?: string;
    chassisNo?: string;
    customerName?: string;
    status?: AppointmentStatus;
}

export interface AppointmentBookingRequestDTO {
    date: string; // ISO date string
    startTime: string; // HH:MM string
    vehicleIdentifier: string;
    make?: string;
    model?: string;
    year?: number;
    customerIdentifier: string; // Phone or NIC
    customerName?: string;
    customerAddress?: string;
    customerPhoneNo?:string;
    advanceFee: number; // Send as number, backend expects BigDecimal
    selectedServiceDescriptions: string[]; // Added list of services
    // paymentTransactionId? // If needed
}

export interface AppointmentSlotDTO {
    startTime: string; // HH:MM string
    endTime: string;
}

// --- Customer ---
export interface CustomerDTO {
    id?: number;
    name: string;
    address: string;
    phoneNo: string;
    nicNo: string;
    vehicles?: BasicVehicleInfoDTO[];
}

export interface BasicVehicleInfoDTO {
    id?: number;
    vehicleId: string;
    make: string;
    model: string;
    year: number;
}

export interface CustomerVehicleInputDTO {
    vehicleId: string;
    make: string;
    model: string;
    year: number;
    chassisNo: string;
    customerName: string;
    address: string;
    phoneNo: string;
    nicNo: string;
}


// --- Billing & History ---
export interface CustomServiceItemInputDTO {
    description: string;
    cost: number; // Send as number
}

export interface BillingRequestDTO {
    vehicleId: number;
    selectedServiceDescriptions?: string[];
    customItems?: CustomServiceItemInputDTO[];
    partsCost?: number; // Send as number
    processedByCashierUsername?: string;
}

export interface ServiceRecordDTO {
    id?: number;
    vehicleId: number;
    vehicleMakeModelYear?: string;
    serviceDateTime: string; // ISO DateTime string
    serviceDetails?: string; // Or a structured type if backend changes
    totalCost: number; // Keep as number for frontend
    processedByCashierName?: string;
    appointmentId?: number;
}

// --- Pre-Bill ---
export interface PreBillRequestDTO {
    make: string;
    model: string;
    selectedServiceDescriptions?: string[];
    customItems?: CustomServiceItemInputDTO[];
    estimatedPartsCost?: number; // Send as number
}

export interface ServiceCostDetailDTO {
    description: string;
    cost: number; // Keep as number for frontend
}

export interface PreBillResponseDTO {
    estimatedTotal: number; // Keep as number for frontend
    serviceBreakdown: ServiceCostDetailDTO[];
    partsCostEstimate: number; // Keep as number for frontend
}
export interface VehicleCustomerDetails {
    vehicle: VehicleDTO;
    customer: CustomerDTO;
}
export interface CustomerAndVehicleResponse {
          vehicle: VehicleDTO;
          customer: CustomerDTO;
}