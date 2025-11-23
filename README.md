# Smart Image Search E-commerce

A modern e-commerce platform built with Next.js that features AI-powered image similarity search. Users can upload product images to find visually similar items in the catalog using OpenCLIP and FAISS for vector-based search.

## Features

- **AI Image Search**: Upload images to find similar products using deep learning embeddings
- **Product Catalog**: Browse products across multiple categories (T-shirts, Pants, Sweatshirts)
- **User Authentication**: Support for credential-based and Google OAuth login
- **Shopping Cart**: Add items to cart with size and color variants
- **Wishlist**: Save favorite products for later
- **Order Management**: Track purchase history and order details
- **Stripe Integration**: Secure payment processing with webhook support
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Image Optimization**: Cloudinary integration for efficient image delivery

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- NextAuth.js for authentication

### Backend
- FastAPI (Python) for AI search server
- MongoDB with Mongoose ODM
- NextAuth.js API routes
- Stripe for payments

### AI/ML
- OpenCLIP (ViT-B-32 model)
- FAISS for vector similarity search
- PyTorch

## Prerequisites

- Node.js 18 or higher
- Python 3.8 or higher
- MongoDB instance
- Stripe account
- Cloudinary account
- Google OAuth credentials (optional)

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd vj-e-smart-image-search
```

### Install Node.js dependencies

```bash
npm install
```

### Install Python dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email
NEXT_PUBLIC_EMAIL_USERNAME=your_email_username
NEXT_PUBLIC_EMAIL_PASSWORD=your_email_password
NEXT_PUBLIC_PERSONAL_EMAIL=your_personal_email

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Running the Application

### Start the Next.js development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Start the AI search server

```bash
python ai_server.py
```

The AI server will run on `http://localhost:8000`

## Project Structure

```
vj-e-smart-image-search/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (carts)/           # Cart and wishlist pages
│   │   ├── (user)/            # User-related pages (orders)
│   │   ├── api/               # API routes
│   │   └── [category]/        # Dynamic category pages
│   ├── components/            # React components
│   │   ├── account/          # Authentication components
│   │   ├── cart/             # Shopping cart components
│   │   ├── common/           # Shared components
│   │   ├── products/         # Product display components
│   │   ├── skeletons/        # Loading skeletons
│   │   └── ui/               # UI components (Radix UI)
│   ├── helpers/              # Utility functions
│   ├── hooks/                # Custom React hooks
│   ├── libs/                 # Library configurations
│   ├── models/               # MongoDB models
│   ├── styles/               # Global styles
│   └── types/                # TypeScript type definitions
├── ai_server.py              # FastAPI server for image search
├── model.py                  # Standalone search script
├── requirements.txt          # Python dependencies
└── package.json              # Node.js dependencies
```

## Key Features Implementation

### Image Search

The image search functionality uses a two-server architecture:

1. **Next.js Frontend**: Handles image upload through the UploadButton component
2. **FastAPI Backend**: Processes images using OpenCLIP to generate embeddings and FAISS for similarity search

When a user uploads an image:
- The image is sent to the AI server
- OpenCLIP generates a vector embedding
- FAISS searches for the top 5 most similar product embeddings
- Results are returned as product IDs
- Frontend displays the matching products

### Authentication

The application supports multiple authentication methods:
- Email/password with bcrypt hashing
- Google OAuth integration
- Session management with NextAuth.js

### Payment Processing

Stripe integration includes:
- Checkout session creation
- Webhook handling for payment confirmation
- Order creation and email notifications
- Invoice generation

### Database Schema

**Products**: Name, description, price, category, sizes, variants (colors, images, Stripe price IDs)

**Users**: Email, password (hashed), name, phone, timestamps

**Orders**: User reference, products purchased, shipping address, payment details, order tracking

**Wishlists**: User reference, saved product IDs

## Adding Products

Use the upload script to add products to the database:

```bash
npx tsx scripts/upload-product.ts
```

Follow the prompts to enter product details and upload images to Cloudinary.

## API Routes

- `/api/auth/[...nextauth]` - NextAuth authentication endpoints
- `/api/auth/signup` - User registration
- `/api/products` - Product management
- `/api/stripe/payment` - Create checkout session
- `/api/stripe/checkout_sessions` - Retrieve session data
- `/api/stripe/webhooks` - Handle payment webhooks
- `/api/email` - Send transactional emails
- `/api/upload-image` - Handle image uploads

## AI Server Endpoints

- `POST /find_similar_products` - Upload image and receive similar product IDs

## Development

### Build for production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Credits

Created by Marcos Penelas Camara

## Links

- Portfolio: https://portfoliomarcos.com/
- LinkedIn: https://www.linkedin.com/in/marcospenelascamara/
- GitHub: https://github.com/MarcosCamara01
- Medium: https://medium.com/@marcoscamara
