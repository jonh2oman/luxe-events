# Luxe Events - Premium Event Operations & Ticketing Platform

Luxe Events is a fully functional, highly premium, glassmorphic concert ticketing and event operations dashboard built using **Next.js** and styled with custom **Vanilla CSS** tokens. 

The application is structured to run in a dual-operational mode: by default, it runs in a local **Mock Sandbox Mode** utilizing LocalStorage and `BroadcastChannel` synchronization. Once valid Firebase API credentials and Stripe keys are provided, it transitions instantly to live **Cloud Database Synchronization** and real-time operations.

---

## 🌟 Visual Preview of Generated Event Assets

These cinematic graphics are deployed across the platform as event campaign artwork:

* **Solstice Music Festival** - Digital Aetheria Dome
* **Gold Resonance Jazz Club** - Premium Glass Lounge
* **Symphony of Holograms** - Main Stage Arena
* **Neon Horizon Indie Showcase** - Hangar Stage

---

## 🚀 Getting Started

### 1. Prerequisites & Installation

Clone the repository and install the Node packages:
```bash
npm install
```

### 2. Configuration (Dual-Mode Setup)

Duplicate the `.env.local.example` file and configure it as `.env.local` to toggle live connections:
```bash
cp .env.local.example .env.local
```

Fill in the credentials to run in Live Cloud mode, or leave them blank to fallback to the Local Offline Sandbox:
```env
# Firebase Web Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Gateway API Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Running the App

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Architecture & Directory Mapping

* `app/` - Next.js App Router folders.
  * `app/page.js` - Search engine landing page with featured event slide decks.
  * `app/events/[id]/page.js` - Interactive seating reservation grids with countdown holds.
  * `app/dashboard/attendee/page.js` - Client ticket wallets and live concert chats.
  * `app/dashboard/organizer/` - Backstage Control Suite (Dashboard, CRM, Planner, Scanner, Promo Engine, Layout Designer).
  * `app/dashboard/settings/page.js` - Operations deck settings (Business details, Stripe billing, translations, theme variables).
  * `app/help/page.js` - Multi-language FAQ deck, operational manuals, and interactive AI helpdesk simulator.
  * `app/api/checkout/route.js` - Stripe checkout sessions Node API.
* `components/` - Global layout elements (e.g. Glassmorphic `Navbar` with role gates).
* `context/` - Global `AuthContext.js` managing authorization states.
* `lib/` - Service layers.
  * `database.js` - Unified database router (Firestore wrapper with mock database fallbacks).
  * `mockDatabase.js` - LocalStorage-based CRUD operations with local broadcast streams.
  * `firebase.js` - Firebase Web SDK client initialization.

---

## 🛠️ Key Product Features

### 1. Collaborative Seating Map & 10-Minute Lock Holds
* **Temporary Holds**: Selecting a seat locks it in the database for **10 minutes**. A visual timer alerts users. Expired holds are released automatically to prevent double bookings.
* **Group Split Checkout**: Initiating a split payment locks selected seats and generates an invitation URL. When friends open the link, invite-seats pulse purple and pre-select automatically.
* **Real-time Hovers**: Multiple tabs viewing the same map show other users' mouse hovers and selections in real-time with initials badges (e.g., `JS` for Julian Sterling).

### 2. Backstage Organizer Suite
* **Interactive Layout Canvas**: Design custom seating grids, toggle cells between VIP Booths, Standard tables, or Corridors (aisles/walkways), and save as templates.
* **Guest CRM Directory**: Manage VIP details and custom notes. Features a **Support Portal** to reassign seats on a mini grid or cancel bookings to issue refunds instantly.
* **Gate Check-In Scanner**: Decodes ticket QR codes via device webcams or manual reference checks. Displays check-in speedometer percentages and VIP arrival flashes.
* **Promo Code Manager**: Configure coupon discount rates and track attributed campaign sales revenue.
* **Kanban Planner**: Organize tasks by status (To Do, In Progress, Done) and category (Talent, F&B, Production) with interactive progress bars.

### 3. Unified Localization & Themes
* **Translation Engine**: Supports English, French, and Spanish localization across headers, nav buttons, and ticket formats.
* **Exchange Conversions**: Converts pricing dynamically based on currency choice (CAD, USD, EUR, GBP) using real-time rate multipliers.
* **Theme Styling**: Configured with three high-contrast premium theme schemes (Dark Obsidian, Frost White, and Gold Velvet) managed through CSS variables.

---

## ⚙️ Production Build Command

To compile and optimize the production package:
```bash
npm run build
```

This compiles static routing structures, checks TypeScript safety parameters, and builds optimized Turbopack client assets.
