# AgriMarket UI/UX Design Brief - Production-Ready

## 🎯 Project Overview

You are a **senior UI/UX designer and product design expert** specializing in production-ready agricultural e-commerce platforms.

**Project:** AgriMarket - A professional agricultural marketplace connecting Ethiopian farmers (sellers) with buyers across Ethiopia.

**Mission:** Design a complete, enterprise-grade UI/UX system that is simple enough for low-literacy farmers yet sophisticated enough for commercial buyers.

**Target Market:** Ethiopia - multilingual, varying digital literacy, mobile-first users, limited internet connectivity in rural areas.

---

## 📋 Design Philosophy

### Core Principles:
1. **Trust First** - Farmers and buyers need to trust the platform with their money and livelihoods
2. **Simplicity Over Features** - Every screen should be immediately understandable
3. **Mobile-First, Always** - 80% of Ethiopian users access internet via mobile
4. **Inclusive Design** - Accessible to users with low digital literacy and disabilities
5. **Culturally Appropriate** - Colors, imagery, and patterns that resonate with Ethiopian users
6. **Production-Grade** - Every component must be developer-ready with clear specifications

---

## 🎨 Design System Requirements

### 1. Color Palette

**Primary Colors:**
- **Primary Green:** #166534 (Forest Green - trust, growth, agriculture)
  - Use for: Primary buttons, headers, active states
  - Text on primary: #FFFFFF
  
- **Secondary Green:** #65A30D (Fresh Lime - vitality, freshness)
  - Use for: Secondary actions, success states, highlights
  - Text on secondary: #FFFFFF

- **Accent Amber:** #F59E0B (Harvest Gold - prosperity, warmth)
  - Use for: Call-to-action buttons, badges, alerts, pricing
  - Text on accent: #1F2937

**Neutral Colors:**
- **Background:** #F8FAF5 (Soft Off-White - clean, natural)
- **Surface:** #FFFFFF (Pure White - cards, modals)
- **Border:** #E5E7EB (Light Gray)
- **Text Primary:** #1F2937 (Near Black)
- **Text Secondary:** #6B7280 (Medium Gray)
- **Text Disabled:** #9CA3AF (Light Gray)

**Semantic Colors:**
- **Success:** #10B981 (Emerald)
- **Warning:** #F59E0B (Amber)
- **Error:** #EF4444 (Red)
- **Info:** #3B82F6 (Blue)

**Contrast Requirements:**
- All color combinations MUST meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- Test all color pairs using a contrast checker

### 2. Typography

**Font Family:**
- **Primary:** Inter (Google Fonts - modern, readable, supports Ethiopic script)
- **Fallback:** system-ui, -apple-system, sans-serif
- **Ethiopic Script:** Noto Sans Ethiopic (for Amhara language)

**Type Scale:**
```
H1: 2.5rem (40px) / Bold / Line-height 1.2
H2: 2rem (32px) / Bold / Line-height 1.3
H3: 1.5rem (24px) / SemiBold / Line-height 1.4
H4: 1.25rem (20px) / SemiBold / Line-height 1.5
Body Large: 1.125rem (18px) / Regular / Line-height 1.6
Body: 1rem (16px) / Regular / Line-height 1.6
Body Small: 0.875rem (14px) / Regular / Line-height 1.5
Caption: 0.75rem (12px) / Regular / Line-height 1.4
```

**Font Weights:**
- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700

### 3. Spacing System

Use 8px base unit (0.5rem):
```
xs: 4px (0.25rem)
sm: 8px (0.5rem)
md: 16px (1rem)
lg: 24px (1.5rem)
xl: 32px (2rem)
2xl: 48px (3rem)
3xl: 64px (4rem)
```

### 4. Component Specifications

#### Buttons:
```
Primary Button:
- Background: Primary Green (#166534)
- Text: White
- Height: 48px (mobile), 44px (desktop)
- Padding: 16px 24px
- Border-radius: 8px
- Font: Body / SemiBold
- Hover: Darken 10%
- Active: Darken 15%
- Disabled: Opacity 50%

Secondary Button:
- Background: Transparent
- Border: 2px solid Primary Green
- Text: Primary Green
- Same dimensions as primary

Text Button:
- Background: Transparent
- Text: Primary Green
- Padding: 8px 16px
- Underline on hover
```

#### Input Fields:
```
Height: 48px
Padding: 12px 16px
Border: 1px solid #E5E7EB
Border-radius: 8px
Font: Body / Regular
Focus: 2px border Primary Green
Error: 2px border Error Red
Label: Body Small / Medium / Text Secondary
Helper text: Caption / Text Secondary
```

#### Cards:
```
Background: White
Border: 1px solid #E5E7EB
Border-radius: 12px
Padding: 16px (mobile), 24px (desktop)
Shadow: 0 1px 3px rgba(0,0,0,0.1)
Hover: Shadow 0 4px 12px rgba(0,0,0,0.15)
```

### 5. Icons

**Icon Library:** Heroicons (consistent, professional, open-source)

**Icon Sizes:**
- Small: 16px
- Medium: 24px
- Large: 32px
- XLarge: 48px

**Always pair icons with text labels** for low-literacy users

### 6. Images

**Product Images:**
- Aspect ratio: 4:3 (standard product photography)
- Resolution: 800x600px minimum
- Format: WebP (with JPEG fallback)
- Alt text: Required for all images

**Hero Images:**
- Aspect ratio: 16:9
- Resolution: 1920x1080px
- Ethiopian agricultural scenes preferred

---

## 📱 Screen Requirements

Design ALL screens in these breakpoints:

1. **Mobile:** 375px width (iPhone SE - minimum)
2. **Tablet:** 768px width (iPad portrait)
3. **Desktop:** 1440px width (Standard laptop)

### Phase 1: Core Marketplace Screens

#### 1. Landing Page (Home)

**Sections (in order):**

**A. Hero Section**
- Full-width hero image (Ethiopian farmers/crops)
- Headline: "Connect with Ethiopian Farmers" (H1)
- Subheadline: "Fresh agricultural products delivered from farm to your door" (Body Large)
- Primary CTA: "Browse Products" (Primary Button)
- Secondary CTA: "Sell Your Products" (Secondary Button)
- Search bar with category dropdown and location filter

