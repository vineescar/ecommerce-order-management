# E-commerce Order Management System

A full-stack order management application built with modern technologies.

## Live Demo

- **Frontend:** [https://ecommerce-order-management-lnb4.vercel.app](https://ecommerce-order-management-lnb4.vercel.app)
- **Backend API:** [https://ecommerce-order-management-3o5p.onrender.com](https://ecommerce-order-management-3o5p.onrender.com)

## Tech Stack

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Validation:** express-validator
- **Code Quality:** ESLint + Prettier

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Form Handling:** React Hook Form
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Code Quality:** ESLint + Prettier

### DevOps
- **Containerization:** Docker & Docker Compose
- **Database Hosting:** Neon (PostgreSQL)
- **Backend Hosting:** Render
- **Frontend Hosting:** Vercel

---

## Features

- View all orders with associated products
- Create new orders with product selection
- Edit existing orders
- Delete orders with confirmation
- Search orders by ID or description
- Responsive design for all devices
- Toast notifications for user feedback
- Form validation (client & server side)
- Error handling with user-friendly messages

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/orders` | Get all orders with products |
| GET | `/api/orders/:id` | Get order by ID |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id` | Update order |
| DELETE | `/api/orders/:id` | Delete order |
| GET | `/api/orders/products/all` | Get all products |

---

## Database Schema

### Orders Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| order_description | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Products Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY |
| product_name | VARCHAR(100) | NOT NULL |
| product_description | TEXT | |

### Order_Product_Map Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| order_id | INT | FK → orders(id), NOT NULL |
| product_id | INT | FK → products(id), NOT NULL |

---

## Local Development

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/vineescar/ecommerce-order-management.git
cd ecommerce-order-management

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000/api
# Database: localhost:5432
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or use Docker for database only)

#### 1. Start Database

```bash
# Using Docker for database only
docker-compose up db
```

#### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your database URL
# DATABASE_URL=postgresql://admin:password123@localhost:5432/ecommerce

# Start development server
npm run dev
```

#### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env if needed
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

---

## Production Deployment

The application is deployed using the following services:

| Service | Platform | URL |
|---------|----------|-----|
| Database | Neon (PostgreSQL) | - |
| Backend | Render | https://ecommerce-order-management-3o5p.onrender.com |
| Frontend | Vercel | https://ecommerce-order-management-lnb4.vercel.app |

### Environment Variables

**Backend (Render):**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NODE_ENV` - production
- `PORT` - 5000
- `CORS_ORIGIN` - Vercel frontend URL

**Frontend (Vercel):**
- `VITE_API_URL` - Render backend URL + /api

---

## Project Structure

```
ecommerce-order-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # Database connection & initialization
│   │   ├── controllers/
│   │   │   └── orderController.ts # Request handlers
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts    # Error handling middleware
│   │   │   └── validateRequest.ts # Validation middleware
│   │   ├── routes/
│   │   │   └── orderRoutes.ts     # API routes
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── ApiError.ts        # Custom error classes
│   │   └── app.ts                 # Express application
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.js
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   └── orders/            # Order-specific components
│   │   │       ├── OrderList.tsx
│   │   │       └── OrderForm.tsx
│   │   ├── pages/
│   │   │   ├── OrdersPage.tsx
│   │   │   └── CreateOrderPage.tsx
│   │   ├── services/
│   │   │   └── api.ts             # Axios instance
│   │   ├── hooks/
│   │   │   ├── useOrders.ts
│   │   │   ├── useProducts.ts
│   │   │   └── useDebounce.ts
│   │   ├── context/
│   │   │   └── ToastContext.tsx   # Toast notifications
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── .eslintrc.js
│   └── Dockerfile
│
├── database/
│   └── init.sql                   # Database schema & seed data
│
├── docker-compose.yml             # Local development setup
├── .gitignore
└── README.md
```

---

## Scripts

### Backend

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm run lint     # Run ESLint
npm run lint:fix # Fix ESLint errors
npm run format   # Format code with Prettier
```

### Frontend

```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run lint:fix # Fix ESLint errors
npm run format   # Format code with Prettier
```

---

## Assumptions & Trade-offs

### Assumptions
1. **No Authentication:** The assignment didn't require user authentication
2. **Pre-seeded Products:** Products are seeded in the database and not managed through the UI
3. **Single User:** No multi-user/session management required

### Trade-offs
1. **Raw SQL vs ORM:** Used raw SQL queries with `pg` library instead of an ORM (like Prisma) for simplicity and to demonstrate SQL knowledge
2. **Tailwind CSS:** Chose Tailwind for rapid UI development over component libraries like Material UI
3. **Express vs NestJS:** Used Express for simplicity; NestJS would provide more structure for larger applications
4. **React Hook Form:** Selected for form handling due to good TypeScript support and performance

### Future Improvements
- Add user authentication (JWT)
- Implement pagination for orders list
- Add unit and integration tests
- Add product management (CRUD)
- Implement order status tracking
- Add export functionality (CSV/PDF)

---

## Notes

> **Cold Start Warning:** Free tier services (Render, Neon) may have cold starts.
> The first request might take 10-30 seconds after inactivity.

---

## License

MIT
