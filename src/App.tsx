import { Toaster } from "@/components/ui/toaster";
// v29.0 ULTIMATE FIX - FORCE NETLIFY UPDATE - NO SYMBOLS - SUPER RADICAL - ORANGE BUTTONS - NETLIFY READY - MAXIMUM RADICAL - FINAL FIX - GITHUB UPDATED - ORANGE CONFIRMED - FORCE PUSH - FINAL REPO - SUPER RADICAL - ARCHIVE READY - REAL CHANGES - VITE FIXED
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