**B. Category Grid**
- 6 main categories with icons:
  - Grains & Cereals 🌾
  - Vegetables 🥬
  - Fruits 🍎
  - Coffee & Spices ☕
  - Pulses & Legumes 🫘
  - Livestock 🐄
- Each category card: Icon + Name + Product count
- Grid: 2 columns (mobile), 3 columns (tablet), 6 columns (desktop)

**C. Featured Products**
- Heading: "Fresh from the Farm" (H2)
- 8 product cards in horizontal scroll (mobile) / grid (desktop)
- Product card includes:
  - Product image (4:3 ratio)
  - Product name (H4)
  - Price in ETB (Body Large / Bold / Accent Amber)
  - Unit (Body Small / Text Secondary)
  - Location badge (icon + text)
  - Rating stars + review count
  - "Add to Cart" button (visible on hover for desktop)

**D. How It Works**
- Heading: "Simple, Safe, Direct" (H2)
- 3 steps with icons:
  1. Browse Products - Search thousands of agricultural products
  2. Place Order - Secure checkout with Chapa/Telebirr
  3. Receive Fresh - Track your order from farm to door
- Each step: Large icon + Title (H3) + Description (Body)

**E. Trust Indicators**
- Statistics row:
  - "10,000+ Products"
  - "500+ Verified Farmers"
  - "50,000+ Happy Buyers"
  - "All 14 Regions Covered"
- Icons + numbers in large bold font

**F. Call to Action (Seller)**
- Full-width section with background image
- Heading: "Sell Your Products on AgriMarket" (H2)
- Benefits list with checkmarks:
  - Reach buyers across Ethiopia
  - Get paid directly to your account
  - Free listing for verified farmers
  - Marketing and logistics support
- CTA: "Start Selling Today" (Primary Button)

**G. Footer**
- Logo + tagline
- Navigation links:
  - About Us
  - How It Works
  - For Farmers
  - For Buyers
  - Support
  - Terms & Privacy
- Social media icons
- Language selector (English / Amhara)
- Payment methods icons (Chapa, Telebirr, CBE Birr)
- Copyright notice

**States to Design:**
- Default
- Loading (skeleton screens)
- Empty (no products available)

---

#### 2. Marketplace Page (Product Listing)

**Layout:**

**A. Header**
- Logo (left)
- Search bar (center) with autocomplete
- Navigation: Categories, Orders, Messages
- User menu (right): Cart icon with badge, Profile avatar
- Sticky on scroll

**B. Breadcrumb Navigation**
- Home > Category Name
- Clickable hierarchy

**C. Page Title**
- Category name (H1)
- Product count (Body / Text Secondary)
- View toggle: Grid / List

**D. Filters Sidebar (Left - Desktop) / Drawer (Mobile)**

Collapsible sections:
1. **Price Range**
   - Min/Max inputs
   - ETB symbol
   - Apply button

2. **Location**
   - Checkboxes for regions:
     - Addis Ababa
     - Oromia
     - Amhara
     - Tigray
     - SNNPR
     - All regions (+ icon)

3. **Seller Rating**
   - Star rating filters (5★, 4★+, 3★+)

4. **Product Quality**
   - Badges: Premium, Grade A, Grade B, Grade C

5. **Availability**
   - In Stock
   - Pre-Order

**Clear All Filters** button at bottom

**E. Sort & Results Bar**
- Left: "Showing X of Y products"
- Right: Sort dropdown
  - Relevance (default)
  - Price: Low to High
  - Price: High to Low
  - Newest First
  - Most Popular
  - Highest Rated

**F. Product Grid**
- Grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Gap: 16px (mobile), 24px (desktop)

**Product Card Detailed Specs:**
```
Card dimensions: Full width x auto height
Padding: 0 (image edge-to-edge)
Border-radius: 12px
Shadow: Light elevation

Components:
1. Image container (4:3 ratio)
   - Product photo
   - "New" badge (top-left if < 7 days old)
   - "Low Stock" badge (top-right if < 10 units)
   - Heart icon (top-right) for wishlist

2. Content section (padding: 16px)
   - Product name (H4 / 2 lines max / ellipsis)
   - Seller name + verification badge
   - Location (icon + text / Body Small)
   - Rating stars (16px) + "(X reviews)"
   - Price (H3 / Bold / Accent Amber)
   - Unit (Body Small / Text Secondary) e.g., "per kg"
   - Stock indicator: "X units available"

3. Action section (padding: 0 16px 16px)
   - "Add to Cart" button (full-width)
   - Quick view icon button (mobile only)

Hover state (desktop):
   - Lift shadow
   - Show "Quick View" button
   - Slight scale (1.02)

Mobile tap:
   - Navigate to product details
```

**G. Pagination**
- Numbers: 1, 2, 3, ..., 10
- Previous / Next buttons
- "Load More" alternative for infinite scroll

**States:**
- Loading (skeleton cards - 6 visible)
- No results (illustration + "Try different filters" + CTA)
- Error (retry button)

---

#### 3. Product Details Page

**Layout:**

**A. Breadcrumb**
- Home > Category > Product Name

**B. Product Section (2-column on desktop)**

**Left Column: Images**
- Main image (large - 600x450px)
- Thumbnail gallery below (5 thumbnails, horizontal scroll)
- Zoom on hover (desktop)
- Pinch to zoom (mobile)
- Image counter: "1 / 5"
- Fullscreen gallery button

**Right Column: Product Info**

1. **Product Header**
   - Product name (H1)
   - SKU: #12345 (Body Small)
   - Share icons (WhatsApp, Facebook, Copy Link)

2. **Seller Card**
   - Seller avatar (48px circle)
   - Seller name + verified badge
   - Rating stars + "(X ratings)"
   - Location icon + region name
   - "View Seller Profile" link
   - "Contact Seller" button

