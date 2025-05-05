
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Loader2 } from "lucide-react"; // Import Loader2
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { AuthRequestDTO } from "@/types/dto"; // Import DTO type
import { cn } from "@/lib/utils"; // Import cn

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for API call
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const loginData: AuthRequestDTO = { username, password };

    try {
      const response = await login(loginData); // Call context login

      // Redirect based on role from response
      let redirectPath = "/";
      switch (response.role) {
        case "ADMIN": redirectPath = "/admin"; break;
        case "CASHIER": redirectPath = "/cashier"; break;
        case "USER": redirectPath = "/dashboard"; break;
        default: redirectPath = "/"; // Fallback
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.username}! Redirecting...`,
      });
      router.push(redirectPath);

    } catch (err: any) {
        const errorMessage = err.message || "Login failed. Please check your credentials and try again.";
        setError(errorMessage);
        toast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive",
        });
        setIsLoading(false); // Stop loading on error
    }
    // No finally block needed for setIsLoading(false) as success leads to redirect
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Login</CardTitle>
          <CardDescription>Access your AutoZen Services account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading} // Disable input while loading
                className="focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading} // Disable input while loading
                 className="focus:ring-accent"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-accent text-primary hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                 <LogIn className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="text-center text-sm text-muted-foreground flex-col gap-2">
           <p>Don't have an account?</p>
            <Link href="/register" className={cn("text-accent hover:underline", isLoading && "pointer-events-none opacity-50")}>
              Register here
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
