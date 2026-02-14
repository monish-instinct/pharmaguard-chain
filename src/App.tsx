import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import RoleDashboard from "./pages/RoleDashboard";
import RegisterBatch from "./pages/RegisterBatch";
import MyBatches from "./pages/MyBatches";
import VerifyBatch from "./pages/VerifyBatch";
import ConsumerVerify from "./pages/ConsumerVerify";
import Dashboard from "./pages/Dashboard";
import ScanLogs from "./pages/ScanLogs";
import Settings from "./pages/Settings";
import Alerts from "./pages/Alerts";
import AuditLogs from "./pages/AuditLogs";
import SupplyChain from "./pages/SupplyChain";
import TransferOwnership from "./pages/TransferOwnership";
import RecallBatch from "./pages/RecallBatch";
import TrustScores from "./pages/TrustScores";
import GlobalSearch from "./pages/GlobalSearch";
import BlockchainFeed from "./pages/BlockchainFeed";
import ReportIssue from "./pages/ReportIssue";
import ConsumerHistory from "./pages/ConsumerHistory";
import MedicineCabinet from "./pages/MedicineCabinet";
import SafetyFeed from "./pages/SafetyFeed";
import MedicineReviews from "./pages/MedicineReviews";
import FamilyMembers from "./pages/FamilyMembers";
import HealthTips from "./pages/HealthTips";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
            <Route path="/home" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
            <Route path="/consumer" element={<ConsumerVerify />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/my-safety" element={<ProtectedRoute><ConsumerHistory /></ProtectedRoute>} />
            <Route path="/cabinet" element={<ProtectedRoute><MedicineCabinet /></ProtectedRoute>} />
            <Route path="/safety-feed" element={<SafetyFeed />} />
            <Route path="/reviews" element={<MedicineReviews />} />
            <Route path="/family" element={<ProtectedRoute><FamilyMembers /></ProtectedRoute>} />
            <Route path="/health-tips" element={<HealthTips />} />
            <Route path="/register" element={<ProtectedRoute allowedRoles={['manufacturer']}><RegisterBatch /></ProtectedRoute>} />
            <Route path="/batches" element={<ProtectedRoute><MyBatches /></ProtectedRoute>} />
            <Route path="/verify" element={<VerifyBatch />} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['regulator']}><Dashboard /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><ScanLogs /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
            <Route path="/supply-chain" element={<ProtectedRoute><SupplyChain /></ProtectedRoute>} />
            <Route path="/transfer" element={<ProtectedRoute><TransferOwnership /></ProtectedRoute>} />
            <Route path="/recall" element={<ProtectedRoute allowedRoles={['manufacturer', 'regulator']}><RecallBatch /></ProtectedRoute>} />
            <Route path="/trust" element={<ProtectedRoute><TrustScores /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><GlobalSearch /></ProtectedRoute>} />
            <Route path="/feed" element={<ProtectedRoute><BlockchainFeed /></ProtectedRoute>} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
