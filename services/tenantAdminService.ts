import api from '@/lib/axios';

// --- Interfaces based on Backend DTOs ---

export enum EventStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    SCHEDULED = 'scheduled',
    ACTIVE = 'active',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

export interface CreateEventDto {
    name: string;
    slug: string;
    description: string;
    venue: string;
    city: string;
    country: string;
    startAt: Date | string;
    endAt: Date | string;
    status?: EventStatus;
}

export type UpdateEventDto = Partial<CreateEventDto>;

export interface EventSessionDto {
    event_id: string;
    title: string;
    description: string;
    start_at: Date | string;
    end_at: Date | string;
}

export enum TicketTypeStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    PAUSED = 'paused',
    SOLD_OUT = 'sold_out',
    CLOSED = 'closed',
}

export interface CreateTicketTypeDto {
    event_id: string;
    name: string;
    description: string;
    price_taka: number;
    currency: string;
    quantity_total: number;
    quantity_sold: number;
    sales_start: Date | string;
    sales_end: Date | string;
    status?: TicketTypeStatus;
}

export type UpdateTicketTypeDto = Partial<CreateTicketTypeDto>;

export enum DiscountType {
    PERCENTAGE = 'percentage',
    FIXED_AMOUNT = 'fixed_amount',
}

export enum DiscountStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    DISABLED = 'disabled',
}

export interface DiscountCodeDto {
    event_id: string;
    code: string;
    description: string;
    max_redemptions: number;
    times_redeemed: number;
    discount_type: DiscountType;
    discount_value: number;
    starts_at: Date | string;
    expires_at: Date | string;
    status?: DiscountStatus;
}

export enum OrderStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

export interface OrderDto {
    tenant_id: string;
    event_id: string;
    buyer_email: string;
    buyer_name: string;
    total_taka: number;
    currency: string;
    status?: OrderStatus;
    payment_intent_id?: string;
}

export interface InviteStaffDto {
    email: string;
    password?: string; // Optional in UI if auto-generated, but required by backend DTO if manual
    fullName: string;
    status?: 'active' | 'inactive';
}

