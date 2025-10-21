import { Toaster } from "@/components/ui/toaster";
// v30.0 ULTIMATE FIX - FORCE NETLIFY UPDATE - NO SYMBOLS - SUPER RADICAL - ORANGE BUTTONS - NETLIFY READY - MAXIMUM RADICAL - FINAL FIX - GITHUB UPDATED - ORANGE CONFIRMED - FORCE PUSH - FINAL REPO - SUPER RADICAL - ARCHIVE READY - REAL CHANGES - VITE FIXED - GITHUB DIRECT
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<Index />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
