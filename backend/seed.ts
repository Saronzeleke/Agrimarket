import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Grains & Cereals',
        slug: 'grains-cereals',
        description: 'Wheat, barley, teff, maize, and other grains',
        icon: '🌾',
        active: true,
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Vegetables',
        slug: 'vegetables',
        description: 'Fresh vegetables from Ethiopian farms',
        icon: '🥬',
        active: true,
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Fruits',
        slug: 'fruits',
        description: 'Fresh fruits and berries',
        icon: '🍎',
        active: true,
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Coffee & Spices',
        slug: 'coffee-spices',
        description: 'Ethiopian coffee beans and traditional spices',
        icon: '☕',
        active: true,
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pulses & Legumes',
        slug: 'pulses-legumes',
        description: 'Lentils, chickpeas, beans, and peas',
        icon: '🫘',
        active: true,
        order: 5,
      },
    }),
  ]);

  console.log(`✓ Created ${categories.length} categories`);

  // Create test user
  const hashedPassword = await bcrypt.hash('Test123!@#', 12);
  
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@test.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Buyer',
      phone: '+251911234567',
      role: 'CUSTOMER',
      emailVerified: true,
      active: true,
    },
  });

  console.log('✓ Created test buyer:', buyer.email);

  // Create seller with profile
  const seller = await prisma.user.create({
    data: {
      email: 'seller@test.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Seller',
      phone: '+251922345678',
      role: 'SELLER',
      emailVerified: true,
      active: true,
      sellerProfile: {
        create: {
          businessName: 'Highland Farms',
          description: 'Premium quality agricultural products from Oromia region',
          phone: '+251922345678',
          location: 'Oromia',
          verified: true,
          rating: 4.8,
          reviewCount: 0,
        },
      },
    },
    include: {
      sellerProfile: true,
    },
  });

  console.log('✓ Created test seller:', seller.email);

  // Create products
  const products = [
    {
      name: 'Premium Teff Grain',
      slug: 'premium-teff-grain',
      description: 'Organic teff grain from Amhara highlands. Rich in iron, calcium, and protein. Perfect for making injera and other traditional dishes.',
      price: 450.00,
      unit: 'kg',
      categoryId: categories[0].id, // Grains
      productionLocation: 'Amhara, Gondar Zone',
      harvestDate: new Date('2026-09-15'),
      qualityGrade: 'Premium',
    },
    {
      name: 'Ethiopian Arabica Coffee Beans',
      slug: 'ethiopian-arabica-coffee',
      description: 'Single-origin Ethiopian Arabica coffee beans from Yirgacheffe. Notes of blueberry and jasmine. Grade 1 export quality.',
      price: 850.00,
      unit: 'kg',
      categoryId: categories[3].id, // Coffee & Spices
      productionLocation: 'SNNPR, Yirgacheffe',
      harvestDate: new Date('2026-08-20'),
      qualityGrade: 'A',
    },
    {
      name: 'Fresh Tomatoes',
      slug: 'fresh-tomatoes',
      description: 'Vine-ripened tomatoes from Rift Valley. Rich flavor, perfect for salads and cooking.',
      price: 25.00,
      unit: 'kg',
      categoryId: categories[1].id, // Vegetables
      productionLocation: 'Oromia, East Shewa',
      harvestDate: new Date('2026-09-28'),
      qualityGrade: 'A',
    },
    {
      name: 'Red Lentils (Misir)',
      slug: 'red-lentils-misir',
      description: 'Premium Ethiopian red lentils. Perfect for making traditional misir wot. High protein content.',
      price: 120.00,
      unit: 'kg',
      categoryId: categories[4].id, // Pulses
      productionLocation: 'Amhara, South Gondar',
      harvestDate: new Date('2026-07-10'),
      qualityGrade: 'A',
    },
    {
      name: 'Yellow Onions',
      slug: 'yellow-onions',
      description: 'Fresh yellow onions from Tigray. Long shelf life, strong flavor.',
      price: 30.00,
      unit: 'kg',
      categoryId: categories[1].id, // Vegetables
      productionLocation: 'Tigray, Central Zone',
      harvestDate: new Date('2026-09-20'),
      qualityGrade: 'B',
    },
    {
      name: 'Berbere Spice Mix',
      slug: 'berbere-spice-mix',
      description: 'Traditional Ethiopian berbere spice blend. Contains chili peppers, garlic, ginger, and 15+ spices.',
      price: 200.00,
      unit: 'kg',
      categoryId: categories[3].id, // Coffee & Spices
      productionLocation: 'Addis Ababa',
      harvestDate: new Date('2026-09-01'),
      qualityGrade: 'Premium',
    },
    {
      name: 'White Maize',
      slug: 'white-maize',
      description: 'High-quality white maize for flour production. Drought-resistant variety.',
      price: 35.00,
      unit: 'kg',
      categoryId: categories[0].id, // Grains
      productionLocation: 'Oromia, West Hararghe',
      harvestDate: new Date('2026-08-25'),
      qualityGrade: 'B',
    },
    {
      name: 'Bananas',
      slug: 'bananas',
      description: 'Fresh bananas from southern Ethiopia. Sweet and perfectly ripe.',
      price: 40.00,
      unit: 'kg',
      categoryId: categories[2].id, // Fruits
      productionLocation: 'SNNPR, Wolaita',
      harvestDate: new Date('2026-09-27'),
      qualityGrade: 'A',
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        ...productData,
        sellerId: seller.sellerProfile!.id,
        rating: Math.random() * 2 + 3, // 3.0 - 5.0
        reviewCount: Math.floor(Math.random() * 50),
        viewCount: Math.floor(Math.random() * 1000),
        orderCount: Math.floor(Math.random() * 100),
        active: true,
        images: {
          create: [
            {
              url: `https://placeholder.co/600x400/png?text=${encodeURIComponent(productData.name)}`,
              alt: productData.name,
              order: 0,
            },
          ],
        },
        inventory: {
          create: {
            currentStock: Math.floor(Math.random() * 500) + 50,
            reservedStock: 0,
            lowStockThreshold: 10,
          },
        },
      },
    });

    console.log(`✓ Created product: ${product.name}`);
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('Buyer: buyer@test.com / Test123!@#');
  console.log('Seller: seller@test.com / Test123!@#');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
