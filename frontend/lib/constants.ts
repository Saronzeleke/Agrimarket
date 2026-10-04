export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

export const ROUTES = {
  HOME: "/",
  MARKETPLACE: "/marketplace",
  CART: "/cart",
  CHECKOUT: "/checkout",
  CHECKOUT_SUCCESS: "/checkout/success",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD_BUYER: "/dashboard/buyer",
  DASHBOARD_SELLER: "/dashboard/seller",
  SELLER_PRODUCTS: "/dashboard/seller/products",
  SELLER_ORDERS: "/dashboard/seller/orders",
  WISHLIST: "/wishlist",
  SEARCH: "/search",
  ORDERS: "/orders",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  MESSAGES: "/messages",
} as const;

// Use CSS variables instead of hardcoded colors for theme support
export const COLORS = {
  PRIMARY: "var(--primary)",
  PRIMARY_HOVER: "var(--primary-hover)",
  ACCENT: "var(--accent)",
  ACCENT_HOVER: "var(--accent-hover)",
  BACKGROUND: "var(--background)",
  SURFACE: "var(--surface)",
  BORDER: "var(--border)",
  TEXT_PRIMARY: "var(--text-primary)",
  TEXT_SECONDARY: "var(--text-secondary)",
} as const;

export const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Oromia",
  "Amhara",
  "Tigray",
  "SNNPR",
  "Sidama",
  "Somali",
  "Afar",
  "Benishangul-Gumuz",
  "Gambela",
  "Harari",
  "Dire Dawa",
  "Southwestern",
] as const;

export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export const USER_ROLE = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
} as const;