3. **Pricing**
   - Price (H1 / Bold / Accent Amber): "450 ETB"
   - Unit (H4 / Text Secondary): "per kg"
   - Original price (if discounted - strikethrough)
   - Discount badge: "15% OFF"

4. **Availability**
   - Stock badge:
     - "In Stock" (Success Green)
     - "Low Stock: X units left" (Warning Amber)
     - "Out of Stock" (Error Red)
   - Estimated delivery: "3-5 business days"

5. **Product Details Grid**
   ```
   Label (Body Small / Text Secondary) | Value (Body / Bold)
   ------------------------------------------------
   Quality Grade:                      | Premium
   Harvest Date:                       | September 2026
   Production Location:                | Amhara, Gondar
   Unit:                               | Kilogram (kg)
   Minimum Order:                      | 1 kg
   ```

6. **Quantity Selector**
   - Label: "Quantity"
   - Minus button | Input field | Plus button
   - Height: 48px
   - Width: 120px total

7. **Action Buttons (Stacked on mobile)**
   - "Add to Cart" (Primary Button / Full-width)
   - "Buy Now" (Accent Button / Full-width)
   - "Add to Wishlist" (Text Button / Icon + Text)

8. **Trust Badges**
   - Icons with text:
     - Secure Payment
     - Quality Guaranteed
     - Fast Delivery
     - Easy Returns

**C. Product Tabs Section**

Tab Navigation:
- Description (default)
- Specifications
- Reviews (count)
- Seller Info

**Description Tab:**
- Product description (Body / Paragraph format)
- Rich text with bullet points
- Line-height: 1.6 for readability

**Specifications Tab:**
```
Table format (2 columns):
Property | Value
-------------------
Category | Grains & Cereals
Harvest Season | September - November
Shelf Life | 12 months
Packaging | 25kg bags
Organic Certified | Yes
```

**Reviews Tab:**

**Review Summary Card:**
- Overall rating (large number - H1)
- Stars visualization (32px icons)
- Total reviews count
- Rating distribution bars:
  ```
  5★ ████████████████░░░░ 80% (120)
  4★ ████████░░░░░░░░░░░░ 15% (23)
  3★ ██░░░░░░░░░░░░░░░░░░ 3% (5)
  2★ ░░░░░░░░░░░░░░░░░░░░ 1% (2)
  1★ █░░░░░░░░░░░░░░░░░░░ 1% (1)
  ```

**Review List:**

Each review card:
- Reviewer avatar (40px) + name
- Star rating (16px icons)
- "Verified Purchase" badge (if applicable)
- Review date (relative: "2 days ago")
- Review title (H4 / SemiBold)
- Review text (Body / 3 lines preview / "Read More" link)
- Helpful buttons: "👍 Helpful (5)" | "👎 Not Helpful (0)"
- Seller response (if exists - indented card)

**Write Review Button** (if user purchased product)

**Seller Info Tab:**
- Seller profile card (larger version)
- Business description
- Location with map preview
- Rating breakdown
- "View All Products from This Seller" CTA

**D. Related Products Section**
- Heading: "Similar Products" (H2)
- 4 product cards (horizontal scroll)
- Same card design as marketplace

**E. Recently Viewed**
- Heading: "Recently Viewed" (H3)
- 4 product cards

**States:**
- Loading
- Out of stock (grayed out, "Notify Me" button)
- Product unavailable (deleted)

---

#### 4. Shopping Cart Page

**A. Header**
- "Shopping Cart" (H1)
- Cart item count: "(3 items)"

**B. Cart Layout (2-column on desktop)**

**Left Column: Cart Items**

Each cart item card:
```
┌─────────────────────────────────────────┐
│ [Image]  Product Name                   │
│  80x80   Seller: Highland Farms         │
│          Location: Oromia                │
│                                          │
│          Price: 450 ETB / kg            │
│                                          │
│          [- Qty: 2 +]  Subtotal: 900 ETB│
│                                          │
│          [❤ Save for Later] [🗑 Remove] │
└─────────────────────────────────────────┘
```

Components:
- Product thumbnail (80x80px)
- Product name (H4) - clickable
- Seller name with verification
- Price per unit
- Quantity selector (inline)
- Subtotal (calculated)
- Action buttons: Save for Later, Remove

**Empty Cart State:**
- Illustration (empty cart icon)
- Message: "Your cart is empty" (H2)
- "Start Shopping" button

**Right Column: Order Summary (Sticky)**

**Order Summary Card:**
```
┌───────────────────────────────┐
│ Order Summary                 │
│                               │
│ Items (3)        900.00 ETB   │
│ Delivery Fee      50.00 ETB   │
│ ─────────────────────────────│
│ Subtotal         950.00 ETB   │
│                               │
│ Discount Code                 │
│ [Input field]  [Apply]        │
│                               │
│ ─────────────────────────────│
│ Total:          950.00 ETB    │
│ (Large, Bold, Accent)         │
│                               │
│ [Proceed to Checkout]         │
│ (Primary Button, Full-width)  │
│                               │
│ Continue Shopping →           │
└───────────────────────────────┘
```

**C. Saved for Later Section** (if items exist)
- Heading: "Saved for Later (X items)"
- Horizontal scroll of saved items
- "Move to Cart" button on each

**D. Recommended Products**
- "You May Also Like"
- 4 product cards

---

#### 5. Checkout Page

**Progress Indicator:**
```
(1) Delivery ──●── (2) Payment ──○── (3) Confirmation
```

**Step 1: Delivery Information**

**A. Delivery Address Section**

Saved addresses (if exists):
- Radio button cards for each address
- Card shows: Name, Phone, Full address
- "Edit" and "Delete" icons
- "+ Add New Address" button

New address form:
```
Full Name *          [Input field]
Phone Number *       [Input field with +251 prefix]

Region *             [Dropdown: Addis Ababa, Oromia, Amhara...]
Zone/Sub-city *      [Input field]
Woreda *             [Input field]
Kebele               [Input field]
Specific Location *  [Textarea - 3 rows]

[Save as default address] [Checkbox]

[Save & Continue] (Primary Button)
```

**Step 2: Payment Method**

