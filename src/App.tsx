import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import RegisterBatch from "./pages/RegisterBatch";
import MyBatches from "./pages/MyBatches";
import VerifyBatch from "./pages/VerifyBatch";
import Dashboard from "./pages/Dashboard";
import ScanLogs from "./pages/ScanLogs";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterBatch />} />
            <Route path="/batches" element={<MyBatches />} />
            <Route path="/verify" element={<VerifyBatch />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/logs" element={<ScanLogs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
