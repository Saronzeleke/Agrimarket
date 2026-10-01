export const API_BASE_URL = "http://localhost:3001/api/v1";

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

export const COLORS = {
  PRIMARY: "#166534",
  SECONDARY: "#65A30D",
  ACCENT: "#F59E0B",
  BACKGROUND: "#F8FAF5",
  SURFACE: "#FFFFFF",
  BORDER: "#E5E7EB",
  TEXT_PRIMARY: "#1F2937",
  TEXT_SECONDARY: "#6B7280",
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