**A. Payment Options** (Radio cards)

```
┌──────────────────────────────────┐
│ ○ Chapa                          │
│   Pay securely with Chapa        │
│   [Chapa logo]                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ ○ Telebirr                       │
│   Pay with Telebirr mobile money │
│   [Telebirr logo]                │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ ○ CBE Birr                       │
│   Commercial Bank of Ethiopia    │
│   [CBE logo]                     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ ○ Cash on Delivery               │
│   Pay when you receive the order │
│   Additional 50 ETB fee applies  │
└──────────────────────────────────┘
```

**B. Order Review Panel** (Right sidebar - sticky)
```
Your Order

Product 1               450 ETB
  x2 kg

Product 2               300 ETB
  x1 kg

─────────────────────────────
Subtotal              1,200 ETB
Delivery                50 ETB
─────────────────────────────
Total:                1,250 ETB

Delivery to:
Abebe Kebede
+251 911 234 567
Addis Ababa, Bole, Kebele 08
[Change]

[Place Order] (Primary Button)
[◀ Back to Cart] (Text link)
```

**Step 3: Order Confirmation**

```
┌─────────────────────────────────┐
│         ✓ Success!              │
│   (Large checkmark icon - 64px) │
│                                 │
│  Order Placed Successfully      │
│         (H1)                    │
│                                 │
│  Order Number: #AGM-2026-12345  │
│  (H3 / Monospace)               │
│                                 │
│  We've sent a confirmation      │
│  to your email and phone        │
└─────────────────────────────────┘

Order Details Card:
- Items purchased (list)
- Total amount paid
- Delivery address
- Estimated delivery date
- Payment method

[Track Your Order] (Primary Button)
[Continue Shopping] (Secondary Button)
[Download Receipt] (Text link)
```

---

### Phase 2: User Dashboards

#### 6. Buyer Dashboard

**Sidebar Navigation:**
```
AgriMarket [Logo]

Dashboard
My Orders
Wishlist
Saved Searches
Addresses
Payment Methods
Account Settings
Help & Support

[Logout]
```

**Main Content Area:**

**A. Welcome Section**
- "Welcome back, [Name]!" (H2)
- Quick stats cards (4 columns):
  ```
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ Active Orders│ │   Wishlist   │ │   Saved      │ │  Total Spent │
  │      3       │ │      12      │ │   Searches   │ │  15,000 ETB  │
  │              │ │              │ │      5       │ │ This Month   │
  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
  ```

**B. Recent Orders Section**
- Heading: "Recent Orders" with "View All" link
- Order cards (3 most recent):

Order card template:
```
┌────────────────────────────────────────────────────┐
│ Order #AGM-2026-12345          [Status Badge]     │
│ Placed on: Oct 1, 2026         Delivered         │
│                                                    │
│ [Product Image] Product Name x2   450 ETB         │
│ 60x60          Seller: Highland Farms             │
│                                                    │
│ Total: 950 ETB                                     │
│                                                    │
│ [Track Order] [Order Again] [Write Review]        │
└────────────────────────────────────────────────────┘
```

Status badges:
- Pending (Amber)
- Confirmed (Blue)
- Shipped (Purple)
- Delivered (Green)
- Cancelled (Red)

**C. Recommended for You**
- Based on browsing history
- 4 product cards

**D. Continue Shopping**
- Categories quick access
- Recently viewed products

---

#### 7. Seller Dashboard

**Sidebar Navigation:**
```
AgriMarket Seller [Logo]

Dashboard
My Products
  - Active (count)
  - Draft (count)
  - Out of Stock (count)
Orders
  - New Orders (count)
  - In Progress (count)
  - Completed
Analytics
Inventory
Messages
Profile & Settings
Help Center

[Switch to Buying]
[Logout]
```

**Main Content:**

**A. Performance Overview**
- Date range selector (Today, Week, Month, Year, Custom)
- Metric cards (4 columns):
  ```
  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
  │  Revenue    │ │   Orders    │ │   Products  │ │   Rating    │
  │ 45,000 ETB  │ │     127     │ │     23      │ │   4.8 ★    │
  │ +15% ↑      │ │  +8% ↑      │ │  Active     │ │ (156 reviews│
  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
  ```

**B. Quick Actions**
- Large action cards:
  ```
  [+ Add New Product]  [📦 View Orders]  [💬 Messages (3)]  [📊 Analytics]
  ```

**C. Recent Orders**
- Table view with columns:
  - Order # (clickable)
  - Customer name
  - Product
  - Quantity
  - Amount
  - Status
  - Date
  - Actions (View, Process, Cancel)

**D. Top Selling Products**
- List with product image, name, units sold, revenue
- Progress bars showing sales volume

**E. Low Stock Alerts**
- Warning cards for products below threshold
- "Restock Now" CTA

**F. Sales Chart**
- Line graph showing revenue over time
- Toggle: Daily, Weekly, Monthly

---

#### 8. Product Management (Seller)

**A. Products List**

**Filter Tabs:**
- All Products (count)
- Active (count)
- Draft (count)
- Out of Stock (count)

**Action Bar:**
- Search products input
- Filter dropdown (Category, Stock status)
- Sort dropdown
- [+ Add Product] button (Primary)

**Product Table:**
```
┌──────┬─────────────────────┬──────────┬───────┬────────┬─────────┬─────────┐
│Image │ Name                │ Category │ Price │ Stock  │ Status  │ Actions │
├──────┼─────────────────────┼──────────┼───────┼────────┼─────────┼─────────┤
│[IMG] │ Premium Teff Grain  │ Grains   │450ETB │ 150 kg │ Active  │ •••     │
│      │ SKU: TF-2026-001    │          │       │        │         │         │
└──────┴─────────────────────┴──────────┴───────┴────────┴─────────┴─────────┘
```

Actions menu (3 dots):
- Edit
- Duplicate
- Mark as Sold Out
- Delete

**B. Add/Edit Product Form**

