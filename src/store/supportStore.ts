import { create } from 'zustand';
import { seedTicketMessages, seedTickets } from '@/mocks/data/tickets';
import type { SupportRefund, SupportTicket, TicketMessage, TicketStatus } from '@/types';

interface SupportState {
  tickets: SupportTicket[];
  messages: TicketMessage[];
  refunds: SupportRefund[];
  setStatus: (id: string, status: TicketStatus, resolutionNote?: string) => void;
  sendMessage: (ticketId: string, authorName: string, body: string) => void;
  issueRefund: (refund: Omit<SupportRefund, 'id' | 'initiatedAt' | 'status'>) => SupportRefund;
}

export const useSupportStore = create<SupportState>((set) => ({
  tickets: seedTickets,
  messages: seedTicketMessages,
  refunds: [],
  setStatus: (id, status, resolutionNote) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              status,
              resolutionNote: resolutionNote ?? ticket.resolutionNote,
              updatedAt: new Date().toISOString(),
            }
          : ticket,
      ),
    })),
  sendMessage: (ticketId, authorName, body) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `tm_${Date.now()}`,
          ticketId,
          author: 'agent',
          authorName,
          body,
          createdAt: new Date().toISOString(),
        },
      ],
      tickets: state.tickets.map((ticket) =>
        ticket.id === ticketId && ticket.status === 'new'
          ? { ...ticket, status: 'open' as TicketStatus, updatedAt: new Date().toISOString() }
          : ticket,
      ),
    })),
  issueRefund: (refund) => {
    const record: SupportRefund = {
      ...refund,
      id: `srf_${Date.now()}`,
      status: 'processing',
      initiatedAt: new Date().toISOString(),
    };
    set((state) => ({
      refunds: [record, ...state.refunds],
      tickets: state.tickets.map((ticket) =>
        ticket.id === refund.ticketId && ticket.status === 'new'
          ? { ...ticket, status: 'pending' as TicketStatus, updatedAt: new Date().toISOString() }
          : ticket,
      ),
    }));
    return record;
  },
}));
