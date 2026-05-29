import axios from 'axios';

// Create an axios instance pointing to the FastAPI backend
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple in-memory cache to make page navigation instantaneous
interface AppCache {
  tickets: Ticket[] | null;
  staff: Staff[] | null;
  guests: Guest[] | null;
  analytics: AnalyticsSummary | null;
}

const cache: AppCache = {
  tickets: null,
  staff: null,
  guests: null,
  analytics: null
};

export interface TriggerCallData {
  room_number: string;
  phone_number: string;
  scenario: string;
}

export interface Ticket {
  ticket_id: string;
  room_number: string;
  scenario: string;
  intent: string;
  extracted_data: {
    time?: string;
    items?: string;
    quantity?: string;
    unit?: string;
    notes?: string;
    intent?: string;
    scenario?: string;
    raw_source?: string;
    status?: string;
    room_number?: string;
  };
  status: string;
  created_at: string;
  updated_at: string;
  audio_url?: string;
  escalated?: boolean;
}

export const triggerCall = async (data: TriggerCallData) => {
  const response = await api.post('/calls/trigger_call', data);
  return response.data;
};

export interface GuestRingQr {
  room: string;
  ring_url: string;
  qr_url: string;
}

export const getGuestRingQr = async (room: string): Promise<GuestRingQr> => {
  const response = await axios.get(`${api.defaults.baseURL?.replace('/api', '')}/guest/ring/qr`, {
    params: { room },
  });
  return response.data;
};

export interface InboundPayload {
  transcript: string;
  room_number?: string;
  scenario?: string;
}

export const simulateInbound = async (data: InboundPayload) => {
  const response = await api.post('/calls/inbound_webhook', data);
  return response.data;
};

export const getTickets = async (): Promise<Ticket[]> => {
  const req = api.get('/tickets').then(res => {
    const rawTickets: Ticket[] = res.data.tickets;
    cache.tickets = rawTickets.map(t => {
      // If the NLP bot marked the ticket as completed inside extracted_data,
      // we elevate that status so the frontend UI correctly shows it as completed.
      if (t.extracted_data?.status === 'completed' || t.extracted_data?.status === 'done') {
        t.status = 'completed';
      }
      return t;
    });
    return cache.tickets;
  }).catch(err => {
    if (cache.tickets) return cache.tickets;
    throw err;
  });
  return cache.tickets ? cache.tickets : req;
};

export interface CreateTicketData {
  room_number: string;
  intent: string;
  items: string;
}

export const createTicket = async (data: CreateTicketData) => {
  const response = await api.post('/tickets/', data);
  return response.data;
};

export const updateTicketStatus = async (ticket_id: string, status: string) => {
  const response = await api.patch(`/tickets/${ticket_id}/status`, { status });
  return response.data;
};

export interface AppSettings {
  groq_api_key: string;
  botnoi_api_key: string;
}

export const getSettings = async (): Promise<AppSettings> => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (data: Partial<AppSettings>) => {
  const response = await api.post('/settings', data);
  return response.data;
};

// Staff
export interface Staff {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  shift?: string;
  status?: string;
}

export const getStaff = async (): Promise<Staff[]> => {
  const req = api.get('/staff').then(res => {
    cache.staff = res.data.staff;
    return cache.staff;
  }).catch(err => {
    if (cache.staff) return cache.staff;
    throw err;
  });
  return cache.staff ? cache.staff : req;
};

export const clearStaffCache = () => {
  cache.staff = null;
};

export const updateStaff = async (staffId: string, data: Partial<Staff>) => {
  const response = await api.patch(`/staff/${staffId}`, data);
  cache.staff = null;
  return response.data;
};

export const addStaff = async (data: Omit<Staff, 'id' | 'status'> & { id?: string; status?: string }) => {
  const response = await api.post('/staff', data);
  cache.staff = null;
  return response.data;
};

export const deleteStaff = async (staffId: string) => {
  const response = await api.delete(`/staff/${staffId}`);
  cache.staff = null;
  return response.data;
};

// Guests
export interface Guest {
  room_number: string;
  guest_name: string;
  phone_number?: string;
  preferred_scenario?: string;
  check_out_date: string;
  status: string;
}

export const getGuests = async (): Promise<Guest[]> => {
  const req = api.get('/guests').then(res => {
    cache.guests = res.data.guests;
    return cache.guests;
  }).catch(err => {
    if (cache.guests) return cache.guests;
    throw err;
  });
  return cache.guests ? cache.guests : req;
};

// Analytics
export interface AnalyticsSummary {
  total_calls: number;
  success_rate: string;
  escalation_rate: string;
  avg_talk_time: string;
  top_scenarios: Record<string, number>;
}

export const getAnalytics = async (): Promise<AnalyticsSummary> => {
  const req = api.get('/analytics').then(res => {
    cache.analytics = res.data;
    return cache.analytics;
  }).catch(err => {
    if (cache.analytics) return cache.analytics;
    throw err;
  });
  return cache.analytics ? cache.analytics : req;
};

export default api;
