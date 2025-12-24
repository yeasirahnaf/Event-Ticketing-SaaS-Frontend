# Platform Admin: Design & Content Plan

## 1. Design Plan
- **Theme:** "Command Center" - High-density, professional, and data-rich.
- **Visuals:** Dark sidebar with emerald accents, clean white cards for metrics, and subtle shadows for depth.
- **Layout:** Fixed sidebar on the left, top search bar, and a scrollable main dashboard area.
- **Aesthetics:** Sleek, minimalist borders (`border-slate-100`), glassy headers, and professional typography (Inter/Outfit).

## 2. Page List
- **Dashboard (`/admin`):** System-wide overview (Health, SaaS revenue, active tenants).
- **Tenants (`/admin/tenants`):** Catalog of all organizers using the platform.
- **Platform Users (`/admin/users`):** Management of platform-level staff and other admins.
- **Payment Audit (`/admin/payments`):** Global transaction logs for revenue reconciliation.
- **Webhook Debugger (`/admin/webhooks`):** Logs for Stripe, mailer, and other service callbacks.
- **System Settings (`/admin/settings`):** Global configurations (Email templates, API keys).

## 3. Content Plan
- **Metric Cards:** Show "Total Revenue (BDT)", "Active Tenants", "Tickets Sold (24h)", and "System Status".
- **Tenant Management:** Detail views for each tenant showing their subscription type, owner info, and status toggle (Active/Suspended/Pending).
- **Audit Trails:** Activity logs mapping `actor_id` to actions like "Suspended Tenant X" or "Updated Global Config".
- **Payments Table:** Detailed rows with `provider_reference`, `order_id`, and `status`.