**Product Information Section:**
```
Product Name *
[Input field - max 100 characters]

Category *
[Dropdown: Select category]

Description *
[Rich text editor - min 100 characters]
- Bold, Italic, Bullet points, Numbered lists

Product Images * (Max 5)
[Drag & drop area]
[+ Upload Images]
- First image is cover photo
- Drag to reorder
- Delete option on each
```

**Pricing & Inventory:**
```
Price *              Unit *
[Input ETB]          [Dropdown: kg, quintal, liter, piece]

Stock Quantity *     Low Stock Alert
[Number input]       [Number input - default 10]

Quality Grade        Minimum Order Quantity
[Dropdown: A,B,C,    [Number input - default 1]
 Premium]
```

**Product Details:**
```
Production Location *    Harvest Date
[Input field]            [Date picker]

Product Weight/Size      Shelf Life
[Input + unit]           [Input + dropdown: days/months/years]

Organic Certified        Fair Trade Certified
[Yes/No toggle]          [Yes/No toggle]
```

**Delivery Options:**
```
Available for Delivery     Delivery Regions
[Checkbox]                 [Multi-select checkboxes]
                          ☑ Addis Ababa
Pickup Available           ☑ Oromia
[Checkbox]                 ☐ Amhara
                          ...
```

**SEO & Visibility:**
```
Product Tags
[Tag input - comma separated]
Example: organic, teff, gluten-free

Search Keywords
[Input field]
```

**Action Buttons:**
```
[Save as Draft] (Secondary)  [Publish Product] (Primary)
[Cancel] (Text link)
```

---

#### 9. Order Management (Seller)

**Order Detail Modal/Page:**

**A. Order Header**
```
Order #AGM-2026-12345           [Status Badge: New Order]

Placed: Oct 1, 2026, 10:30 AM   Customer: Abebe Kebede
Payment: Paid (Chapa)            Phone: +251 911 234 567
Total: 950 ETB                   Location: Addis Ababa, Bole
```

**B. Customer Information Card**
```
Delivery Address:
Abebe Kebede
+251 911 234 567
Addis Ababa, Bole Sub-city
Woreda 08, Kebele 12
Near Edna Mall

[📞 Call Customer]  [💬 Send Message]  [📍 View on Map]
```

**C. Order Items**
```
Product                  Qty   Price      Subtotal
─────────────────────────────────────────────────
Premium Teff Grain       2kg   450 ETB    900 ETB
[Product image]

─────────────────────────────────────────────────
Items Total:                             900 ETB
Delivery Fee:                             50 ETB
─────────────────────────────────────────────────
Total:                                   950 ETB
```

**D. Order Timeline**
```
● Order Placed           Oct 1, 2026  10:30 AM
  Customer placed order and paid

○ Order Confirmed        Pending
  Confirm order and prepare items

○ Ready for Pickup       Pending
  Package ready for delivery

○ Shipped                Pending
  Out for delivery

○ Delivered              Pending
  Order delivered to customer
```

**E. Actions Section**
```
[✓ Confirm Order]      (Primary - if New)
[📦 Mark as Shipped]   (Primary - if Confirmed)
[✓ Mark as Delivered]  (Primary - if Shipped)
[✕ Cancel Order]       (Error - outline)
[🖨 Print Invoice]     (Secondary)
```

**Cancel Order Modal:**
```
Cancel Order #AGM-2026-12345?

Reason for cancellation: *
[Dropdown]
- Out of Stock
- Unable to Deliver
- Customer Request
- Other

Additional notes:
[Textarea]

Refund customer?
● Full Refund (950 ETB)
○ Partial Refund [Input]
○ No Refund

[Cancel Order] (Error Button)  [Back] (Secondary)
```

---

### Phase 3: Authentication & Account

#### 10. Login Page

**Layout: Centered card on branded background**

**Background:**
- Soft agricultural pattern or image
- Semi-transparent overlay

**Login Card:**
```
┌────────────────────────────────────┐
│         [AgriMarket Logo]          │
│                                    │
│      Welcome Back                  │
│      (H2)                          │
│                                    │
│  Email or Phone Number             │
│  [Input field]                     │
│                                    │
│  Password                          │
│  [Input field with show/hide icon]│
│                                    │
│  [Remember me ☐]  [Forgot?]→      │
│                                    │
│  [Login] (Primary Button - full)  │
│                                    │
│  ─────────── or ───────────        │
│                                    │
│  [Continue with Phone]             │
│  (Secondary Button)                │
│                                    │
│  Don't have an account?            │
│  [Sign Up] (Text link)             │
└────────────────────────────────────┘

Language: [English ▼]

[Privacy Policy] • [Terms of Service]
```

**Phone Login Modal:**
```
Login with Phone Number

Enter your phone number
[+251] [Phone input]

We'll send you a verification code

[Send Code] (Primary)
[Back to Email Login] (Text link)

─────────────────

Enter Verification Code
We sent a 6-digit code to +251 911 234 567

[□][□][□][□][□][□]
(Large input boxes)

Didn't receive code? [Resend] (Text link)
Code expires in 02:00

[Verify & Login] (Primary)
```

---

#### 11. Registration Page

**Multi-step form with progress indicator:**

```
Account Type → Personal Info → Verification → Complete
    (1)             (2)            (3)          (4)
```

**Step 1: Choose Account Type**

```
┌────────────────────────────────────┐
│         [AgriMarket Logo]          │
│                                    │
│    Create Your Account             │
│    (H1)                            │
│                                    │
│    I want to:                      │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  🛒  Buy Products             │ │
│  │                               │ │
│  │  Browse and purchase          │ │
│  │  agricultural products        │ │
│  │                               │ │
│  │       [Sign up as Buyer] →   │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  🌾  Sell Products            │ │
│  │                               │ │
│  │  List and sell your           │ │
│  │  agricultural products        │ │
│  │                               │ │
│  │      [Sign up as Seller] →   │ │
│  └──────────────────────────────┘ │
│                                    │
│  Already have an account?          │
│  [Login] (Text link)               │
└────────────────────────────────────┘
```

**Step 2: Personal Information (Buyer)**