export interface UpdateStaffDto {
    status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateTenantBrandingDto {
    brandingSettings?: Record<string, any>;
}

// --- Service Implementation ---

export const tenantAdminService = {
    // --- Events ---
    createEvent: async (data: CreateEventDto) => {
        const response = await api.post('/tenant-admin/events', data);
        return response.data;
    },

    getAllEvents: async () => {
        const response = await api.get('/tenant-admin/events');
        return response.data;
    },

    getEventById: async (eventId: string) => {
        const response = await api.get(`/tenant-admin/events/${eventId}`);
        return response.data;
    },

    updateEvent: async (eventId: string, data: Partial<CreateEventDto>) => {
        console.log('updateEvent called with:', { eventId, data });
        try {
            const response = await api.put(`/tenant-admin/events/${eventId}`, data);
            console.log('updateEvent response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('updateEvent error:', error?.response?.data || error?.message);
            throw error;
        }
    },

    deleteEvent: async (eventId: string) => {
        const response = await api.delete(`/tenant-admin/events/${eventId}`);
        return response.data;
    },

    getEventStats: async (eventId: string) => {
        const response = await api.get(`/tenant-admin/events/${eventId}/stats`);
        return response.data;
    },

    // --- Event Sessions ---
    createEventSession: async (data: EventSessionDto) => {
        const response = await api.post('/tenant-admin/event-sessions', data);
        return response.data;
    },

    getEventSessions: async (eventId: string) => {
        const response = await api.get(`/tenant-admin/events/${eventId}/sessions`);
        return response.data;
    },

    getEventSessionById: async (sessionId: string) => {
        const response = await api.get(`/tenant-admin/event-sessions/${sessionId}`);
        return response.data;
    },

    updateEventSession: async (sessionId: string, data: Partial<EventSessionDto>) => {
        const response = await api.put(`/tenant-admin/event-sessions/${sessionId}`, data);
        return response.data;
    },

    deleteEventSession: async (sessionId: string) => {
        const response = await api.delete(`/tenant-admin/event-sessions/${sessionId}`);
        return response.data;
    },

    // --- Ticket Types ---
    createTicketType: async (data: CreateTicketTypeDto) => {
        const response = await api.post('/tenant-admin/ticket-types', data);
        return response.data;
    },

    getTicketTypes: async (eventId: string) => {
        const response = await api.get(`/tenant-admin/events/${eventId}/ticket-types`);
        return response.data;
    },

    getTicketTypeById: async (ticketTypeId: string) => {
        const response = await api.get(`/tenant-admin/ticket-types/${ticketTypeId}`);
        return response.data;
    },

    updateTicketType: async (ticketTypeId: string, data: Partial<CreateTicketTypeDto>) => {
        const response = await api.put(`/tenant-admin/ticket-types/${ticketTypeId}`, data);
        return response.data;
    },

    deleteTicketType: async (ticketTypeId: string) => {
        const response = await api.delete(`/tenant-admin/ticket-types/${ticketTypeId}`);
        return response.data;
    },

    // --- Discount Codes ---
    createDiscountCode: async (data: DiscountCodeDto) => {
        const response = await api.post('/tenant-admin/discount-codes', data);
        return response.data;
    },

    getDiscountCodes: async (eventId: string) => {
        const response = await api.get(`/tenant-admin/events/${eventId}/discount-codes`);
        return response.data;
    },

    getDiscountCodeById: async (discountCodeId: string) => {
        const response = await api.get(`/tenant-admin/discount-codes/${discountCodeId}`);
        return response.data;
    },

    updateDiscountCode: async (discountCodeId: string, data: Partial<DiscountCodeDto>) => {
        const response = await api.put(`/tenant-admin/discount-codes/${discountCodeId}`, data);
        return response.data;
    },

    deleteDiscountCode: async (discountCodeId: string) => {
        const response = await api.delete(`/tenant-admin/discount-codes/${discountCodeId}`);
        return response.data;
    },

    // --- Orders ---
    getOrders: async (eventId?: string) => {
        const response = await api.get('/tenant-admin/orders', { params: { eventId } });
        return response.data;
    },

    getOrderById: async (orderId: string) => {
        const response = await api.get(`/tenant-admin/orders/${orderId}`);
        return response.data;
    },

    updateOrder: async (orderId: string, data: Partial<OrderDto>) => {
        const response = await api.put(`/tenant-admin/orders/${orderId}`, data);
        return response.data;
    },

    deleteOrder: async (orderId: string) => {
        const response = await api.delete(`/tenant-admin/orders/${orderId}`);
        return response.data;
    },

    // --- Tickets ---
    getTickets: async (orderId?: string) => {
        const response = await api.get('/tenant-admin/tickets', { params: { orderId } });
        return response.data;
    },

    getTicketById: async (ticketId: string) => {
        const response = await api.get(`/tenant-admin/tickets/${ticketId}`);
        return response.data;
    },

    updateTicket: async (ticketId: string, data: any) => { // Using any for brevity as Ticket parts are many
        const response = await api.put(`/tenant-admin/tickets/${ticketId}`, data);
        return response.data;
    },

    checkInTicket: async (ticketId: string) => {
        const response = await api.post(`/tenant-admin/tickets/${ticketId}/check-in`);
        return response.data;
    },

    // --- Staff Management ---
    getAllStaff: async (page = 1, limit = 20) => {
        const response = await api.get('/tenant-admin/tenant-users', { params: { page, limit } });
        const data = response.data;
        
        // Ensure we return an array and handle pagination
        const staffList = Array.isArray(data) ? data : (data as any).data || [];
        
        // Enrich staff data with user information if not already included
        return staffList.map((staff: any) => ({
            id: staff.id || staff.user_id,
            user_id: staff.user_id,
            tenant_id: staff.tenant_id,
            email: staff.email || staff.user?.email,
            fullName: staff.fullName || staff.full_name || staff.user?.full_name || staff.user?.fullName || 'Team Member',
            name: staff.name || staff.user?.name,
            role: staff.role,
            status: staff.status,
            ...staff
        }));
    },

    inviteStaff: async (data: InviteStaffDto) => {
        const response = await api.post('/tenant-admin/tenant-users', data);
        return response.data;
    },

    getStaffById: async (id: string) => {
        const response = await api.get(`/tenant-admin/tenant-users/${id}`);
        return response.data;
    },

    updateStaff: async (id: string, data: UpdateStaffDto) => {
        const response = await api.put(`/tenant-admin/tenant-users/${id}`, data);
        return response.data;
    },

    updateStaffStatus: async (id: string, status: string) => {
        const response = await api.patch(`/tenant-admin/tenant-users/${id}/status`, { status });
        return response.data;
    },

    removeStaff: async (id: string) => {
        const response = await api.delete(`/tenant-admin/tenant-users/${id}`);
        return response.data;
    },

    // --- Branding ---
    getTenantBranding: async () => {
        const response = await api.get('/tenant-admin/tenant/branding');
        return response.data;
    },

    updateTenantBranding: async (data: UpdateTenantBrandingDto) => {
        const response = await api.put('/tenant-admin/tenant/branding', data);
        return response.data;
    },
};
