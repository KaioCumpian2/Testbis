// Types for the CRM/ERP system

export interface PortfolioImage {
  id: string;
  url: string;
  title: string;
  isActive: boolean;
}

export interface TimeSlot {
  id: string;
  time: string;
  isActive: boolean;
}

export interface Establishment {
  id: string;
  name: string;
  logo?: string;
  themeColor: string;
  pixKey: string;
  portfolioImages: PortfolioImage[];
  availableTimeSlots: TimeSlot[];
  workingHours: {
    open: string;
    close: string;
  };
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
}

export interface Professional {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  services: string[]; // service IDs
}

export type AppointmentStatus = 
  | 'requested' 
  | 'awaiting_payment' 
  | 'awaiting_validation' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled';

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  price: number;
  paymentReceipt?: string;
  paymentDate?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
  response?: string;
  isHidden: boolean;
}

export interface WhatsAppAgent {
  id: string;
  name: string;
  persona: string;
  tone: string;
  isActive: boolean;
  totalConversations: number;
  appointmentsGenerated: number;
}

export interface ConversationLog {
  id: string;
  clientPhone: string;
  messages: {
    role: 'client' | 'agent';
    content: string;
    timestamp: string;
  }[];
  appointmentId?: string;
  createdAt: string;
}

export interface FinancialKPI {
  totalRevenue: number;
  totalAppointments: number;
  avgTicket: number;
  completionRate: number;
}

export interface CommissionReport {
  professionalId: string;
  professionalName: string;
  totalAppointments: number;
  totalRevenue: number;
  commission: number;
  commissionRate: number;
}