```
Create Buyer Account

First Name *          Last Name *
[Input]              [Input]

Email Address *
[Input with @ icon]

Phone Number *
[+251] [Input]

Password *
[Input with show/hide]
[Password strength indicator]

Confirm Password *
[Input with show/hide]

[☐] I agree to the Terms of Service
    and Privacy Policy

[Create Account] (Primary)
[◀ Back] (Text link)
```

**Password Requirements Tooltip:**
```
Password must contain:
✓ At least 8 characters
✓ One uppercase letter
✓ One lowercase letter
✓ One number
✓ One special character
```

**Step 2: Business Information (Seller)**

```
Create Seller Account

Personal Information:
First Name *          Last Name *
[Input]              [Input]

Email Address *
[Input]

Phone Number *
[+251] [Input]

Business Information:
Business Name *
[Input]

Business Type *
[Dropdown: Individual Farmer, Cooperative,
           Trading Company, Processor]

Primary Products *
[Multi-select: Grains, Vegetables, Fruits...]

Location *
Region:              Zone/Woreda:
[Dropdown]           [Input]

Business Registration Number (Optional)
[Input]

Tax ID Number (Optional)
[Input]

Password *
[Input with strength indicator]

Confirm Password *
[Input]

[☐] I agree to Seller Terms and Conditions

[Create Account] (Primary)
[◀ Back] (Text link)
```

**Step 3: Verification**

**Email Verification:**
```
Verify Your Email

We've sent a verification code to:
sharonkuye369@gmail.com

Enter the 6-digit code:
[□][□][□][□][□][□]

Didn't receive it?
[Resend Code] (Wait 60s)

[Verify] (Primary)
[Change Email] (Text link)
```

**Phone Verification:**
```
Verify Your Phone

Enter the code sent to:
+251 911 234 567

[□][□][□][□][□][□]

[Verify] (Primary)
[Resend Code]
```

**Step 4: Success**

```
┌────────────────────────────────────┐
│         ✓ Success!                 │
│     (64px checkmark icon)          │
│                                    │
│   Account Created                  │
│   Successfully!                    │
│   (H1)                             │
│                                    │
│   Welcome to AgriMarket, [Name]!   │
│                                    │
│   Your account is ready.           │
│                                    │
│   [Start Shopping] (Buyer)         │
│   or                               │
│   [Complete Your Profile] (Seller) │
│                                    │
│   [Go to Dashboard]                │
└────────────────────────────────────┘
```

---

### Phase 4: Additional Screens

#### 12. Search Results Page

Same layout as Marketplace Page with:
- Search query displayed: "Showing results for 'coffee beans'"
- Search suggestions if no results: "Did you mean: 'coffee'"
- Recent searches (below search bar)
- Trending searches

#### 13. Wishlist Page

```
My Wishlist (12 items)

[Share Wishlist] [Clear All]

Product grid (same as marketplace)
Each card has:
- ❤ Remove from Wishlist
- 🛒 Add to Cart
- "Out of Stock" badge if unavailable
```

#### 14. Order Tracking Page

```
Track Order #AGM-2026-12345

┌────────────────────────────────────┐
│   📦 Package Status: In Transit    │
│   Estimated Delivery: Oct 5, 2026  │
└────────────────────────────────────┘

Timeline:
● Order Placed          Oct 1, 10:30 AM ✓
  Your order was confirmed

● Order Confirmed       Oct 1, 2:15 PM ✓
  Seller confirmed your order

● Packed & Ready        Oct 2, 9:00 AM ✓
  Your order is packed

● Shipped               Oct 2, 3:30 PM ✓
  Out for delivery
  Tracking: ETD-123456789
  Courier: Ethiopian Express

● In Transit            Oct 3, 11:00 AM ✓
  Package is on the way
  Current location: Addis Ababa Hub

○ Out for Delivery      Expected today
  Delivery agent will contact you

○ Delivered             Expected Oct 5
  You'll receive your order

[Contact Seller] [Need Help?] [Cancel Order]

Map showing package location (if available)
```

#### 15. Notifications Page

```
Notifications                    [Mark All as Read]

Filter: [All] [Orders] [Products] [Messages]

Today
─────
● Your order #AGM-12345 has been shipped
  2 hours ago
  [View Order]

● New message from Highland Farms
  3 hours ago
  [View Message]

Yesterday
─────────
○ Your review was posted
  1 day ago
  [View Product]

○ Price drop on Premium Coffee Beans
  1 day ago
  [View Product]

[Load More]

Empty state: "No notifications yet"
```

#### 16. Messages/Chat Page

**Layout: Split view (mobile: full-screen)**

**Left Panel: Conversations List**
```
Messages           [+ New Message]

[Search conversations]

Active (2)
─────────
[Avatar] Highland Farms
         About Premium Teff order...
         2m ago • ●

[Avatar] Bole Farm Co.
         Thank you for your order!
         1h ago

All Messages (5)
───────────────
[List of other conversations]
```

**Right Panel: Chat**
```
Highland Farms                [ℹ Info]
● Online

[Messages area - scrollable]

Them: Hello! I have your Teff order ready
      10:30 AM

You:  Great! When can I pick it up?
      10:32 AM

Them: Anytime today after 2 PM
      10:33 AM

[Attachment][😊] [Type message...] [Send]

Product card (if discussing product):
┌──────────────────────────────┐
│ [Image] Premium Teff Grain   │
│ 450 ETB / kg                 │
│ [View Product]               │
└──────────────────────────────┘
```

#### 17. Settings Page

**Tabs:**
- Profile
- Security
- Notifications
- Payment Methods
- Addresses
- Privacy

**Profile Tab:**
```
Profile Picture
[Avatar upload - 128px]
[Change Photo] [Remove]

Personal Information
First Name       Last Name
[Input]         [Input]

Email                    Phone
[Input - verified ✓]    [Input - verified ✓]

Bio (for sellers)
[Textarea - max 500 chars]

[Save Changes] (Primary)
```

