import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { EstablishmentProvider } from "@/contexts/EstablishmentContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Layouts
import { ClientLayout } from "./components/layout/ClientLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

// Client Pages
import ClientHome from "./pages/client/ClientHome";
import ClientBooking from "./pages/client/ClientBooking";
import ClientAppointments from "./pages/client/ClientAppointments";
import ClientReviews from "./pages/client/ClientReviews";
import ClientPortfolio from "./pages/client/ClientPortfolio";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAgenda from "./pages/admin/AdminAgenda";
import AdminServices from "./pages/admin/AdminServices";
import AdminProfessionals from "./pages/admin/AdminProfessionals";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminReports from "./pages/admin/AdminReports";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminWhatsApp from "./pages/admin/AdminWhatsApp";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <EstablishmentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* SaaS Marketing Landing Page */}
              <Route path="/" element={<Index />} />

              {/* Client Routes - Dynamic by Tenant Slug */}
              <Route path="/s/:slug" element={<ClientLayout />}>
                <Route index element={<ClientHome />} />
                <Route path="portfolio" element={<ClientPortfolio />} />
                <Route path="booking" element={<ClientBooking />} />
                <Route path="appointments" element={<ClientAppointments />} />
                <Route path="reviews" element={<ClientReviews />} />
              </Route>

              {/* Admin Routes - In a real SaaS, these would eventually be under /admin or /s/:slug/admin */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="agenda" element={<AdminAgenda />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="professionals" element={<AdminProfessionals />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="whatsapp" element={<AdminWhatsApp />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="notifications" element={<AdminNotifications />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </EstablishmentProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
