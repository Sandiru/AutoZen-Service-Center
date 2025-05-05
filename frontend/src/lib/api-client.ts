// src/lib/api-client.ts
import { AuthContextType } from '@/contexts/AuthContext';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; // Use environment variable if set
const API_BASE_URL = 'http://localhost:8080/api'; // Direct URL for local development

interface ApiClientOptions extends RequestInit {
  token?: string | null;
}

/**
 * Makes an API request.
 *
 * @param endpoint The API endpoint (e.g., '/users'). Relative to API_BASE_URL.
 * @param options Fetch options (method, body, headers, etc.). Includes optional token.
 * @returns Promise<T> The parsed JSON response.
 * @throws {Error} If the network response is not ok.
 */
export async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  // Ensure endpoint starts with '/' for proper joining
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  

  // Add Authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // Assuming Bearer token auth
  }

  // Default to GET if no method specified
  const method = fetchOptions.method || 'GET';

  try {
    console.log(`Making API call: ${method} ${url}`);
    const response = await fetch(url, {
      ...fetchOptions,
      method,
      headers,
      //credentials: 'include',
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error(`API Error (${response.status}) on ${method} ${url}:`, errorData);
      } catch (e) {
        // If response is not JSON, use status text
        errorData = { message: response.statusText };
        console.error(`API Error (${response.status}) on ${method} ${url}: ${response.statusText}`);
      }
      // Attempt to extract a meaningful message
      const message = errorData?.message || errorData?.error || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    // Handle cases where the response might be empty (e.g., 204 No Content)
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType) {
        console.log(`API Success (${response.status}) on ${method} ${url} (No Content)`);
        return null as T; // Return null for 204 or missing content type
    }
    if (contentType && contentType.includes('application/json')) {
        const data: T = await response.json();
        console.log(`API Success (${response.status}) on ${method} ${url}`);
        return data;
     } else if (contentType && contentType.includes('text/plain')) {
         // Handle plain text response (e.g., for receipt)
         const textData = await response.text();
         console.log(`API Success (${response.status}) on ${method} ${url} (Plain Text)`);
         return textData as T; // Cast text to generic type T
    } else {
        console.log(`API Success (${response.status}) on ${method} ${url} (Non-JSON content type: ${contentType})`);
        // Handle other content types if necessary, or return null/throw error
        return null as T;
    }


  } catch (error) {
    console.error(`Network or parsing error on ${method} ${url}:`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Helper function to get the token from context or local storage
export function getAuthToken(auth: AuthContextType | null): string | null {
    // Prioritize context if available, otherwise check localStorage
    if (auth?.token) {
        return auth.token;
    }
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
}

// Example usage for authenticated requests:
// import { useAuth } from '@/contexts/AuthContext';
// const { token } = useAuth();
// const data = await apiClient('/protected-resource', { token });

// Example usage for public requests:
// const data = await apiClient('/public-resource');