**Security Tab:**
```
Change Password

Current Password *
[Input]

New Password *
[Input with strength meter]

Confirm New Password *
[Input]

[Update Password] (Primary)

─────────────────────────

Two-Factor Authentication
Enable 2FA for extra security

[○ Disabled]  [Enable 2FA →]

─────────────────────────

Active Sessions
You're logged in on 2 devices:

● Chrome on Windows
  Addis Ababa • Active now
  [Revoke]

○ Safari on iPhone
  Last active: 2 hours ago
  [Revoke]

[Sign Out All Devices] (Error)
```

---

## 🎯 UI States & Patterns

### Loading States

**Skeleton Screens (preferred over spinners):**

Product card skeleton:
```
┌────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │ (Image placeholder)
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│                    │
│ ▓▓▓▓▓▓▓ ▓▓▓       │ (Title)
│ ▓▓▓▓              │ (Subtitle)
│ ▓▓▓▓▓▓            │ (Price)
└────────────────────┘
```

**Shimmer Animation:** Subtle left-to-right gradient sweep

**Full-page loader:**
```
[AgriMarket animated logo]
Loading... (Text below)
```

### Empty States

**Illustrations + Clear CTAs:**

Empty cart:
```
[Illustration: Empty cart icon]

Your cart is empty
(H3)

Add products to get started
(Body)

[Browse Products] (Primary)
```

Empty search:
```
[Illustration: Magnifying glass with X]

No products found for "xyz"
(H3)

Try different keywords or filters
(Body)

[Clear Filters] (Secondary)
```

### Error States

```
[⚠ Icon - Amber]

Something went wrong
(H3)

We couldn't load your products.
Please try again.
(Body)

[Retry] (Primary)  [Go Back] (Secondary)
```

**Field-level errors:**
```
Email Address *
[Input with red border]
⚠ Please enter a valid email address
(Error red text)
```

### Success States

**Toast Notifications:**
```
┌───────────────────────────────────┐
│ ✓ Product added to cart           │
│   [View Cart] [Dismiss]           │
└───────────────────────────────────┘

Position: Top-center (mobile) / Top-right (desktop)
Duration: 4 seconds
Dismissible: Yes
```

**Inline Success:**
```
✓ Your address has been saved
(Success green with checkmark)
```

---

## ♿ Accessibility Requirements

### WCAG 2.1 AA Compliance

**1. Color Contrast:**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum
- Test all color combinations

**2. Keyboard Navigation:**
- All interactive elements accessible via Tab
- Focus indicators: 2px solid Primary Green outline
- Skip navigation link (visible on focus)
- Logical tab order (left-to-right, top-to-bottom)
- Escape key closes modals

**3. Screen Reader Support:**
- Semantic HTML (header, nav, main, article, aside, footer)
- ARIA labels for icons and buttons without text
- ARIA live regions for dynamic content
- Alt text for all images (descriptive, not "image of")
- Form labels explicitly associated with inputs
- Error announcements

**4. Touch Targets:**
- Minimum 44x44px (mobile)
- Minimum 40x40px (desktop)
- 8px spacing between targets

**5. Focus Management:**
- Trap focus in modals
- Return focus after modal closes
- Visible focus indicators
- No keyboard traps

**6. Text:**
- Resizable up to 200% without loss of functionality
- Line height: 1.5x font size (paragraphs)
- Paragraph spacing: 2x font size
- No text in images (except logos)

**7. Forms:**
- Clear labels and instructions
- Error identification and suggestions
- Required field indicators (*)
- Input purpose attributes (autocomplete)

---

## 🌍 Localization & Internationalization

### Language Support

**Phase 1: English (default)**
**Phase 2: Amharic (አማርኛ)**

**Implementation:**
- All text as translation keys (not hardcoded)
- RTL support for future Arabic
- Date/time formats: Ethiopian Calendar option
- Number formats: Comma separators (1,000)
- Currency: ETB symbol + amount (450 ETB)

**Language Switcher:**
- In header (desktop) and settings (mobile)
- Flag icons + language names
- Persists across sessions

**Amharic Considerations:**
- Ethiopic script font: Noto Sans Ethiopic
- Larger font sizes (1.1x multiplier)
- Line height: 1.8 (Ethiopic needs more vertical space)
- Text direction: LTR (but plan for RTL)

---

## 📐 Responsive Breakpoints

```css
/* Mobile First */
xs: 0-374px      (Small phones)
sm: 375px-767px  (Phones)
md: 768px-1023px (Tablets)
lg: 1024px-1439px (Small laptops)
xl: 1440px+      (Desktop)
```

### Layout Changes:

**Navigation:**
- Mobile: Hamburger menu (bottom nav for main actions)
- Desktop: Full horizontal nav

**Product Grid:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

**Forms:**
- Mobile: Stacked fields (full-width)
- Desktop: 2-column where logical

**Dashboards:**
- Mobile: Stacked sections, tabs for navigation
- Desktop: Sidebar + main content

---

## 📦 Component Library

### Reusable Components to Design

1. **Buttons** (Primary, Secondary, Text, Icon, Loading)
2. **Inputs** (Text, Number, Email, Phone, Password, Textarea, Dropdown, Multiselect, Date Picker, File Upload)
3. **Cards** (Product, Order, Seller, Summary, Info)
4. **Badges** (Status, Count, New, Sale)
5. **Alerts** (Success, Error, Warning, Info)
6. **Modals** (Dialog, Drawer, Bottom Sheet)
7. **Navigation** (Header, Sidebar, Breadcrumb, Tabs, Pagination)
8. **Forms** (Layouts, Validation, Multi-step)
9. **Tables** (Data table, Responsive table)
10. **Empty States** (No data, No results, No connection)
11. **Loading States** (Spinner, Skeleton, Progress bar)
12. **Avatars** (User, Seller, Product)
13. **Rating** (Stars display, Stars input)
14. **Search** (Search bar, Autocomplete, Filters)
15. **Toast Notifications**
16. **Tooltips**
17. **Progress Indicators** (Stepper, Timeline)
18. **Media** (Image gallery, Image carousel)

---

## 🎨 Design Deliverables

### What to Provide

