import { Establishment, Service, Professional, Appointment, Review, WhatsAppAgent, ConversationLog } from '@/types';

// Generate default time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 19; hour++) {
    slots.push({ id: `slot-${hour}-00`, time: `${hour.toString().padStart(2, '0')}:00`, isActive: true });
    if (hour < 19) {
      slots.push({ id: `slot-${hour}-30`, time: `${hour.toString().padStart(2, '0')}:30`, isActive: true });
    }
  }
  return slots;
};

export const establishment: Establishment = {
  id: '1',
  name: 'Service Hub',
  logo: undefined,
  themeColor: '#8B5CF6',
  pixKey: 'pix@servicehub.com.br',
  portfolioImages: [
    { id: 'p1', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', title: 'Corte Moderno', isActive: true },
    { id: 'p2', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', title: 'Coloração', isActive: true },
    { id: 'p3', url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400', title: 'Manicure', isActive: true },
    { id: 'p4', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', title: 'Massagem', isActive: true },
    { id: 'p5', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400', title: 'Tratamento Facial', isActive: true },
    { id: 'p6', url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400', title: 'Spa', isActive: false },
  ],
  availableTimeSlots: generateTimeSlots(),
  workingHours: {
    open: '09:00',
    close: '19:00'
  }
};

export const services: Service[] = [
  {
    id: '1',
    name: 'Corte Feminino',
    description: 'Corte personalizado com lavagem e finalização',
    price: 80,
    duration: 60,
    category: 'Cabelo'
  },
  {
    id: '2',
    name: 'Coloração',
    description: 'Coloração completa com produtos premium',
    price: 150,
    duration: 120,
    category: 'Cabelo'
  },
  {
    id: '3',
    name: 'Manicure',
    description: 'Cuidado completo para as unhas das mãos',
    price: 40,
    duration: 45,
    category: 'Unhas'
  },
  {
    id: '4',
    name: 'Pedicure',
    description: 'Cuidado completo para os pés',
    price: 50,
    duration: 50,
    category: 'Unhas'
  },
  {
    id: '5',
    name: 'Massagem Relaxante',
    description: 'Massagem corporal para relaxamento',
    price: 120,
    duration: 60,
    category: 'Bem-estar'
  },
  {
    id: '6',
    name: 'Limpeza de Pele',
    description: 'Limpeza facial profunda com produtos especializados',
    price: 100,
    duration: 90,
    category: 'Estética'
  }
];

export const professionals: Professional[] = [
  {
    id: '1',
    name: 'Ana Silva',
    avatar: undefined,
    role: 'Cabeleireira',
    services: ['1', '2']
  },
  {
    id: '2',
    name: 'Carlos Santos',
    avatar: undefined,
    role: 'Manicure/Pedicure',
    services: ['3', '4']
  },
  {
    id: '3',
    name: 'Marina Costa',
    avatar: undefined,
    role: 'Esteticista',
    services: ['5', '6']
  }
];

export const appointments: Appointment[] = [
  {
    id: '1',
    serviceId: '1',
    serviceName: 'Corte Feminino',
    professionalId: '1',
    professionalName: 'Ana Silva',
    clientId: 'c1',
    clientName: 'Juliana Oliveira',
    clientPhone: '(11) 99999-1111',
    date: '2024-01-15',
    time: '09:00',
    status: 'confirmed',
    price: 80,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    serviceId: '3',
    serviceName: 'Manicure',
    professionalId: '2',
    professionalName: 'Carlos Santos',
    clientId: 'c2',
    clientName: 'Maria Santos',
    clientPhone: '(11) 99999-2222',
    date: '2024-01-15',
    time: '10:00',
    status: 'awaiting_validation',
    price: 40,
    paymentReceipt: 'receipt_001.jpg',
    paymentDate: '2024-01-14T15:00:00Z',
    createdAt: '2024-01-12T14:00:00Z'
  },
  {
    id: '3',
    serviceId: '5',
    serviceName: 'Massagem Relaxante',
    professionalId: '3',
    professionalName: 'Marina Costa',
    clientId: 'c3',
    clientName: 'Fernanda Lima',
    clientPhone: '(11) 99999-3333',
    date: '2024-01-15',
    time: '14:00',
    status: 'requested',
    price: 120,
    createdAt: '2024-01-14T09:00:00Z'
  },
  {
    id: '4',
    serviceId: '2',
    serviceName: 'Coloração',
    professionalId: '1',
    professionalName: 'Ana Silva',
    clientId: 'c1',
    clientName: 'Juliana Oliveira',
    clientPhone: '(11) 99999-1111',
    date: '2024-01-16',
    time: '09:00',
    status: 'awaiting_payment',
    price: 150,
    createdAt: '2024-01-14T11:00:00Z'
  },
  {
    id: '5',
    serviceId: '6',
    serviceName: 'Limpeza de Pele',
    professionalId: '3',
    professionalName: 'Marina Costa',
    clientId: 'c4',
    clientName: 'Camila Rocha',
    clientPhone: '(11) 99999-4444',
    date: '2024-01-14',
    time: '16:00',
    status: 'completed',
    price: 100,
    createdAt: '2024-01-10T08:00:00Z'
  }
];

export const reviews: Review[] = [
  {
    id: '1',
    appointmentId: '5',
    clientId: 'c4',
    clientName: 'Camila Rocha',
    rating: 5,
    comment: 'Excelente atendimento! A Marina é muito profissional e atenciosa.',
    createdAt: '2024-01-14T18:00:00Z',
    isHidden: false
  },
  {
    id: '2',
    appointmentId: 'old1',
    clientId: 'c1',
    clientName: 'Juliana Oliveira',
    rating: 4,
    comment: 'Muito bom, recomendo!',
    createdAt: '2024-01-08T12:00:00Z',
    response: 'Obrigada pelo feedback, Juliana! Esperamos você novamente.',
    isHidden: false
  }
];

export const whatsAppAgent: WhatsAppAgent = {
  id: '1',
  name: 'Bia',
  persona: 'Assistente virtual simpática e prestativa do Studio Beleza',
  tone: 'Amigável, profissional e acolhedor',
  isActive: true,
  totalConversations: 156,
  appointmentsGenerated: 42
};

export const conversationLogs: ConversationLog[] = [
  {
    id: '1',
    clientPhone: '(11) 99999-5555',
    messages: [
      { role: 'client', content: 'Ola, gostaria de agendar um corte de cabelo', timestamp: '2024-01-14T10:00:00Z' },
      { role: 'agent', content: 'Ola! Tudo bem? Claro, ficarei feliz em ajudar! Temos a Ana Silva disponivel. Qual dia seria melhor para voce?', timestamp: '2024-01-14T10:00:15Z' },
      { role: 'client', content: 'Pode ser amanha as 14h?', timestamp: '2024-01-14T10:01:00Z' },
      { role: 'agent', content: 'Perfeito! Agendei seu corte feminino com Ana Silva para amanha as 14h. O valor e R$ 80,00. Envio os dados para pagamento por Pix?', timestamp: '2024-01-14T10:01:20Z' }
    ],
    appointmentId: '1',
    createdAt: '2024-01-14T10:00:00Z'
  },
  {
    id: '2',
    clientPhone: '(11) 99999-6666',
    messages: [
      { role: 'client', content: 'Quais servicos voces oferecem?', timestamp: '2024-01-14T11:30:00Z' },
      { role: 'agent', content: 'Ola! Oferecemos diversos servicos: Corte Feminino (R$80), Coloracao (R$150), Manicure (R$40), Pedicure (R$50), Massagem Relaxante (R$120) e Limpeza de Pele (R$100). Posso ajudar a agendar algum?', timestamp: '2024-01-14T11:30:15Z' }
    ],
    createdAt: '2024-01-14T11:30:00Z'
  }
];
