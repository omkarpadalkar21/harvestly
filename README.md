# Harvestly

A B2C platform where sellers can join and sell farm produce under their own brand, sourced directly from farmers. Harvestly bridges the gap between farmers and consumers by creating a transparent, reliable, and farmer-first marketplace.

## About Harvestly

### From a Seller's Perspective

- **Join as a verified seller** and build your own brand
- **Source fresh produce directly** from farmers without middlemen
- **Sell grains, fruits, vegetables, dairy, and more** with flexible policies for perishable and non-perishable goods
- **Manage products, pricing, and refund policies** easily

### From a Consumer's Perspective

- **Buy fresh, authentic, and quality farm produce**
- **Support farmers and local brands** directly
- **Get transparent pricing** without middlemen
- **Choose from a wide range** of perishable and non-perishable items

### Our Mission

To empower farmers and local sellers while giving consumers access to fresh, affordable, and trustworthy produce — building a farmer-first marketplace.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Backend**: Payload CMS with MongoDB
- **Database**: MongoDB
- **Authentication**: Payload Auth
- **API**: tRPC for type-safe API calls
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state

## Features

- **Product Management**: Create and manage products with categories and subcategories
- **Inventory System**: Track perishable and non-perishable goods
- **Pricing & Policies**: Flexible refund policies based on product perishability
- **User Authentication**: Secure seller and consumer accounts
- **Responsive Design**: Mobile-first approach for all devices

## 📚 Documentation

For comprehensive development documentation, architecture guides, and component references, see the **[Documentation](./docs/README.md)** folder:

- **[App Structure](./docs/app-structure.md)** - Complete overview of the `src/app` directory structure
- **[Components Overview](./docs/components-overview.md)** - Detailed documentation of all key components
- **[Routing Guide](./docs/routing-guide.md)** - Next.js App Router patterns and navigation

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
