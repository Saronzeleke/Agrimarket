# AgriMarket

**A professional agricultural e-commerce marketplace connecting producers with customers**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%3E%3D5.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D14-blue.svg)](https://www.postgresql.org/)

---

## 📖 Overview

AgriMarket is a digital marketplace that bridges the gap between agricultural producers and customers in Ethiopia and similar markets. The platform enables sellers to list agricultural products, manage inventory, and fulfill orders, while customers can discover products, make purchases, and track deliveries.

This is a **portfolio project** demonstrating professional software engineering practices including:
- Clean architecture and separation of concerns
- Type-safe development with TypeScript
- Comprehensive testing strategies
- Security-first development
- Performance optimization
- Production-ready deployment

## 🎯 Key Features

### For Customers
- 🔍 **Product Discovery**: Search and filter through agricultural products
- 🛒 **Shopping Cart**: Add products with variant selection and real-time stock validation
- 💳 **Secure Checkout**: Multiple payment options with order tracking
- ⭐ **Reviews & Ratings**: Review purchased products and read others' experiences
- 📦 **Order Management**: Track orders from placement to delivery
- 💝 **Wishlist**: Save products for later

### For Sellers
- 🏪 **Store Management**: Create and manage your agricultural business profile
- 📦 **Product Management**: List products with detailed information and images
- 📊 **Inventory Tracking**: Real-time inventory management with low-stock alerts
- 📈 **Sales Analytics**: Track revenue, orders, and popular products
- 🚚 **Order Fulfillment**: Manage incoming orders and update delivery status

### For Administrators
- 👥 **User Management**: Manage customers and sellers
- ✅ **Product Moderation**: Review and approve product listings
- 📊 **Platform Analytics**: Monitor platform-wide metrics
- 🔒 **Audit Logs**: Track critical system actions
- 🛡️ **Security Management**: Suspend accounts and handle disputes

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs) folder:

### Core Documents
- **[Product Requirements Document](./docs/01-product-requirements.md)**: Complete product specifications, user roles, features, and success metrics
- **[System Architecture Document](./docs/02-system-architecture.md)**: Technical architecture, database design, security, and deployment

