import { apiClient } from "@/lib/api-client";
import type { AppointmentSlotDTO, HolidayDTO, ServiceFeeDTO } from "@/types/dto"; // Import DTO types

/**
 * Represents an appointment time slot.
 */
export interface TimeSlot {
  /**
   * The start time of the time slot.
   */
  startTime: string;
  /**
   * The end time of the time slot.
   */
  endTime: string;
}

/**
 * Asynchronously retrieves available time slots for a given date and required duration from the backend.
 *
 * @param date The date (YYYY-MM-DD) for which to retrieve time slots.
 * @param serviceDescriptions List of service descriptions selected by the user.
 * @param makeName The make of the vehicle.
 * @param modelName The model of the vehicle.
 * @returns A promise that resolves to a list of TimeSlot objects.
 */
export async function getTimeSlots(date: string, serviceDescriptions: string[], makeName: string, modelName: string): Promise<TimeSlot[]> {
  if (!date || serviceDescriptions.length === 0 || !makeName || !modelName) {
    console.warn("getTimeSlots called with missing parameters.");
    return [];
  }
  // Encode each service description properly for the URL query string
  const servicesQuery = serviceDescriptions.map(desc => `serviceDescriptions=${encodeURIComponent(desc)}`).join('&');
  // Path relative to API_BASE_URL
  const url = `/public/data/appointment-slots?date=${date}&${servicesQuery}&makeName=${encodeURIComponent(makeName)}&modelName=${encodeURIComponent(modelName)}`;
  console.log(`Fetching time slots from API: ${url}`);
  try {
    // Assuming backend returns AppointmentSlotDTO[]
    const data = await apiClient<AppointmentSlotDTO[]>(url);
    console.log("Fetched raw slots:", data);
    // Map DTO to TimeSlot if needed, otherwise adjust interface
    return data.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  } catch (error) {
    console.error("Failed to fetch time slots:", error);
    throw error;
  }
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  startTime: string | null; // HH:MM or null for full day
  endTime: string | null; // HH:MM or null for full day
  description?: string;
}

/**
 * Retrieves holidays from the backend API.
 * @returns A promise that resolves to a list of Holiday objects (mapped from DTOs).
 */
export async function getHolidays(): Promise<Holiday[]> {
  // Needs authentication if using admin endpoint. Consider a public holiday endpoint.
  // Path relative to API_BASE_URL
  const url = `/public/data/holidays`; // Assuming a public endpoint exists
  console.log(`Fetching holidays from API: ${url}`);
   try {
    // Backend returns HolidayDTO[]
    const data = await apiClient<HolidayDTO[]>(url);
    console.log("Fetched raw holidays:", data);
     // Map DTO to Holiday interface
     return data.map(dto => ({
        date: dto.date,
        startTime: dto.startTime ?? null, // Use nullish coalescing
        endTime: dto.endTime ?? null,
        description: dto.description ?? undefined // Handle potential null description
     }));
   } catch (error) {
     console.error("Failed to fetch holidays:", error);
     // Return empty array or rethrow based on desired behavior on error
     return [];
     // throw error;
   }
}

/**
 * Retrieves predefined services for a specific vehicle make and model for booking purposes.
 * @param makeName The make of the vehicle.
 * @param modelName The model of the vehicle.
 * @returns A promise that resolves to a list of ServiceFeeDTO objects.
 */
export async function getPredefinedServicesForBooking(makeName: string, modelName: string): Promise<ServiceFeeDTO[]> {
  if (!makeName || !modelName) {
    console.warn("getPredefinedServicesForBooking called with empty make or model.");
    return [];
  }
  // Path relative to API_BASE_URL
  const url = `/public/data/services?makeName=${encodeURIComponent(makeName)}&modelName=${encodeURIComponent(modelName)}`;
  console.log(`Fetching predefined services from API: ${url}`);
  try {
    const data = await apiClient<ServiceFeeDTO[]>(url);
    console.log("Fetched predefined services for booking:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch predefined services for booking:", error);
    throw error;
  }
}
