/**
 * Jest Test Setup
 * 
 * Global test setup and teardown.
 */

import { PrismaClient } from '@prisma/client';

// Mock Prisma client for tests
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

// Setup before all tests
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Clean up test database
  await cleanDatabase();
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Clean database before each test
beforeEach(async () => {
  await cleanDatabase();
});

/**
 * Clean all tables in the test database
 */
async function cleanDatabase() {
  const tables = [
    'helpful_votes',
    'reviews',
    'notifications',
    'order_items',
    'orders',
    'addresses',
    'wishlist_items',
    'wishlists',
    'cart_items',
    'carts',
    'inventory_history',
    'inventory',
    'saved_searches',
    'search_logs',
    'products',
    'categories',
    'seller_profiles',
    'email_verifications',
    'password_resets',
    'users',
  ];

  // Disable foreign key checks
  await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

  // Truncate all tables
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch (error) {
      // Ignore errors for tables that don't exist
      console.warn(`Failed to truncate ${table}:`, error);
    }
  }

  // Re-enable foreign key checks
  await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');
}

// Export test utilities
export { prisma };