1. **Design System Document**
   - Colors (with hex codes and usage)
   - Typography (scale, weights, usage)
   - Spacing system
   - Border radius values
   - Shadow styles
   - Icon library reference
   - Grid system

2. **Component Library**
   - All states for each component
   - Variants (sizes, colors)
   - Usage guidelines
   - Code specs (padding, margins, sizes)

3. **High-Fidelity Mockups**
   - All screens listed above
   - All 3 breakpoints (mobile, tablet, desktop)
   - All key states (default, hover, active, disabled, error, loading)
   - Real content (not lorem ipsum)
   - Consistent styling

4. **User Flows**
   - Visual diagrams showing navigation paths
   - Key flows:
     - User registration → Browse → Add to cart → Checkout → Payment
     - Seller: Add product → Receive order → Process → Ship
     - Search → Filter → Product details → Purchase

5. **Prototypes** (optional but recommended)
   - Interactive clickable mockups
   - Show navigation between screens
   - Demonstrate key interactions (dropdowns, modals, etc.)

6. **Design Specifications**
   - Spacing measurements
   - Font sizes and weights
   - Color codes
   - Asset requirements (icons, images)
   - Animation descriptions (if any)

7. **Assets Export**
   - Icons (SVG format)
   - Images (WebP + JPEG fallback)
   - Logos (multiple sizes)
   - Naming convention: component-variant-state.svg

---

## ✅ Design Checklist

Before finalizing, verify:

### Visual Design
- [ ] Colors meet WCAG AA contrast requirements
- [ ] Typography scale is consistent
- [ ] Spacing follows 8px grid system
- [ ] All components have hover and active states
- [ ] All components have disabled states where applicable
- [ ] Focus indicators visible on all interactive elements
- [ ] Icons paired with text labels
- [ ] Real content used (no placeholder text)
- [ ] High-quality agricultural imagery

### UX & Functionality
- [ ] All user flows are clear and intuitive
- [ ] Error states with helpful messages
- [ ] Success confirmations for actions
- [ ] Loading states for async operations
- [ ] Empty states with clear CTAs
- [ ] Form validation with inline feedback
- [ ] Clear hierarchy and visual weight
- [ ] Consistent navigation across screens
- [ ] Mobile navigation optimized for thumb reach
- [ ] Touch targets minimum 44x44px

### Responsiveness
- [ ] All screens designed for mobile (375px)
- [ ] All screens designed for tablet (768px)
- [ ] All screens designed for desktop (1440px)
- [ ] Content readable at all sizes
- [ ] Images scale appropriately
- [ ] No horizontal scrolling
- [ ] Navigation adapts to screen size

### Accessibility
- [ ] Semantic HTML structure considered
- [ ] ARIA labels documented for icon buttons
- [ ] Keyboard navigation flow logical
- [ ] Focus trap in modals planned
- [ ] Alt text guidelines provided
- [ ] Error announcements planned
- [ ] No information conveyed by color alone

### Content
- [ ] All button labels are action-oriented
- [ ] All error messages are helpful and specific
- [ ] All success messages confirm the action
- [ ] Empty states explain why and what to do
- [ ] Placeholder text is instructive
- [ ] Microcopy is friendly and clear
- [ ] Legal pages linked (Terms, Privacy)

### Localization
- [ ] Text expansion room (30% for translations)
- [ ] Date formats accommodate Ethiopian calendar
- [ ] Currency symbol and amount ordering correct
- [ ] Language switcher accessible
- [ ] Ethiopic script tested with Noto Sans Ethiopic

### Performance Considerations
- [ ] Image sizes optimized (under 200KB each)
- [ ] Icon system chosen (SVG sprite recommended)
- [ ] Font files: Variable font or 2-3 weights max
- [ ] Animations subtle and purposeful
- [ ] No auto-playing videos or carousels

---

## 🚀 Implementation Handoff

### For Frontend Developers

**Provide:**

1. **Design Files** (Figma, Sketch, Adobe XD)
   - Organized layers and frames
   - Named consistently
   - Components properly set up
   - Styles defined (colors, typography)

2. **Style Guide / Design Tokens**
   ```json
   {
     "colors": {
       "primary": "#166534",
       "secondary": "#65A30D",
       "accent": "#F59E0B"
     },
     "typography": {
       "h1": {
         "fontSize": "2.5rem",
         "fontWeight": 700,
         "lineHeight": 1.2
       }
     },
     "spacing": {
       "xs": "0.25rem",
       "sm": "0.5rem"
     }
   }
   ```

3. **Component Specifications**
   - Each component with measurements
   - States documented
   - Variants explained

4. **Assets Folder**
   - All icons in SVG
   - All images optimized
   - Organized by type

5. **Prototype Links**
   - Clickable prototypes for flows
   - Interaction notes

6. **Developer Notes**
   - Accessibility requirements
   - Animation specs
   - Responsive behavior notes
   - Z-index hierarchy
   - State management notes

---

## 📋 Summary

**You will design:**
- ✅ 17+ complete screens across 4 phases
- ✅ Comprehensive design system
- ✅ Reusable component library
- ✅ All states (default, hover, loading, error, success, empty)
- ✅ 3 responsive breakpoints (mobile, tablet, desktop)
- ✅ Accessible, production-ready UI/UX

**Focus on:**
- 🎨 Visual consistency
- 🧠 User-friendly for Ethiopian farmers
- ♿ Accessibility (WCAG 2.1 AA)
- 📱 Mobile-first design
- 🌍 Localization readiness
- 🚀 Production quality

**Start with Phase 1** (Landing, Marketplace, Product Details, Cart, Checkout) and establish the design system. Once approved, continue to Phases 2-4.

---

## 🎯 Next Steps

1. Present initial design direction:
   - Mood board with reference designs
   - Color palette application
   - Typography samples
   - 2-3 screen concepts

2. Iterate based on feedback

3. Complete Phase 1 screens

4. Review and approve component library

5. Complete Phases 2-4

6. Finalize handoff documentation

7. Support frontend implementation with clarifications

---

**Ready to start? Begin with the landing page hero section, establish the visual language, and we'll iterate from there.**
