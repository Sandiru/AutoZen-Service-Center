import { useAuth } from "@/contexts/AuthContext";
import { apiClient, getAuthToken } from "@/lib/api-client";
import type { VehicleTypeDTO, VehicleMakeDTO, VehicleModelDTO, ServiceFeeDTO, VehicleDTO, CustomerDTO, CustomerAndVehicleResponse, VehicleCustomerDetails} from "@/types/dto"; // Import DTO types

// --- Type Definitions ---

/**
 * Represents the make and model of a vehicle.
 */
export interface Vehicle {
  /**
   * The make of the vehicle (e.g., Toyota).
   */
  make: string;
  /**
   * The model of the vehicle (e.g., Yaris).
   */
  model: string;
}

/**
 * Represents data for a specific vehicle service.
 * Replaced by ServiceFeeDTO from backend
 */
// export interface ServiceData { ... }

/**
 * Represents the combined vehicle and customer details.
 */


/**
 * Represents the type of vehicle.
 * Using VehicleTypeDTO from backend
 */
export type VehicleType = { type: string }; // Keep simple type for component usage if needed


// --- API Functions ---

/**
 * Asynchronously retrieves vehicle types from the backend.
 * @returns A promise that resolves to a list of vehicle type DTOs.
 */
export async function getVehicleTypes(): Promise<VehicleTypeDTO[]> {
  console.log("Fetching vehicle types from API...");
  try {
    // Path relative to API_BASE_URL (which is http://localhost:8080/api)
    const data = await apiClient<VehicleTypeDTO[]>('/public/data/vehicle-types');
    console.log("Fetched vehicle types:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch vehicle types:", error);
    throw error; // Re-throw to allow caller handling
  }
}

/**
 * Asynchronously retrieves vehicle makes for a given vehicle type from the backend.
 * @param vehicleTypeName Optional type name to filter by.
 * @returns A promise that resolves to a list of vehicle make DTOs.
 */
export async function getVehicleMakes(vehicleTypeName?: string): Promise<VehicleMakeDTO[]> {
    const params = vehicleTypeName ? `?type=${encodeURIComponent(vehicleTypeName)}` : '';
    // Path relative to API_BASE_URL
    const url = `/public/data/vehicle-makes${params}`;
    console.log(`Fetching vehicle makes from API: ${url}`);
    try {
        const data = await apiClient<VehicleMakeDTO[]>(url);
        console.log("Fetched vehicle makes:", data);
        return data;
    } catch (error) {
        console.error("Failed to fetch vehicle makes:", error);
        throw error;
    }
}


/**
 * Asynchronously retrieves vehicle models for a given vehicle make from the backend.
 * @param vehicleMakeName The name of the vehicle make.
 * @returns A promise that resolves to a list of vehicle model DTOs.
 */
export async function getVehicleModels(vehicleMakeName: string): Promise<VehicleModelDTO[]> {
    if (!vehicleMakeName) {
        console.warn("getVehicleModels called with empty make name.");
        return []; // Avoid API call with empty parameter
    }
    // Path relative to API_BASE_URL
    const url = `/public/data/vehicle-models?makeName=${encodeURIComponent(vehicleMakeName)}`;
    console.log(`Fetching vehicle models from API: ${url}`);
    try {
        const data = await apiClient<VehicleModelDTO[]>(url);
        console.log("Fetched vehicle models:", data);
        return data;
    } catch (error) {
        console.error("Failed to fetch vehicle models:", error);
        throw error;
    }
}

/**
 * Asynchronously retrieves predefined service data (fees) for a given vehicle make and model.
 *
 * @param make The make of the vehicle.
 * @param model The model of the vehicle.
 * @returns A promise that resolves to a list of ServiceFeeDTO objects.
 */
export async function getPredefinedServices(make: string, model: string): Promise<ServiceFeeDTO[]> {
   if (!make || !model) {
     console.warn("getPredefinedServices called with empty make or model.");
     return []; // Avoid API call with missing parameters
   }
   // Path relative to API_BASE_URL
   const url = `/public/data/services?makeName=${encodeURIComponent(make)}&modelName=${encodeURIComponent(model)}`;
   console.log(`Fetching predefined services from API: ${url}`);
   try {
     const data = await apiClient<ServiceFeeDTO[]>(url);
     console.log("Fetched predefined services:", data);
     return data;
   } catch (error) {
     console.error("Failed to fetch predefined services:", error);
     throw error;
   }
}

/**
 * Asynchronously retrieves combined vehicle and customer details based on a vehicle identifier.
 * Uses the cashier endpoint as it returns combined data. Requires appropriate role/auth.
 * @param vehicleIdentifier Vehicle ID or Chassis Number.
 * @returns A promise resolving to VehicleCustomerDetails or null if not found.
 */
export async function getVehicleAndCustomerDetails(vehicleIdentifier: string): Promise<VehicleCustomerDetails | null> {
    if (!vehicleIdentifier) {
        console.warn("getVehicleAndCustomerDetails called with empty identifier.");
        return null;
    }
    // Using the cashier endpoint as it conveniently returns combined data
    // IMPORTANT: This implies the caller (e.g., appointment page) needs sufficient permissions (USER, CASHIER, ADMIN)
    // and the token must be passed if this endpoint is secured.
    const url = `/cashier/customer-vehicle?vehicleIdentifier=${encodeURIComponent(vehicleIdentifier)}`;
    console.log(`Fetching vehicle and customer details from API: ${url}`);
    try {
        // Assuming this endpoint requires authentication (pass token)
        // If the user is booking, they might own the vehicle, making this valid.
        // If it were truly public, a different endpoint structure would be needed.
        const token = getAuthToken(null); // Helper to get token from storage if needed
        // Expecting a JSON object like {"customer": {...}, "vehicle": {...}}
        
      
      const data = await apiClient<CustomerAndVehicleResponse>(url, { token });

        // Safely access properties and cast
        const vehicle = data?.['vehicle'] as VehicleDTO | undefined;
        const customer = data?.['customer'] as CustomerDTO | undefined;

        if (vehicle && customer) {
            return { vehicle, customer };
        }
        console.log(`Data structure mismatch or missing fields for identifier: ${vehicleIdentifier}`, data);
        return null; // Return null if structure is wrong or data is missing
    } catch (error: any) {
        // Handle 404 specifically to mean "not found" without throwing
        if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
            console.log(`Vehicle/Customer not found for identifier: ${vehicleIdentifier}`);
            return null;
        }
        console.error("Failed to fetch vehicle and customer details:", error);
        throw error; // Re-throw other errors
    }
}

// --- Deprecated/Replaced Function ---
/**
 * @deprecated Use getPredefinedServices instead.
 * Asynchronously retrieves service data for a given vehicle.
 */
// export async function getServiceData(vehicle: Vehicle): Promise<ServiceData> { ... }
