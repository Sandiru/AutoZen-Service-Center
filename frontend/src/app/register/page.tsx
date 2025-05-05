
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react"; // Import Loader2
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import type { RegisterRequestDTO } from "@/types/dto"; // Import DTO type
import { cn } from "@/lib/utils"; // Import cn

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth(); // Get register function from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) { // Basic password length validation
        setError("Password must be at least 6 characters long.");
        return;
    }

    setIsLoading(true);
    const registerData: RegisterRequestDTO = {
        username,
        password,
        role: 'USER' // Default role for self-registration
    };

    try {
        await register(registerData); // Call context register
        toast({
            title: "Registration Successful!",
            description: `Welcome, ${username}! Please login to continue.`,
        });
        router.push("/login"); // Redirect to login after successful registration
    } catch (err: any) {
         const errorMessage = err.message || "Registration failed. Please try again.";
         setError(errorMessage);
         toast({
            title: "Registration Failed",
            description: errorMessage,
            variant: "destructive",
         });
         setIsLoading(false); // Stop loading on error
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Register</CardTitle>
          <CardDescription>Create your AutoZen Services account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min. 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                 className="focus:ring-accent"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                 className="focus:ring-accent"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-accent text-primary hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                 <UserPlus className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground flex-col gap-2">
           <p>Already have an account?</p>
            <Link href="/login" className={cn("text-accent hover:underline", isLoading && "pointer-events-none opacity-50")}>
              Login here
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
