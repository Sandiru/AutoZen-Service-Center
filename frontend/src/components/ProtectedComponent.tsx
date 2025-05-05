
"use client";

import type { ReactNode } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedComponentProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallbackMessage?: string;
  redirectPath?: string; // Optional path to redirect if not authorized
}

export function ProtectedComponent({
  allowedRoles,
  children,
  fallbackMessage = "You do not have permission to access this content.",
  redirectPath
}: ProtectedComponentProps) {
  const { role } = useAuth();
   const router = useRouter();

  const isAuthorized = allowedRoles.includes(role);

  useEffect(() => {
    if (!isAuthorized && redirectPath) {
      router.push(redirectPath);
    }
  }, [isAuthorized, redirectPath, router]);


  if (isAuthorized) {
    return <>{children}</>;
  }

  if (redirectPath) {
    // Optionally show a loading or redirecting message while redirecting
     return (
        <div className="flex justify-center items-center h-64">
            <ShieldAlert className="h-12 w-12 text-destructive animate-pulse" />
            <p className="ml-4 text-lg text-muted-foreground">Redirecting...</p>
        </div>
     );
  }

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Access Denied</AlertTitle>
      <AlertDescription>{fallbackMessage}</AlertDescription>
    </Alert>
  );
}
