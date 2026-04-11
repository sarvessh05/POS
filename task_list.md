# 🍽️ POS WT — Restaurant System Task List

## Project Snapshot
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + Supabase + Clerk Auth  
**Current state:** Basic scaffolding exists — customer pages (Home, Menu, Cart, Booking), stub Admin & Waiter pages, all using mock data. No Supabase integration in UI, no QR flow, no KOT generation.

---

## 🗃️ Phase 0 — Database & Backend Foundations

> All real data flows start here. Tackle this before any UI wiring.

- [x] **Schema overhaul** — extend Supabase migration:
  - [x] Add `tables` table (`id`, `number`, `qr_token` UUID, `captain_id`, `section`, `seat_count`)
  - [x] Add `captains` table (`id`, `name`, `pin` VARCHAR(6), `assigned_table_ids[]`) — PIN set by Admin
  - [x] Add `kot` table (`id`, `order_id`, `printed_at`, `status: pending|printed`)
  - [x] Add `bills` table (`id`, `order_id`, `subtotal`, `tax_rate`, `tax_amount`, `tip`, `split_count`, `payment_method: upi|cash`, `paid_at`)
  - [x] Add `tax_config` table (`id`, `gst_rate`, `service_charge_rate`, `updated_by`)
  - [x] Add `is_exhausted` boolean column to `menu_items`
  - [x] Update `orders` — add `captain_id`, `kot_generated_at`, `bill_id`
  - [x] Write RLS policies for captain (own tables only), customer (own session), admin (all)
- [x] **Supabase Realtime** — enable channels for `orders`, `kot`, `menu_items`
- [x] **QR token generator** — edge function / script to generate & assign `qr_token` per table
- [x] **Authentication Strategy**:
  - [x] **Admin**: Supabase Auth (Email/Password)
  - [x] **Captain**: PIN-based login (Admin sets name/PIN, Captain dials in)
- [x] Remove Clerk dependency if unnecessary.

---

## 🌐 Phase 1 — Landing Page (Public Restaurant Website)

> Restaurant's public-facing marketing site. Mobile-responsive.

- [ ] **Navbar** — logo, nav links (Home, Menu, Book a Table), sticky with blur backdrop
- [ ] **Hero Section** — full-screen, restaurant ambience image/video background, CTA buttons ("View Menu", "Book a Table")
- [ ] **About / Story Section** — short restaurant blurb, warm imagery
- [ ] **Menu Preview Section** — read-only category grid + dish cards (no Add to Cart), pulls live from Supabase `menu_items` (skips `is_exhausted=true` or shows "Sold Out" badge)
- [ ] **Book a Table Page** (`/booking`) — date picker, time slot, guest count, name+phone form → writes to `table_bookings`
- [ ] **Offers / Highlights Section** — static promotional banners
- [ ] **Footer** — address, social links, hours; hidden dev links to Captain & Admin (tiny gray text, no obvious buttons)
- [ ] Responsive for mobile + desktop

---

## 📱 Phase 2 — Dine / Customer Screen (QR-based, Mobile-first)

> Opened via QR scan at table. Most animated screen. Mobile UX priority.

### QR & Table Binding
- [ ] Route: `/dine/:qr_token` — on load, validate token → fetch table record → store `table_id` + `table_number` in session/context
- [ ] If invalid token → friendly error screen

### Menu Experience (Animations Priority ⚡)
- [ ] **3D Dish Cards** using Stitch MCP — generate immersive 3D food imagery, integrate as card hero images
- [ ] Hover effects: card lift + shadow bloom + subtle plate spin on dish image
- [ ] Category filter tabs — sliding pill indicator animation
- [ ] Smooth scroll-based entrance animations (Intersection Observer)
- [ ] Skeleton loaders while fetching menu
- [ ] Items marked `is_exhausted` → greyed out with animated "Sold Out" stamp
- [ ] Veg/Non-Veg toggle with animated switch

### Cart & Order
- [ ] Floating cart bubble (count badge, wiggle on add)
- [ ] Cart sheet — slide-up drawer, item quantity controls with spring animation
- [ ] Special instructions per item (text input)
- [ ] **Order Confirmation** — confetti burst animation on placing order