### Quick Links
- [Product Vision](./docs/01-product-requirements.md#1-product-vision)
- [User Roles & Capabilities](./docs/01-product-requirements.md#2-user-roles--capabilities)
- [System Architecture](./docs/02-system-architecture.md#1-architecture-overview)
- [Database Schema](./docs/02-system-architecture.md#4-database-architecture)
- [Security Architecture](./docs/02-system-architecture.md#5-security-architecture)
- [API Design](./docs/02-system-architecture.md#32-api-design-principles)

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 5+
- **State Management**: TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router

### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5+
- **Authentication**: JWT tokens
- **Validation**: Zod schemas
- **Password Hashing**: Bcrypt

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Version Control**: Git

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- Git ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/agrimarket.git
cd agrimarket
```

2. **Set up environment variables**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

3. **Start the development environment**
```bash
# Start PostgreSQL database
docker-compose up -d postgres

# Install dependencies and run migrations
cd backend
npm install
npx prisma migrate dev
npx prisma db seed

# Start backend API
npm run dev

# In a new terminal, start frontend
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database Admin (Adminer): http://localhost:8080

### Docker Compose (Full Stack)

```bash
# Start all services
docker-compose up

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:3001
# - Adminer: http://localhost:8080
```

## 📁 Project Structure

```
agrimarket/
├── docs/                          # 📚 Comprehensive documentation
│   ├── README.md                  # Documentation index
│   ├── 01-product-requirements.md # Product specifications
│   └── 02-system-architecture.md  # Technical architecture
│
├── backend/                       # 🔧 Node.js + Express API
│   ├── src/
│   │   ├── routes/                # API routes
│   │   ├── controllers/           # Route handlers
│   │   ├── services/              # Business logic
│   │   ├── repositories/          # Database access
│   │   ├── middleware/            # Express middleware
│   │   ├── validators/            # Zod schemas
│   │   └── utils/                 # Utilities
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── migrations/            # Database migrations
│   │   └── seed.ts                # Seed data
│   └── tests/                     # Backend tests
│
├── frontend/                      # ⚛️ React + Vite app
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── lib/                   # API client, hooks, utils
│   │   ├── types/                 # TypeScript types
│   │   └── styles/                # Global styles
│   └── public/                    # Static assets
│
└── docker-compose.yml             # Docker configuration
```

## 🔒 Security

Security is a top priority in AgriMarket. Key security measures include:

- **Authentication**: JWT-based with bcrypt password hashing (12 rounds)
- **Authorization**: Role-based access control (RBAC) enforced server-side
- **Input Validation**: Multi-layer validation (client + server + database)
- **SQL Injection Prevention**: Parameterized queries via Prisma ORM
- **XSS Prevention**: Input sanitization and CSP headers
- **Rate Limiting**: Protection against brute force attacks
- **HTTPS Only**: All production traffic over HTTPS
- **Secure Headers**: Helmet.js security headers

For detailed security architecture, see [Security Documentation](./docs/02-system-architecture.md#5-security-architecture).

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test                # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage   # With coverage report

# Frontend tests
cd frontend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report

# E2E tests
npm run test:e2e        # Run end-to-end tests
```

## 📊 Development Phases

The project follows a **20-phase incremental development approach**:

### Foundation (Phases 1-3) ✅
- [x] Phase 1: Requirements + Architecture ✅
- [x] Phase 2: Database schema + migrations ✅
- [x] Phase 3: Project setup + configuration ✅

### Core Features (Phases 4-10)
- [x] Phase 4: Authentication & authorization ✅
- [ ] Phase 5: Product catalog
- [ ] Phase 6: Search & filtering
- [ ] Phase 7: Shopping cart
- [ ] Phase 8: Checkout
- [ ] Phase 9: Orders
- [ ] Phase 10: Inventory

### Advanced Features (Phases 11-15)
- [ ] Phase 11: Seller dashboard
- [ ] Phase 12: Admin dashboard
- [ ] Phase 13: Reviews
- [ ] Phase 14: Recommendations
- [ ] Phase 15: Notifications

### Quality & Launch (Phases 16-20)
- [ ] Phase 16: Testing
- [ ] Phase 17: Security review
- [ ] Phase 18: Performance review
- [ ] Phase 19: Deployment
- [ ] Phase 20: Documentation

## 🎨 Design Principles

- **Clean Architecture**: Clear separation between presentation, business logic, and data layers
- **Type Safety**: TypeScript throughout for reduced bugs and better maintainability
- **Security First**: Security considerations at every layer
- **Performance**: Database indexing, query optimization, and efficient caching
- **Testability**: Business logic isolated and independently testable
- **Scalability**: Designed to scale horizontally with stateless API
- **Maintainability**: Consistent code style, clear naming, comprehensive documentation

## 📈 Success Metrics

### Technical Metrics
- ✅ API response time < 500ms (p95)
- ✅ Database query time < 100ms (average)
- ✅ Test coverage ≥ 80% (business logic)
- ✅ Zero critical security vulnerabilities
- ✅ Uptime ≥ 99.5%

### Business Metrics
- 🎯 Registration completion rate ≥ 70%
- 🎯 Order completion rate ≥ 80%
- 🎯 Seller activation rate ≥ 60%
- 🎯 Average order value ≥ 500 ETB

## 🤝 Contributing

This is a portfolio/demonstration project. While contributions are welcome, please note this is primarily a learning and showcase project.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow existing code style
- Write tests for new features
- Update documentation
- Run linters before committing
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

**Development Team**
- Lead Developer: [Your Name]
- Architecture: [Your Name]
- UI/UX: [Your Name]

## 🙏 Acknowledgments

- **shadcn/ui**: For excellent accessible UI components
- **Prisma**: For type-safe database access
- **TanStack Query**: For powerful server state management
- **Ethiopian Agricultural Community**: For domain insights

## 📞 Contact & Support

- **Documentation**: See [`/docs`](./docs) folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/agrimarket/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/agrimarket/discussions)

## 🗺️ Roadmap

### Current Phase: Phase 1 Complete ✅
- [x] Product Requirements Document
- [x] System Architecture Document

### Next Phase: Phase 2 (Database)
- [ ] Prisma schema design
- [ ] Database migrations
- [ ] Seed data scripts

### Future Enhancements
- Mobile native applications (iOS/Android)
- Advanced ML-based recommendations
- Real-time chat between buyers and sellers
- Multi-language support
- Multi-currency support
- Third-party logistics integration

---

## 🌟 Project Status

**Current Status**: Phase 4 Complete (Authentication & Authorization)  
**Next Milestone**: Phase 5 (Product Catalog)  
**Version**: 0.1.0-alpha  
**Last Updated**: September 18, 2026

---

**Built with ❤️ for the agricultural community**
