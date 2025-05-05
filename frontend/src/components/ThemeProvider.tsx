
"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { cn } from "@/lib/utils"; // Import cn utility

export function ThemeProvider({ children, ...props }: { children: ReactNode } & ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
