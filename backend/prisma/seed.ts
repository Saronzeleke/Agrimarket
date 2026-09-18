/**
 * AgriMarket Database Seed Script
 * 
 * This script populates the database with realistic development data
 * including users, products, orders, and other entities.
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient, Role, OrderStatus, PaymentStatus, NotificationType } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const SALT_ROUNDS = 12

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Helper function to generate slugs
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  console.log('🌱 Starting database seed...\n')

  // ============================================
  // CLEAN EXISTING DATA (Development only)
  // ============================================
  console.log('🧹 Cleaning existing data...')
  
  await prisma.inventoryHistory.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.address.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.emailVerification.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.sellerProfile.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Existing data cleaned\n')

  // ============================================
  // CREATE USERS
  // ============================================
  console.log('👥 Creating users...')

  // Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@agrimarket.com',
      password: await hashPassword('Admin123!'),
      firstName: 'Admin',
      lastName: 'User',
      phone: '+251911000000',
      role: Role.ADMIN,
      emailVerified: true,
      active: true,
    },
  })
  console.log(`  ✓ Admin: ${admin.email}`)

  // Customer Users
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'customer1@example.com',
        password: await hashPassword('Customer123!'),
        firstName: 'Abebe',
        lastName: 'Kebede',
        phone: '+251911111111',
        role: Role.CUSTOMER,
        emailVerified: true,
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'customer2@example.com',
        password: await hashPassword('Customer123!'),
        firstName: 'Almaz',
        lastName: 'Tesfaye',
        phone: '+251911222222',
        role: Role.CUSTOMER,
        emailVerified: true,
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'customer3@example.com',
        password: await hashPassword('Customer123!'),
        firstName: 'Dawit',
        lastName: 'Solomon',
        phone: '+251911333333',
        role: Role.CUSTOMER,
        emailVerified: true,
        active: true,
      },
    }),
  ])
  console.log(`  ✓ Created ${customers.length} customers`)

  // Seller Users
  const sellers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'seller1@example.com',
        password: await hashPassword('Seller123!'),
        firstName: 'Mulugeta',
        lastName: 'Haile',
        phone: '+251922111111',
        role: Role.SELLER,
        emailVerified: true,
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'seller2@example.com',
        password: await hashPassword('Seller123!'),
        firstName: 'Tigist',
        lastName: 'Bekele',
        phone: '+251922222222',
        role: Role.SELLER,
        emailVerified: true,
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'seller3@example.com',
        password: await hashPassword('Seller123!'),
        firstName: 'Yohannes',
        lastName: 'Gebre',
        phone: '+251922333333',
        role: Role.SELLER,
        emailVerified: true,
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'seller4@example.com',
        password: await hashPassword('Seller123!'),
        firstName: 'Meseret',
        lastName: 'Alemu',
        phone: '+251922444444',
        role: Role.SELLER,
        emailVerified: true,
        active: true,
      },
    }),
  ])
  console.log(`  ✓ Created ${sellers.length} sellers\n`)

  // ============================================
  // CREATE SELLER PROFILES
  // ============================================
  console.log('🏪 Creating seller profiles...')

  const sellerProfiles = await Promise.all([
    prisma.sellerProfile.create({
      data: {
        userId: sellers[0].id,
        businessName: 'Oromia Coffee Growers',
        description: 'Premium Ethiopian coffee directly from Oromia region farms. We specialize in high-quality Arabica beans with authentic taste.',
        phone: '+251922111111',
        location: 'Oromia',
        verified: true,
        rating: 4.8,
        reviewCount: 127,
      },
    }),
    prisma.sellerProfile.create({
      data: {
        userId: sellers[1].id,
        businessName: 'Shewa Honey Producers',
        description: 'Pure natural honey from the highlands of Shewa. We offer white, yellow, and red honey varieties.',
        phone: '+251922222222',
        location: 'Amhara',
        verified: true,
        rating: 4.6,
        reviewCount: 89,
      },
    }),
    prisma.sellerProfile.create({
      data: {
        userId: sellers[2].id,
        businessName: 'Tigray Grain Cooperative',
        description: 'Quality grains including teff, wheat, and barley from Tigray farmers. Supporting local agriculture.',
        phone: '+251922333333',
        location: 'Tigray',
        verified: true,
        rating: 4.5,
        reviewCount: 64,
      },
    }),
    prisma.sellerProfile.create({
      data: {
        userId: sellers[3].id,
        businessName: 'Addis Spice Market',
        description: 'Traditional Ethiopian spices and seasonings. Berbere, mitmita, and more authentic flavors.',
        phone: '+251922444444',
        location: 'Addis Ababa',
        verified: true,
        rating: 4.7,
        reviewCount: 103,
      },
    }),
  ])
  console.log(`  ✓ Created ${sellerProfiles.length} seller profiles\n`)

  // ============================================
  // CREATE CATEGORIES
  // ============================================
  console.log('📂 Creating categories...')

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Coffee',
        slug: 'coffee',
        description: 'Ethiopian coffee beans including Arabica and Robusta varieties',
        icon: '☕',
        active: true,
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Grains',
        slug: 'grains',
        description: 'Teff, wheat, barley, maize, sorghum and other grains',
        icon: '🌾',
        active: true,
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pulses',
        slug: 'pulses',
        description: 'Lentils, chickpeas, fava beans, peas and other legumes',
        icon: '🫘',
        active: true,
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Spices',
        slug: 'spices',
        description: 'Berbere, mitmita, cardamom, turmeric, ginger and traditional spices',
        icon: '🌶️',
        active: true,
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Honey',
        slug: 'honey',
        description: 'White, yellow, and red honey varieties from Ethiopian highlands',
        icon: '🍯',
        active: true,
        order: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Fruits',
        slug: 'fruits',
        description: 'Avocado, mango, banana, papaya, orange and seasonal fruits',
        icon: '🥭',
        active: true,
        order: 6,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Vegetables',
        slug: 'vegetables',
        description: 'Tomatoes, onions, peppers, cabbage, carrots and fresh vegetables',
        icon: '🥬',
        active: true,
        order: 7,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Oilseeds',
        slug: 'oilseeds',
        description: 'Sesame, niger seed, sunflower and other oilseeds',
        icon: '🌻',
        active: true,
        order: 8,
      },
    }),
  ])
  console.log(`  ✓ Created ${categories.length} categories\n`)

  // ============================================
  // CREATE PRODUCTS
  // ============================================
  console.log('📦 Creating products...')

  // Helper to find category by slug
  const coffeeCategory = categories.find(c => c.slug === 'coffee')!
  const grainsCategory = categories.find(c => c.slug === 'grains')!
  const pulsesCategory = categories.find(c => c.slug === 'pulses')!
  const spicesCategory = categories.find(c => c.slug === 'spices')!
  const honeyCategory = categories.find(c => c.slug === 'honey')!
  const fruitsCategory = categories.find(c => c.slug === 'fruits')!
  const vegetablesCategory = categories.find(c => c.slug === 'vegetables')!

  // Coffee Products
  const coffeeProducts = await Promise.all([
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[0].id,
        categoryId: coffeeCategory.id,
        name: 'Yirgacheffe Arabica Coffee Beans',
        slug: generateSlug('Yirgacheffe Arabica Coffee Beans'),
        description: 'Premium Yirgacheffe coffee beans known for their distinctive wine-like flavor and floral aroma. Grown at high altitude in the Yirgacheffe region of Sidamo. Grade 1 quality with bright acidity and medium body. Perfect for pour-over and espresso.',
        price: 450.00,
        unit: 'kg',
        productionLocation: 'Yirgacheffe, Sidamo, Oromia',
        harvestDate: new Date('2026-01-15'),
        qualityGrade: 'Grade 1',
        rating: 4.8,
        reviewCount: 45,
        viewCount: 523,
        orderCount: 89,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[0].id,
        categoryId: coffeeCategory.id,
        name: 'Sidamo Arabica Coffee - Natural Process',
        slug: generateSlug('Sidamo Arabica Coffee Natural Process'),
        description: 'Naturally processed Sidamo coffee with sweet berry notes and chocolate undertones. Hand-picked and sun-dried for maximum flavor. Medium roast recommended for best results.',
        price: 380.00,
        unit: 'kg',
        productionLocation: 'Sidamo, Oromia',
        harvestDate: new Date('2026-02-10'),
        qualityGrade: 'Grade 2',
        rating: 4.6,
        reviewCount: 32,
        viewCount: 412,
        orderCount: 67,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[0].id,
        categoryId: coffeeCategory.id,
        name: 'Harar Longberry Coffee',
        slug: generateSlug('Harar Longberry Coffee'),
        description: 'Exotic Harar longberry coffee with wine-like acidity and blueberry notes. One of the oldest coffee varieties in the world. Dry-processed for intense fruity flavor.',
        price: 520.00,
        unit: 'kg',
        productionLocation: 'Harar, Harari',
        harvestDate: new Date('2025-12-20'),
        qualityGrade: 'Grade 1',
        rating: 4.9,
        reviewCount: 28,
        viewCount: 387,
        orderCount: 54,
        active: true,
      },
    }),
  ])

  // Grain Products
  const grainProducts = await Promise.all([
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[2].id,
        categoryId: grainsCategory.id,
        name: 'White Teff',
        slug: generateSlug('White Teff'),
        description: 'Premium white teff grain, ideal for making injera. High in protein, fiber, and iron. Naturally gluten-free. Harvested from our cooperative farms in Tigray.',
        price: 85.00,
        unit: 'kg',
        productionLocation: 'Tigray',
        harvestDate: new Date('2026-03-01'),
        qualityGrade: 'Grade A',
        rating: 4.7,
        reviewCount: 56,
        viewCount: 678,
        orderCount: 134,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[2].id,
        categoryId: grainsCategory.id,
        name: 'Red Teff',
        slug: generateSlug('Red Teff'),
        description: 'Traditional red teff with rich, earthy flavor. Perfect for authentic injera. Higher iron content than white teff. Organically grown without pesticides.',
        price: 78.00,
        unit: 'kg',
        productionLocation: 'Tigray',
        harvestDate: new Date('2026-03-01'),
        qualityGrade: 'Grade A',
        rating: 4.6,
        reviewCount: 48,
        viewCount: 592,
        orderCount: 118,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[2].id,
        categoryId: grainsCategory.id,
        name: 'Wheat Grain',
        slug: generateSlug('Wheat Grain'),
        description: 'High-quality wheat grain suitable for flour production. Excellent for bread, pasta, and traditional dishes. Clean and properly dried.',
        price: 45.00,
        unit: 'kg',
        productionLocation: 'Tigray',
        harvestDate: new Date('2026-02-15'),
        qualityGrade: 'Grade B',
        rating: 4.4,
        reviewCount: 34,
        viewCount: 445,
        orderCount: 89,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[2].id,
        categoryId: grainsCategory.id,
        name: 'Barley',
        slug: generateSlug('Barley'),
        description: 'Premium barley grain for making traditional Ethiopian beverages and dishes. Clean, sorted, and ready to use.',
        price: 42.00,
        unit: 'kg',
        productionLocation: 'Amhara',
        harvestDate: new Date('2026-02-20'),
        qualityGrade: 'Grade A',
        rating: 4.5,
        reviewCount: 29,
        viewCount: 356,
        orderCount: 67,
        active: true,
      },
    }),
  ])

  // Spice Products
  const spiceProducts = await Promise.all([
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[3].id,
        categoryId: spicesCategory.id,
        name: 'Traditional Berbere Spice Mix',
        slug: generateSlug('Traditional Berbere Spice Mix'),
        description: 'Authentic Ethiopian berbere spice blend made from premium chili peppers, garlic, ginger, fenugreek, and aromatic spices. Essential for wot and other Ethiopian dishes. Medium heat level.',
        price: 180.00,
        unit: 'kg',
        productionLocation: 'Addis Ababa',
        qualityGrade: 'Premium',
        rating: 4.9,
        reviewCount: 78,
        viewCount: 892,
        orderCount: 167,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[3].id,
        categoryId: spicesCategory.id,
        name: 'Mitmita Spice Powder',
        slug: generateSlug('Mitmita Spice Powder'),
        description: 'Hot and flavorful mitmita spice blend. Perfect for kitfo and other raw meat dishes. Made with bird\'s eye chili, cardamom, cloves, and salt. Extra hot.',
        price: 220.00,
        unit: 'kg',
        productionLocation: 'Addis Ababa',
        qualityGrade: 'Premium',
        rating: 4.7,
        reviewCount: 52,
        viewCount: 634,
        orderCount: 98,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[3].id,
        categoryId: spicesCategory.id,
        name: 'Ethiopian Cardamom',
        slug: generateSlug('Ethiopian Cardamom'),
        description: 'Aromatic Ethiopian cardamom pods. Essential for coffee ceremonies and various dishes. Intense flavor and fragrance. Handpicked and sun-dried.',
        price: 850.00,
        unit: 'kg',
        productionLocation: 'Southern Ethiopia',
        qualityGrade: 'Grade A',
        rating: 4.8,
        reviewCount: 34,
        viewCount: 423,
        orderCount: 56,
        active: true,
      },
    }),
  ])

  // Honey Products
  const honeyProducts = await Promise.all([
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[1].id,
        categoryId: honeyCategory.id,
        name: 'White Highland Honey',
        slug: generateSlug('White Highland Honey'),
        description: 'Pure white honey from the Ethiopian highlands. Collected from wildflowers at high altitude. Creamy texture and delicate flavor. Raw and unprocessed.',
        price: 320.00,
        unit: 'kg',
        productionLocation: 'Shewa, Amhara',
        harvestDate: new Date('2026-04-10'),
        qualityGrade: 'Premium',
        rating: 4.9,
        reviewCount: 67,
        viewCount: 789,
        orderCount: 145,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[1].id,
        categoryId: honeyCategory.id,
        name: 'Yellow Honey',
        slug: generateSlug('Yellow Honey'),
        description: 'Golden yellow honey with balanced sweetness. Collected from diverse flora. Excellent for tea, cooking, and medicinal use. 100% natural.',
        price: 280.00,
        unit: 'kg',
        productionLocation: 'Shewa, Amhara',
        harvestDate: new Date('2026-04-15'),
        qualityGrade: 'Grade A',
        rating: 4.7,
        reviewCount: 45,
        viewCount: 567,
        orderCount: 98,
        active: true,
      },
    }),
  ])

  // Pulse Products
  const pulseProducts = await Promise.all([
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[2].id,
        categoryId: pulsesCategory.id,
        name: 'Red Lentils',
        slug: generateSlug('Red Lentils'),
        description: 'Premium red lentils perfect for making misir wot. Quick cooking and nutritious. High in protein and fiber. Clean and stone-free.',
        price: 65.00,
        unit: 'kg',
        productionLocation: 'Tigray',
        harvestDate: new Date('2026-01-20'),
        qualityGrade: 'Grade A',
        rating: 4.6,
        reviewCount: 42,
        viewCount: 512,
        orderCount: 94,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: sellerProfiles[2].id,
        categoryId: pulsesCategory.id,
        name: 'Chickpeas',
        slug: generateSlug('Chickpeas'),
        description: 'Large, tender chickpeas ideal for shiro and other dishes. Properly dried and stored. Rich in protein and minerals.',
        price: 58.00,
        unit: 'kg',
        productionLocation: 'Amhara',
        harvestDate: new Date('2026-02-05'),
        qualityGrade: 'Grade A',
        rating: 4.5,
        reviewCount: 38,
        viewCount: 467,
        orderCount: 82,
        active: true,
      },
    }),
  ])

  const allProducts = [
    ...coffeeProducts,
    ...grainProducts,
    ...spiceProducts,
    ...honeyProducts,
    ...pulseProducts,
  ]
  console.log(`  ✓ Created ${allProducts.length} products\n`)

  // ============================================
  // CREATE PRODUCT IMAGES
  // ============================================
  console.log('🖼️  Creating product images...')

  const productImages = []
  for (const product of allProducts) {
    // Each product gets 3 placeholder images
    for (let i = 0; i < 3; i++) {
      const image = await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `/images/products/${product.slug}-${i + 1}.jpg`,
          alt: `${product.name} - Image ${i + 1}`,
          order: i,
        },
      })
      productImages.push(image)
    }
  }
  console.log(`  ✓ Created ${productImages.length} product images\n`)

  // ============================================
  // CREATE PRODUCT VARIANTS
  // ============================================
  console.log('📊 Creating product variants...')

  const variants = []
  // Add variants to some products (different weights)
  for (const product of [coffeeProducts[0], grainProducts[0], honeyProducts[0]]) {
    const productVariants = await Promise.all([
      prisma.productVariant.create({
        data: {
          productId: product.id,
          name: '5 kg',
          price: Number(product.price) * 4.8, // Small bulk discount
          sku: `${product.slug}-5kg`,
          active: true,
        },
      }),
      prisma.productVariant.create({
        data: {
          productId: product.id,
          name: '10 kg',
          price: Number(product.price) * 9.5, // Larger bulk discount
          sku: `${product.slug}-10kg`,
          active: true,
        },
      }),
      prisma.productVariant.create({
        data: {
          productId: product.id,
          name: '25 kg',
          price: Number(product.price) * 23, // Best bulk discount
          sku: `${product.slug}-25kg`,
          active: true,
        },
      }),
    ])
    variants.push(...productVariants)
  }
  console.log(`  ✓ Created ${variants.length} product variants\n`)

  // ============================================
  // CREATE INVENTORY
  // ============================================
  console.log('📦 Creating inventory records...')

  const inventoryRecords = []
  for (const product of allProducts) {
    const inventory = await prisma.inventory.create({
      data: {
        productId: product.id,
        currentStock: Math.floor(Math.random() * 500) + 100, // 100-600 kg
        reservedStock: Math.floor(Math.random() * 20), // 0-20 kg reserved
        lowStockThreshold: 50,
      },
    })
    inventoryRecords.push(inventory)
  }
  console.log(`  ✓ Created ${inventoryRecords.length} inventory records\n`)

  // ============================================
  // CREATE CUSTOMER ADDRESSES
  // ============================================
  console.log('📍 Creating customer addresses...')

  const addresses = await Promise.all([
    prisma.address.create({
      data: {
        userId: customers[0].id,
        fullName: 'Abebe Kebede',
        phone: '+251911111111',
        region: 'Addis Ababa',
        zone: 'Bole',
        woreda: 'Woreda 03',
        kebele: 'Kebele 15',
        specificLocation: 'Near Edna Mall, Blue building',
        addressType: 'HOME',
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        userId: customers[0].id,
        fullName: 'Abebe Kebede',
        phone: '+251911111111',
        region: 'Addis Ababa',
        zone: 'Kirkos',
        woreda: 'Woreda 08',
        kebele: 'Kebele 22',
        specificLocation: 'Office building, 5th floor',
        addressType: 'OFFICE',
        isDefault: false,
      },
    }),
    prisma.address.create({
      data: {
        userId: customers[1].id,
        fullName: 'Almaz Tesfaye',
        phone: '+251911222222',
        region: 'Oromia',
        zone: 'East Shewa',
        woreda: 'Bishoftu',
        kebele: 'Kebele 05',
        specificLocation: 'Behind St. Mary Church',
        addressType: 'HOME',
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        userId: customers[2].id,
        fullName: 'Dawit Solomon',
        phone: '+251911333333',
        region: 'Addis Ababa',
        zone: 'Lideta',
        woreda: 'Woreda 05',
        kebele: 'Kebele 18',
        specificLocation: 'Near Piazza, yellow house',
        addressType: 'HOME',
        isDefault: true,
      },
    }),
  ])
  console.log(`  ✓ Created ${addresses.length} addresses\n`)

  // ============================================
  // CREATE CARTS
  // ============================================
  console.log('🛒 Creating shopping carts...')

  const carts = await Promise.all([
    prisma.cart.create({
      data: {
        userId: customers[0].id,
      },
    }),
    prisma.cart.create({
      data: {
        userId: customers[1].id,
      },
    }),
  ])

  // Add items to first customer's cart
  await Promise.all([
    prisma.cartItem.create({
      data: {
        cartId: carts[0].id,
        productId: coffeeProducts[0].id,
        quantity: 2,
      },
    }),
    prisma.cartItem.create({
      data: {
        cartId: carts[0].id,
        productId: honeyProducts[0].id,
        quantity: 1,
      },
    }),
  ])

  console.log(`  ✓ Created ${carts.length} carts with items\n`)

  // ============================================
  // CREATE ORDERS
  // ============================================
  console.log('📦 Creating orders...')

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'AGM-20260918-00001',
      customerId: customers[0].id,
      status: OrderStatus.DELIVERED,
      subtotal: 1350.00,
      deliveryFee: 50.00,
      discount: 0,
      total: 1400.00,
      shippingAddress: {
        fullName: 'Abebe Kebede',
        phone: '+251911111111',
        region: 'Addis Ababa',
        zone: 'Bole',
        woreda: 'Woreda 03',
        kebele: 'Kebele 15',
        specificLocation: 'Near Edna Mall, Blue building',
      },
      notes: 'Please call before delivery',
      confirmedAt: new Date('2026-09-01'),
      shippedAt: new Date('2026-09-02'),
      deliveredAt: new Date('2026-09-05'),
    },
  })

  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: order1.id,
        productId: coffeeProducts[0].id,
        sellerId: sellerProfiles[0].id,
        quantity: 2,
        price: 450.00,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: order1.id,
        productId: coffeeProducts[1].id,
        sellerId: sellerProfiles[0].id,
        quantity: 1,
        price: 380.00,
      },
    }),
  ])

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      amount: 1400.00,
      status: PaymentStatus.PAID,
      provider: 'CHAPA',
      transactionId: 'CHAPA-20260901-12345',
      paidAt: new Date('2026-09-01'),
    },
  })

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'AGM-20260918-00002',
      customerId: customers[1].id,
      status: OrderStatus.CONFIRMED,
      subtotal: 850.00,
      deliveryFee: 40.00,
      discount: 0,
      total: 890.00,
      shippingAddress: {
        fullName: 'Almaz Tesfaye',
        phone: '+251911222222',
        region: 'Oromia',
        zone: 'East Shewa',
        woreda: 'Bishoftu',
        kebele: 'Kebele 05',
        specificLocation: 'Behind St. Mary Church',
      },
      confirmedAt: new Date('2026-09-17'),
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: grainProducts[0].id,
      sellerId: sellerProfiles[2].id,
      quantity: 10,
      price: 85.00,
    },
  })

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      amount: 890.00,
      status: PaymentStatus.PAID,
      provider: 'TELEBIRR',
      transactionId: 'TELEBIRR-20260917-67890',
      paidAt: new Date('2026-09-17'),
    },
  })

  console.log('  ✓ Created 2 orders with items and payments\n')

  // ============================================
  // CREATE REVIEWS
  // ============================================
  console.log('⭐ Creating product reviews...')

  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: customers[0].id,
        productId: coffeeProducts[0].id,
        orderId: order1.id,
        rating: 5,
        title: 'Excellent Quality Coffee',
        comment: 'The best Yirgacheffe coffee I have tasted. The floral aroma is amazing and the flavor is consistently great. Will definitely order again!',
        verifiedPurchase: true,
        helpful: 12,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[0].id,
        productId: coffeeProducts[1].id,
        orderId: order1.id,
        rating: 4,
        title: 'Good Coffee, Natural Process Shines',
        comment: 'Very good coffee with nice berry notes. The natural processing really shows. Only 4 stars because it could be a bit cleaner.',
        verifiedPurchase: true,
        helpful: 8,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[1].id,
        productId: grainProducts[0].id,
        orderId: order2.id,
        rating: 5,
        title: 'Perfect White Teff',
        comment: 'Clean, high quality teff. Makes excellent injera. Delivery was fast and packaging was good.',
        verifiedPurchase: true,
        helpful: 15,
      },
    }),
  ])

  // Update product ratings based on reviews
  await prisma.product.update({
    where: { id: coffeeProducts[0].id },
    data: { rating: 4.8, reviewCount: 1 },
  })
  await prisma.product.update({
    where: { id: coffeeProducts[1].id },
    data: { rating: 4.6, reviewCount: 1 },
  })
  await prisma.product.update({
    where: { id: grainProducts[0].id },
    data: { rating: 4.7, reviewCount: 1 },
  })

  console.log(`  ✓ Created ${reviews.length} reviews\n`)

  // ============================================
  // CREATE NOTIFICATIONS
  // ============================================
  console.log('🔔 Creating notifications...')

  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: customers[0].id,
        type: NotificationType.ORDER_DELIVERED,
        title: 'Order Delivered',
        message: 'Your order AGM-20260918-00001 has been delivered. Thank you for shopping with AgriMarket!',
        read: true,
        metadata: { orderId: order1.id },
      },
    }),
    prisma.notification.create({
      data: {
        userId: customers[1].id,
        type: NotificationType.ORDER_CONFIRMED,
        title: 'Order Confirmed',
        message: 'Your order AGM-20260918-00002 has been confirmed. The seller will process it soon.',
        read: false,
        metadata: { orderId: order2.id },
      },
    }),
    prisma.notification.create({
      data: {
        userId: sellers[0].id,
        type: NotificationType.NEW_REVIEW,
        title: 'New Product Review',
        message: 'Your product "Yirgacheffe Arabica Coffee Beans" received a 5-star review!',
        read: false,
        metadata: { productId: coffeeProducts[0].id },
      },
    }),
  ])

  console.log(`  ✓ Created ${notifications.length} notifications\n`)

  // ============================================
  // CREATE AUDIT LOGS
  // ============================================
  console.log('📝 Creating audit logs...')

  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'SELLER_VERIFIED',
        entityType: 'SELLER_PROFILE',
        entityId: sellerProfiles[0].id,
        details: {
          businessName: sellerProfiles[0].businessName,
          verifiedBy: admin.email,
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: customers[0].id,
        action: 'ORDER_CREATED',
        entityType: 'ORDER',
        entityId: order1.id,
        details: {
          orderNumber: order1.orderNumber,
          total: order1.total,
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'PAYMENT_CONFIRMED',
        entityType: 'PAYMENT',
        entityId: order1.id,
        details: {
          provider: 'CHAPA',
          amount: 1400.00,
        },
      },
    }),
  ])

  console.log(`  ✓ Created ${auditLogs.length} audit logs\n`)

  // ============================================
  // CREATE WISHLISTS
  // ============================================
  console.log('💝 Creating wishlists...')

  const wishlist1 = await prisma.wishlist.create({
    data: {
      userId: customers[0].id,
    },
  })

  await Promise.all([
    prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist1.id,
        productId: coffeeProducts[2].id, // Harar Coffee
      },
    }),
    prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist1.id,
        productId: spiceProducts[0].id, // Berbere
      },
    }),
  ])

  console.log('  ✓ Created wishlists with items\n')

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═══════════════════════════════════════════')
  console.log('✅ Database seeding completed successfully!\n')
  console.log('📊 Summary:')
  console.log(`   • Users: ${1 + customers.length + sellers.length}`)
  console.log(`     - Admin: 1`)
  console.log(`     - Customers: ${customers.length}`)
  console.log(`     - Sellers: ${sellers.length}`)
  console.log(`   • Seller Profiles: ${sellerProfiles.length}`)
  console.log(`   • Categories: ${categories.length}`)
  console.log(`   • Products: ${allProducts.length}`)
  console.log(`   • Product Images: ${productImages.length}`)
  console.log(`   • Product Variants: ${variants.length}`)
  console.log(`   • Inventory Records: ${inventoryRecords.length}`)
  console.log(`   • Customer Addresses: ${addresses.length}`)
  console.log(`   • Shopping Carts: ${carts.length}`)
  console.log(`   • Orders: 2`)
  console.log(`   • Reviews: ${reviews.length}`)
  console.log(`   • Notifications: ${notifications.length}`)
  console.log(`   • Audit Logs: ${auditLogs.length}`)
  console.log('\n🔑 Test Credentials:')
  console.log('   Admin:')
  console.log('     Email: admin@agrimarket.com')
  console.log('     Password: Admin123!')
  console.log('\n   Customer:')
  console.log('     Email: customer1@example.com')
  console.log('     Password: Customer123!')
  console.log('\n   Seller:')
  console.log('     Email: seller1@example.com')
  console.log('     Password: Seller123!')
  console.log('\n═══════════════════════════════════════════\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
