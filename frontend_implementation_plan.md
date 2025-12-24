# TicketBD: Frontend Implementation Plan

This document outlines the frontend architecture, user flows, and component structure for the TicketBD SaaS platform. It is designed to work seamlessly with the existing NestJS backend.

## Design System (Nishorgo Theme)
### Colors
- **Primary:** `#059669` (Emerald 600) - Main brand color, used for buttons and primary accents.
- **Secondary:** `#D97706` (Amber 600) - Highlights, gold accents, and CTA variations.
- **Accent:** `#064E3B` (Emerald 900) - Deep context, sidebars, and dark-mode elements.
- **Base:** `#F8FAFC` (Slate 50) - Clean backgrounds for readability.

### Aesthetic Principles
- **Modern Glassmorphism:** Subtle blur and transparency for cards and navbars (`backdrop-blur-md`).
- **Soft Shadows:** Elevation using `shadow-xl shadow-primary/10` to create depth.
- **Micro-interactions:** Hover effects on all buttons and cards (`hover:scale-[1.02]`, `transition-all`).
- **Typography:** Using **Outfit** or **Inter** for a premium, tech-focused readability.

### UI Components (DaisyUI + Custom)
- **Cards:** White or slate-50 base with thin borders (`border-slate-100`).
- **Buttons:** Rounded-full for a modern, friendly feel.
- **Inputs:** Focused state using the primary emerald color.

---

## 1. Domain & Routing Strategy (Triple-Entry System)
TicketBD follows a multi-entry architecture to isolate administrative burdens and provide a white-label experience for local organizers.

| Domain | Audience | Role(s) | Internal View Folder |
| --- | --- | --- | --- |
| `ticketbd.com` | Public / Organizers | **Tenant Admin** | `app/(marketing)/*` |
| `admin.ticketbd.com` | Platform Owner | **Platform Admin** | `app/admin/*` |
| `*.ticketbd.com` | Attendees / Staff | **Staff**, **Attendee** | `app/(tenant)/[slug]/*` |

### Entry Point Logic
1. **Central HUB (`ticketbd.com`)**: 
   - Public marketing and sales.
   - **Centralized Signup/Login for Tenant Admins**.
   - After login, Tenant Admins manage their subscription and launch their instance.
2. **Platform Admin (`admin.ticketbd.com`)**: 
   - Isolated environment for global platform control.
3. **Tenant Instances (`[slug].ticketbd.com`)**: 
   - Individualized storefront for each organizer.
   - **Local Login for Attendees and Staff**.
   - Staff use this site for check-ins; Attendees use it to buy/view tickets.

### Implementation with Next.js Middleware
Middleware handles host-based rewrites:
- `GET admin.ticketbd.com/dashboard` → Rewrite to `/admin/dashboard`
- `GET organizer1.ticketbd.com/events` → Rewrite to `/(tenant)/organizer1/events`
- `GET ticketbd.com/login` → Standard routing to `(marketing)/login` (Tenant Admin entry)

---

## 2. Shared Infrastructure
### Authentication & Guards
- **Login Page:** Centralized login for all users.
- **JWT Handling:** Store tokens in secure HttpOnly cookies (preferred) or encrypted LocalStorage.
- **Role-Based Layouts:** Interceptors to redirect users to their specific dashboards based on their role (`platform_admin`, `TenantAdmin`, `staff`).

### Common Components
- **Sidebar & Navbar:** Responsive navigation for dashboards.
- **Stat Cards:** Reusable cards for dashboard metrics.
- **DataTable:** Reusable table component with sorting, filtering, and pagination.
- **Modal System:** For CRUD operations (Creating events, etc.).

---

## 2. Platform Admin Module
*Routes: `/admin/*`*

| Route | View | Features |
| --- | --- | --- |
| `/admin` | Dashboard | Global metrics (SaaS health, revenue graph). |
| `/admin/tenants` | Tenant List | CRUD for organizers, status toggles (Active/Suspended). |
| `/admin/users` | User Mgmt | Manage platform-level admin accounts. |
| `/admin/payments` | Payment Audit | Table of all transactions across all tenants. |
| `/admin/webhooks` | Webhook Logs | List of received callbacks for debugging. |
| `/admin/logs` | Activity Logs | System-wide audit trail. |

---

## 3. Tenant Admin Module
*Entry Point: `ticketbd.com` (Main Hub)*

| Route | View | Features |
| --- | --- | --- |
| `/login` | Admin Auth | Login for Tenant Admins. |
| `/register` | Signup | Self-service registration & selection of subdomain. |
| `/dashboard` | Mgmt Center | Sales overview, instances list, subscription status. |
| `/events` | Events List | Manage all events across their tenant identity. |
| `/tickets` | Ticket Types | Define pricing tiers (GA, VIP). |
| `/settings` | Branding | logo, colors, and subdomain management. |

---

## 4. Tenant Event Site (Public + Operations)
*Entry Point: `[slug].ticketbd.com`*

| Route | View | Features |
| --- | --- | --- |
| `/` | Storefront | List of public events for the specific tenant. |
| `/login` | Local Auth | **Login for Attendees and Staff**. |
| `/staff` | Staff Portal | Mobile-optimized QR scanner and check-in list. |
| `/staff/lookup` | Manual Entry | Attendee lookup by name/email. |
| `/e/[slug]` | Event Page | Detail view and ticket selection. |
| `/checkout` | Payment | BDT payment (bKash, Nagad, etc.). |
| `/my-tickets` | Attendee Dash | View history and download QR code passes. |

---

## 5. Attendee Module
*Public Routes*

| Route | View | Features |
| --- | --- | --- |
| `/` | Landing Page | Promotion for organizers (TicketBD marketing). |
| `/explore` | Event Discovery| Search public events across all tenants. |
| `/e/[slug]` | Event Page | Booking interface for a specific event. |
| `/checkout` | Payment | Secure payment flow with BDT integration. |
| `/tickets/[token]`| QR Pass | Digital ticket with QR code for entry. |

---

## 6. Implementation Strategy
1. **Milestone 1:** Domain Middleware & Multitenancy Setup.
2. **Milestone 2:** Centralized Hub (Tenant Admin Auth & Billing).
3. **Milestone 3:** Platform Admin Isolation.
4. **Milestone 4:** Tenant Event Storefronts (Attendee/Staff login).
5. **Milestone 5:** Local Payment & QR System.

---

## Technical Considerations for Bangladesh
- **Network Optimization:** Lightweight pages for areas with spotty 3G/4G connectivity.
- **Offline Mode:** Cache event ticket lists for staff check-in in case of venue Wi-Fi failure.
- **Timezones:** Strict enforcement of BST (UTC+6) for all UI displays.
