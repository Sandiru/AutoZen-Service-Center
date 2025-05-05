
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Car, LogIn, LogOut, UserPlus, Wrench, User, Info, Mail, Home, LayoutDashboard } from "lucide-react"; // Import User icon
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle"; // Import ThemeToggle

export function Header() {
  const { role, username, logout } = useAuth();
  const pathname = usePathname();

  // Define navigation links
  const navLinks = [
    { href: "/about", label: "About Us", icon: Info },
    { href: "/contact", label: "Contact Us", icon: Mail },
  ];

  // Determine the correct dashboard path based on role
  const getDashboardPath = () => {
      switch (role) {
          case 'ADMIN': return '/admin';
          case 'CASHIER': return '/cashier';
          case 'USER': return '/dashboard';
          default: return '/login'; // Fallback to login if guest or role is unknown
      }
  };
  const dashboardPath = getDashboardPath();

  // Determine the correct dashboard link text/title based on role
   const getDashboardLinkLabel = () => {
     switch (role) {
       case 'ADMIN': return 'Admin'; // Shorter labels for space
       case 'CASHIER': return 'Cashier';
       case 'USER': return 'Dashboard';
       default: return 'Login';
     }
   };
   const dashboardLinkLabel = getDashboardLinkLabel();


  return (
    // Updated header style: transparent background, border, backdrop blur
    <header className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm transition-colors duration-500",
        // Dark mode styling adjustments if needed
        "dark:bg-background/75 dark:border-border/60"
      )}
    >
      {/* Main Navigation Bar */}
       {/* Use text-primary or text-foreground for better contrast on potentially light backgrounds */}
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand Logo/Name */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Wrench className="h-6 w-6 text-accent" />
          <span>AutoZen Services</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-4">
           {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary bg-primary/10" // Highlight active link with subtle background
                  : "text-foreground/70 hover:text-foreground hover:bg-accent/10", // Standard link colors
                 "dark:text-foreground/80 dark:hover:text-white dark:hover:bg-accent/20",
                 pathname === link.href && "dark:text-primary dark:bg-primary/20"
              )}
            >
               <link.icon className="h-4 w-4" />
               {link.label}
            </Link>
          ))}
           {/* Explicit Dashboard Link for Desktop (only if logged in) */}
           {role !== 'guest' && (
             <Link
                key={dashboardPath}
                href={dashboardPath}
                className={cn(
                   "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                   pathname === dashboardPath || pathname.startsWith(dashboardPath + '/') // Highlight if on dashboard or sub-pages
                    ? "text-primary bg-primary/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent/10",
                   "dark:text-foreground/80 dark:hover:text-white dark:hover:bg-accent/20",
                   pathname.startsWith(dashboardPath) && "dark:text-primary dark:bg-primary/20" // Adjusted active check for subpages
                )}
              >
                <LayoutDashboard className="h-4 w-4" /> {/* Use a dashboard icon */}
                {dashboardLinkLabel}
              </Link>
           )}
        </div>

        {/* Account/Login/Logout Icons & Theme Toggle - Right */}
        <div className="flex items-center gap-2"> {/* Added gap for spacing */}
           {/* Login Link (only for guests) */}
           {role === 'guest' && (
             <Link href="/login" passHref>
                <Button variant="ghost" size="icon" title="Login" className="text-foreground/70 hover:bg-accent/10 hover:text-foreground dark:text-foreground/80 dark:hover:bg-accent/20 dark:hover:text-white">
                  <User className="h-5 w-5" /> {/* Changed from LogIn to User */}
                  <span className="sr-only">Login</span>
                </Button>
             </Link>
           )}
           {/* Logout Button (only if logged in) */}
           {role !== 'guest' && (
             <Button variant="ghost" size="icon" title="Logout" className="text-foreground/70 hover:bg-accent/10 hover:text-foreground dark:text-foreground/80 dark:hover:bg-accent/20 dark:hover:text-white" onClick={logout}>
               <LogOut className="h-5 w-5" />
               <span className="sr-only">Logout</span>
             </Button>
           )}
           {/* Theme Toggle Button */}
           <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
       <div className="md:hidden flex justify-around items-center space-x-1 pb-2 pt-1 border-t border-border/40 dark:border-border/60">
            {navLinks.map((link) => (
                <Link
                    key={`mobile-${link.href}`}
                    href={link.href}
                    className={cn(
                        "flex flex-col items-center gap-1 p-1 rounded-md text-xs font-medium transition-colors flex-1 text-center", // Use flex-col for icon + text
                        pathname === link.href
                        ? "text-primary bg-primary/10"
                        : "text-foreground/70 hover:text-foreground hover:bg-accent/10",
                        "dark:text-foreground/80 dark:hover:text-white dark:hover:bg-accent/20",
                        pathname === link.href && "dark:text-primary dark:bg-primary/20"
                    )}
                    title={link.label}
                >
                    <link.icon className="h-5 w-5 mb-0.5" /> {/* Icon */}
                    <span className="block truncate w-full">{link.label}</span> {/* Text */}
                </Link>
            ))}
            {/* Dashboard/Login Link for Mobile */}
             <Link
                key={`mobile-dashboard`}
                href={dashboardPath}
                className={cn(
                    "flex flex-col items-center gap-1 p-1 rounded-md text-xs font-medium transition-colors flex-1 text-center", // Use flex-col
                     pathname === dashboardPath || pathname.startsWith(dashboardPath + '/')
                     ? "text-primary bg-primary/10"
                     : "text-foreground/70 hover:text-foreground hover:bg-accent/10",
                     "dark:text-foreground/80 dark:hover:text-white dark:hover:bg-accent/20",
                     pathname.startsWith(dashboardPath) && "dark:text-primary dark:bg-primary/20" // Adjusted active check
                )}
                title={dashboardLinkLabel}
            >
                {role === 'guest' ? <User className="h-5 w-5 mb-0.5" /> : <LayoutDashboard className="h-5 w-5 mb-0.5" />} {/* Changed from LogIn to User, Appropriate icon */}
                 <span className="block truncate w-full">{dashboardLinkLabel}</span> {/* Text */}
            </Link>
       </div>
    </header>
  );
}