### Rating Flow (triggers before bill)
- [ ] When customer taps **Request Bill** → full-screen modal: *"How was your experience?"*
- [ ] If **Yes, Rate** → show per-dish 1–5 star rating cards (one card per ordered dish, swipe-able), submit ratings to `dish_ratings` table, then proceed to bill
- [ ] If **Skip** → go directly to bill
- [ ] Rating cards: animated star fill, dish image thumbnail, spring bounce on star tap

### Billing & Payment (Key Feature)
- [ ] **Bill UI — Physical Receipt Aesthetic** (wow factor):
  - Render as a styled paper receipt: cream/off-white background, dashed dividers, monospace font for amounts, restaurant logo + name at top, "Thank You" footer
  - Default view shows only: dish names + quantities + **grand total** — NO tax math visible by default
  - Expandable "View Breakdown" accordion → reveals subtotal, GST, service charge, tip line-by-line (slides open with animation)
  - Subtle torn-paper edge CSS on top and bottom of the receipt card
  - Entry animation: receipt slides up from bottom and "prints" line by line
- [ ] **Split Bill** — animated bill-tear effect: receipt card visually tears into 2/3/4 pieces (CSS clip-path animation), each piece shows that person's share amount
- [ ] Tip selector — fixed cards: ₹10 / ₹20 / ₹50, highlight selected with scale+glow animation
- [ ] Tax line — fetched from `tax_config` (admin-set), hidden by default, visible in breakdown accordion
- [ ] **UPI Payment** — "Pay via UPI" button shows restaurant's static QR code (stored in env/DB), overlay with amount; "I've Paid" marks session as paid (no gateway)
- [ ] Cash option — "Pay at Counter" button
- [ ] Post-payment: confetti burst + "See you again!" success screen

### Order History (in-session)
- [ ] Customer can view their full order history for the current table session (all items ordered so far, even before bill)
- [ ] "Order More" button returns to menu with session preserved

---

## 👨‍🍳 Phase 3 — Captain's Page (Table-assigned Waiter View)

> Minimal UI, functional-first. Accessed via footer dev link (no nav button).

- [ ] Route: `/captain` (dev footer link only, no public navigation)
- [ ] **Captain Login (Dial Pad)**:
  - [ ] Screen choice between Admin (Email) and Captain (PIN)
  - [ ] PIN entry screen: 0-9 dial pad with "Enter" and "Clear" buttons
  - [ ] Verification against `captains` table in Supabase
  - [ ] Visual feedback for correct/incorrect PIN entry (vibrations, color changes)
- [ ] On login → fetch orders only for **their assigned tables** (filter by `captain_id`)
- [ ] **Single-page order list** — no tabs/pages:
  - **Top section:** New/active orders (pending KOT)
  - **Divider line** with label "KOT Generated"
  - **Bottom section:** Orders with KOT already done, sorted oldest-first
- [ ] Each order card shows: Table #, items list, time, status badge
- [ ] **Generate KOT** button — marks `kot.status = printed`, writes `kot_generated_at`, card animates down to bottom section
- [ ] **Realtime updates** — new orders appear at top automatically via Supabase channel
- [ ] Mark order as Served → moves out of list
- [ ] Minimal styling — clean, no clutter, readable at a glance

---

## 🏢 Phase 4 — Owner / Admin Dashboard

> Full control panel. Accessed via footer dev link. Minimal but information-rich.

- [ ] Route: `/admin` (dev footer link only)
- [ ] **Admin login** — Supabase Auth or hardcoded credential gate

### Revenue & Analytics
- [ ] Today's revenue, order count, average order value (live from `bills` + `orders`)
- [ ] Revenue chart — daily/weekly/monthly toggle (Recharts, already in deps)
- [ ] Table occupancy overview
- [ ] Most ordered dishes (aggregated from `order_items`)

### Menu Management
- [ ] List all dishes with category, price, veg/non-veg toggle, availability toggle
- [ ] **Add Dish** — form: name, category, description, price, image upload (Supabase Storage), veg flag
- [ ] **Edit Dish** — inline edit or modal
- [ ] **Delete Dish** — confirmation dialog
- [ ] **Mark as Exhausted** — toggle per dish; exhausted items hidden from customer QR menu
- [ ] Manage Categories — add/rename/delete categories

