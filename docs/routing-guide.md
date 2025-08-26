# Routing Guide

## Overview

Harvestly uses Next.js 15 App Router with route groups for organized code splitting. This guide explains the routing structure, dynamic routes, and how navigation works throughout the application.

## Route Groups

### `(app)` - Main Application Routes

The main application route group contains all user-facing pages and functionality.

#### Structure

```
(app)/
├── (auth)/              # Authentication routes
│   ├── sign-in/         # /sign-in
│   └── sign-up/         # /sign-up
├── (home)/              # Home and product routes
│   ├── [category]/      # /[category]
│   ├── about/           # /about
│   ├── contact/         # /contact
│   ├── features/        # /features
│   └── pricing/         # /pricing
├── layout.tsx           # Root layout
└── globals.css          # Global styles
```

### `(payload)` - Admin Routes

The admin route group contains Payload CMS admin interface.

#### Structure

```
(payload)/
├── admin/               # /admin
│   └── [[...segments]]/ # Dynamic admin routes
├── api/                 # Payload API routes
│   ├── [...slug]/       # /api/payload/[...slug]
│   ├── graphql/         # /api/payload/graphql
│   └── graphql-playground/ # /api/payload/graphql-playground
└── layout.tsx           # Admin layout
```

## Dynamic Routes

### Category Routes

#### `/[category]` - Category Listing

- **Purpose**: Displays products filtered by category
- **Example**: `/vegetables`, `/fruits`, `/herbs-spices`
- **Parameters**: `category` (string) - Category slug
- **Features**:
  - Product grid filtered by category
  - Category information display
  - Subcategory navigation
  - Breadcrumb navigation

#### `/[category]/[subcategory]` - Subcategory Listing

- **Purpose**: Displays products filtered by subcategory
- **Example**: `/vegetables/leafy-greens`, `/fruits/citrus`
- **Parameters**:
  - `category` (string) - Parent category slug
  - `subcategory` (string) - Subcategory slug
- **Features**:
  - Product grid filtered by subcategory
  - Parent category context
  - Breadcrumb navigation
  - Related subcategories

### Admin Routes

#### `/admin` - Admin Dashboard

- **Purpose**: Payload CMS admin interface
- **Features**:
  - Content management
  - User management
  - Media management
  - Settings configuration

#### `/admin/[[...segments]]` - Dynamic Admin Routes

- **Purpose**: Dynamic admin pages for collections
- **Example**: `/admin/collections/products`, `/admin/collections/categories`
- **Features**:
  - Collection management
  - Document editing
  - Media uploads
  - User administration

## Static Routes

### Authentication Routes

#### `/sign-in` - User Sign In

- **Purpose**: Existing user authentication
- **Features**:
  - Email/password login
  - Form validation
  - Error handling
  - Redirect after login

#### `/sign-up` - User Registration

- **Purpose**: New user registration
- **Features**:
  - User registration form
  - Email verification
  - Password validation
  - Terms acceptance

### Information Pages

#### `/about` - About Page

- **Purpose**: Company information and mission
- **Features**:
  - Company story
  - Mission statement
  - Team information
  - Values and principles

#### `/contact` - Contact Page

- **Purpose**: Contact information and support
- **Features**:
  - Contact form
  - Support information
  - Office locations
  - Business hours

#### `/features` - Features Page

- **Purpose**: Platform features and benefits
- **Features**:
  - Feature highlights
  - Benefits for sellers
  - Benefits for consumers
  - Platform capabilities

#### `/pricing` - Pricing Page

- **Purpose**: Pricing information and plans
- **Features**:
  - Pricing tiers
  - Feature comparison
  - Payment options
  - FAQ section

## API Routes

### tRPC API

#### `/api/trpc/[trpc]` - tRPC API Handler

- **Purpose**: Handles all tRPC API requests
- **Features**:
  - Type-safe API calls
  - Query and mutation support
  - Error handling
  - CORS configuration

