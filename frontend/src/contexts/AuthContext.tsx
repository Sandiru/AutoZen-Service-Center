
"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client"; // Import the API client
import type { AuthRequestDTO, AuthResponseDTO, RegisterRequestDTO } from "@/types/dto"; // Assume DTO types are defined

export type UserRole = "ADMIN" | "CASHIER" | "USER" | "guest"; // Match backend roles

export interface AuthContextType {
  role: UserRole;
  username: string | null;
  token: string | null; // Add token state
  isLoading: boolean; // Add loading state for initialization
  login: (authRequest: AuthRequestDTO) => Promise<AuthResponseDTO>;
  register: (registerRequest: RegisterRequestDTO) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>("guest");
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // True while checking storage

  // Load auth state from localStorage on initial mount
  useEffect(() => {
    try {
        const storedToken = localStorage.getItem('authToken');
        const storedUsername = localStorage.getItem('authUsername');
        const storedRole = localStorage.getItem('authRole') as UserRole;

        if (storedToken && storedUsername && storedRole) {
            setToken(storedToken);
            setUsername(storedUsername);
            setRole(storedRole);
             console.log("Auth state restored from localStorage:", { username: storedUsername, role: storedRole });
        } else {
             console.log("No auth state found in localStorage.");
        }
    } catch (error) {
        console.error("Error reading auth state from localStorage:", error);
        // Clear potentially corrupted storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUsername');
        localStorage.removeItem('authRole');
    } finally {
        setIsLoading(false); // Finished loading initial state
    }
  }, []);

  const storeAuthState = (data: AuthResponseDTO) => {
     try {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUsername', data.username);
        localStorage.setItem('authRole', data.role);
        console.log("Auth state saved to localStorage:", { username: data.username, role: data.role, token:data.token });
     } catch (error) {
        console.error("Error saving auth state to localStorage:", error);
     }
  };

  const clearAuthState = () => {
     try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUsername');
        localStorage.removeItem('authRole');
         console.log("Auth state cleared from localStorage.");
     } catch (error) {
        console.error("Error clearing auth state from localStorage:", error);
     }
  };

  const login = useCallback(async (authRequest: AuthRequestDTO): Promise<AuthResponseDTO> => {
    console.log(`Attempting login for ${authRequest.username}`);
    try {
      const response = await apiClient<AuthResponseDTO>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(authRequest),
      });
      if (response && response.token && response.username && response.role) {
        setUsername(response.username);
        setRole(response.role);
        setToken(response.token);
        storeAuthState(response); // Store in localStorage
        console.log(`Login successful for ${response.username} as ${response.role}`);
        return response;
      } else {
          throw new Error("Invalid login response from server.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      logout(); // Ensure state is cleared on failure
      throw error; // Re-throw error to be handled by the caller (e.g., login form)
    }
  }, []); // Removed logout from dependencies as it has its own callback

  const register = useCallback(async (registerRequest: RegisterRequestDTO): Promise<void> => {
    console.log(`Attempting registration for ${registerRequest.username}`);
     try {
        // Assuming register endpoint returns void or a simple success message on 2xx
        await apiClient<void>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(registerRequest),
        });
        console.log(`Registration successful for ${registerRequest.username}`);
        // Optionally automatically log in the user after registration, or redirect to login
     } catch (error) {
        console.error("Registration failed:", error);
        throw error; // Re-throw error to be handled by the caller (e.g., register form)
     }
  }, []);

  const logout = useCallback(() => {
    console.log("Logging out user");
    setUsername(null);
    setRole("guest");
    setToken(null);
    clearAuthState(); // Clear localStorage
    // TODO: Optionally call a backend /api/auth/logout endpoint if necessary
  }, []);

  return (
    <AuthContext.Provider value={{ role, username, token, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