### Table & Captain Management
- [ ] List all tables with QR token status
- [ ] **Generate / Regenerate QR** per table → downloadable QR image
- [ ] Add/remove captains, assign tables to captains

### Tax & Config
- [ ] Set GST rate (%), service charge rate (%)
- [ ] Toggle whether to show service charge on bill
- [ ] Save settings → updates `tax_config` table

### Orders Overview
- [ ] Live all-orders feed with filters: table, status, date range
- [ ] KOT history view

---

## 🎨 Phase 5 — Design System & Polish

### Animation Guidelines
- **Customer screen only** — rich animations (3D cards, bill tear, confetti, hover effects)
- **Captain & Admin** — zero decorative animations, clean transitions only

### Stitch MCP — 3D Dish Imagery
- [ ] Use Stitch MCP to generate 3D food illustrations/renders per dish category
- [ ] Apply as hero images on customer menu cards
- [ ] Generate hero banner image for landing page

### Styling Tokens
- [ ] Audit existing Tailwind config — ensure color tokens (gold, sage, terracotta) are used consistently
- [ ] Google Font pairing — Display font for headings, clean sans for body
- [ ] Dark mode support (customer screen especially)

### Responsiveness
- [ ] Customer screen → 375px mobile-first, tested up to 430px
- [ ] Landing page → full responsive (375px → 1440px)
- [ ] Captain/Admin → desktop-optimized (min 768px)

---

## 🔌 Phase 6 — Integration & Wiring

- [ ] Replace all `mockData` imports with Supabase queries (`useQuery` + `supabase.from(...)`)
- [ ] Wire `CartContext` to post orders to Supabase on checkout
- [ ] Captain KOT flow → write to `kot` table, trigger Realtime event
- [ ] Admin menu changes → invalidate customer menu cache (React Query)
- [ ] `is_exhausted` changes reflect immediately on customer screen via Realtime

---

## 🧪 Phase 7 — Testing & QA

- [ ] Test QR token flow end-to-end (scan → table bind → order → bill)
- [ ] Split bill UI test — 2/3/4 pax splits with correct math
- [ ] Tax calculation — verify GST + service charge applied correctly
- [ ] Captain filter test — ensure captain only sees own tables' orders
- [ ] Admin menu CRUD — add/edit/delete/exhaust cycle
- [ ] Realtime test — new order appears on captain page without refresh
- [ ] Mobile responsiveness — customer screen on actual phone (or DevTools 390px)

---

## 💡 Additional Features (Included)

| Feature | Phase | Status |
|---|---|---|
| Order history per table session | Phase 2 | Added above |
| Dish ratings before bill | Phase 2 | Added above |
| Printer-friendly KOT PDF | Phase 3 | See below |
| Notification sound on new order | Phase 3 | See below |
| Admin: daily closing report | Phase 4 | See below |

### Captain additions
- [ ] **Notification sound** — play a chime when a new order arrives via Realtime (browser Audio API, toggle-able)
- [ ] **Print KOT as PDF** — `window.print()` styled KOT view or html-to-pdf; shows table #, items, time, special instructions

### Admin additions
- [ ] **Daily closing report** — button to generate end-of-day summary: total revenue, orders, top dishes, tips collected
- [ ] Export as PDF or printable page via `window.print()`

---

## ❌ Out of Scope (Explicitly)

- No payment gateway integration (UPI is QR-show only)
- No customer account / sign-up (anonymous session by table)
- No online delivery / takeaway ordering from QR
- No multi-branch support (single restaurant instance)

---

## 🛣️ Suggested Build Order

```
Phase 0 (DB) → Phase 1 (Landing) → Phase 3 (Captain MVP) → Phase 2 (Customer QR) → Phase 4 (Admin) → Phase 5 (Polish) → Phase 6 (Integration) → Phase 7 (QA)
```

> Build Captain before Customer so the KOT receiving side is ready when orders start flowing.