### Payload API

#### `/api/payload/[...slug]` - Payload API Routes

- **Purpose**: Payload CMS API endpoints
- **Features**:
  - CRUD operations
  - Authentication
  - File uploads
  - Webhooks

#### `/api/payload/graphql` - GraphQL Endpoint

- **Purpose**: GraphQL API for Payload
- **Features**:
  - GraphQL queries
  - Mutations
  - Subscriptions
  - Schema introspection

## Navigation Patterns

### Client-Side Navigation

#### Programmatic Navigation

```typescript
import { useRouter } from "next/navigation";

const router = useRouter();

// Navigate to category
router.push(`/${categorySlug}`);

// Navigate to subcategory
router.push(`/${categorySlug}/${subcategorySlug}`);

// Navigate with query parameters
router.push(`/${categorySlug}?search=${searchTerm}`);
```

#### Link Components

```typescript
import Link from 'next/link';

// Static link
<Link href="/about">About</Link>

// Dynamic link
<Link href={`/${category.slug}`}>{category.name}</Link>

// Link with query parameters
<Link href={`/${category.slug}?sort=price&order=asc`}>
  Sort by Price
</Link>
```

### URL State Management

#### Query Parameters

- **Search**: `?search=keyword`
- **Sorting**: `?sort=price&order=asc`
- **Filtering**: `?category=vegetables&subcategory=leafy-greens`
- **Pagination**: `?page=2&limit=20`

#### URL State with Nuqs

```typescript
import { useQueryState } from "nuqs";

const [search, setSearch] = useQueryState("search");
const [category, setCategory] = useQueryState("category");
const [subcategory, setSubcategory] = useQueryState("subcategory");
```

## Route Protection

### Authentication Guards

#### Protected Routes

- Admin routes require authentication
- User profile pages require login
- Checkout process requires authentication

#### Redirect Logic

```typescript
// Check authentication status
if (!user) {
  redirect("/sign-in");
}

// Check admin permissions
if (!user.isAdmin) {
  redirect("/");
}
```

### SEO and Metadata

#### Dynamic Metadata

```typescript
export async function generateMetadata({ params }: Props) {
  const category = await getCategory(params.category);

  return {
    title: `${category.name} - Harvestly`,
    description: `Browse ${category.name} products on Harvestly`,
  };
}
```

#### Static Metadata

```typescript
export const metadata: Metadata = {
  title: "Harvestly - Farm Fresh Marketplace",
  description: "Connect with farmers and sellers for fresh produce",
};
```

## Performance Optimizations

### Route Prefetching

```typescript
// Prefetch critical routes
<Link href="/about" prefetch>
  About
</Link>

// Prefetch data for routes
void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());
```

### Dynamic Imports

```typescript
// Lazy load non-critical components
const ProductModal = dynamic(() => import('./ProductModal'), {
  loading: () => <ProductModalSkeleton />,
});
```

### Route Caching

- Static routes are cached at build time
- Dynamic routes use ISR (Incremental Static Regeneration)
- API routes use appropriate caching strategies

## Error Handling

### Error Boundaries

```typescript
// Global error boundary
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

### Not Found Pages

- Custom 404 pages for missing routes
- Category not found handling
- Product not found handling

### Loading States

- Suspense boundaries for route transitions
- Skeleton loading for dynamic content
- Progressive loading for large datasets

## Development Workflow

### Route Development

1. Create route directory structure
2. Add page component
3. Implement layout if needed
4. Add metadata and SEO
5. Test navigation and functionality

### Route Testing

- Test all route combinations
- Verify dynamic route parameters
- Check error handling
- Validate SEO metadata

### Route Optimization

- Implement appropriate caching
- Add loading states
- Optimize bundle sizes
- Monitor performance metrics

This routing structure provides a scalable, maintainable foundation for the Harvestly platform with clear navigation patterns and optimal performance characteristics.
