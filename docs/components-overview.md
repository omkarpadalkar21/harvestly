# Components Overview

## Core Layout Components

### Root Layout (`src/app/(app)/layout.tsx`)

**Purpose**: The main application wrapper that provides global context and styling.

**Key Features**:

- **Font Configuration**: Uses DM Sans Google Font for consistent typography
- **tRPC Provider**: Wraps the app with TRPCReactProvider for type-safe API calls
- **URL State Management**: Integrates NuqsAdapter for managing URL state
- **Notifications**: Includes Toaster component for user feedback
- **SEO Metadata**: Defines app title, description, and favicon

**Dependencies**:

```typescript
import { TRPCReactProvider } from "@/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
```

### Home Layout (`src/app/(app)/(home)/layout.tsx`)

**Purpose**: Layout wrapper for home pages with navigation and search functionality.

**Key Features**:

- **Data Prefetching**: Prefetches categories data using tRPC for optimal performance
- **Navigation**: Includes Navbar and Footer components
- **Search Integration**: Implements SearchFilters with Suspense boundary
- **SSR Hydration**: Uses HydrationBoundary for efficient server-side rendering

**Performance Optimizations**:

```typescript
// Prefetch categories data
void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());

// Suspense boundary for search filters
<Suspense fallback={<SearchFiltersLoading />}>
  <SearchFilters />
</Suspense>
```

## Authentication Components

### Sign-In Page (`src/app/(app)/(auth)/sign-in/page.tsx`)

**Purpose**: User authentication interface for existing users.

**Features**:

- Email and password authentication
- Form validation and error handling
- Integration with Payload Auth
- Responsive design for mobile and desktop

### Sign-Up Page (`src/app/(app)/(auth)/sign-up/page.tsx`)

**Purpose**: New user registration interface.

**Features**:

- User registration form
- Email verification process
- Password strength validation
- Terms and conditions acceptance

## Navigation Components

### Navbar (`src/modules/home/ui/components/Navbar.tsx`)

**Purpose**: Main navigation bar with search, user menu, and branding.

**Features**:

- **Logo and Branding**: Harvestly branding with navigation links
- **Search Integration**: Quick access to product search
- **User Menu**: Authentication status and user actions
- **Mobile Responsive**: Collapsible menu for mobile devices
- **Category Navigation**: Quick access to product categories

### Footer (`src/modules/home/ui/components/Footer.tsx`)

**Purpose**: Site footer with links, information, and social media.

**Features**:

- **Company Information**: About Harvestly and mission
- **Quick Links**: Navigation to key pages
- **Contact Information**: Support and contact details
- **Social Media**: Links to social platforms
- **Legal Links**: Privacy policy, terms of service

## Search and Filtering Components

### SearchFilters (`src/modules/home/ui/components/search-filters/index.tsx`)

**Purpose**: Main search interface with category and subcategory filtering.

**Features**:

- **Category Selection**: Dropdown for main product categories
- **Subcategory Filtering**: Dynamic subcategory options based on category
- **Search Input**: Product name and description search
- **Breadcrumb Navigation**: Clear navigation path
- **Mobile Responsive**: Adaptive design for different screen sizes

**Key Components**:

- `SearchInput`: Text-based product search
- `CategoryDropDown`: Category selection interface
- `SubcategoryMenu`: Subcategory filtering options
- `BreadcrumbNavigation`: Navigation path display

### SearchFiltersLoading (`src/modules/home/ui/components/search-filters/loading.tsx`)

**Purpose**: Loading state component for search filters.

**Features**:

- Skeleton loading animation
- Maintains layout structure during loading
- Smooth transition to actual content

## Product Display Components

### Product List (`src/modules/products/ui/components/product-list.tsx`)

**Purpose**: Displays products in a grid or list format.

**Features**:

- **Grid Layout**: Responsive product grid
- **Product Cards**: Individual product display with images, prices, and details
- **Pagination**: Load more or paginated results
- **Filtering**: Integration with search and category filters
- **Loading States**: Skeleton loading for better UX

### Product Card (`src/modules/products/ui/components/product-card.tsx`)

**Purpose**: Individual product display component.

**Features**:

- **Product Image**: High-quality product photos
- **Product Information**: Name, description, price, and category
- **Perishability Indicator**: Visual indicator for product shelf life
- **Add to Cart**: Quick purchase functionality
- **Hover Effects**: Interactive design elements

## Filter Components

### Price Filter (`src/modules/products/ui/components/price-filter.tsx`)

**Purpose**: Price range filtering for products.

**Features**:

- **Range Slider**: Interactive price range selection
- **Currency Formatting**: Indian Rupee (INR) formatting
- **Real-time Updates**: Instant filter application
- **Accessibility**: Keyboard navigation and screen reader support

**Currency Formatting**:

```typescript
return new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format(numberValue);
```

### Tags Filter (`src/modules/products/ui/components/tags-filter.tsx`)

**Purpose**: Tag-based product filtering.

**Features**:

- **Infinite Scrolling**: Load more tags as needed
- **Checkbox Selection**: Multiple tag selection
- **Loading States**: Smooth loading animations
- **Search Integration**: Tag search functionality

## Admin Components

### Payload Admin Layout (`src/app/(payload)/layout.tsx`)

**Purpose**: Admin interface layout for content management.

**Features**:

- **Auto-generated**: Created by Payload CMS
- **Server Functions**: Handles admin operations
- **Custom Styling**: Integrates with custom admin styles
- **Import Map**: Custom component imports for admin

### Admin Import Map (`src/app/(payload)/admin/importMap.js`)

**Purpose**: Maps custom components for Payload admin interface.

**Features**:

- **Custom Fields**: Custom field components for admin
- **Custom Views**: Custom admin views and layouts
- **Component Registration**: Registers custom components with Payload

## API Components

### tRPC API Handler (`src/app/api/trpc/[trpc]/route.ts`)

**Purpose**: Handles all tRPC API requests.

**Features**:

- **Type Safety**: End-to-end type safety for API calls
- **Error Handling**: Comprehensive error handling and validation
- **CORS Support**: Proper cross-origin request handling
- **Performance**: Optimized request processing

## Utility Components

### Loading Components

**SearchFiltersLoading**: Skeleton loading for search interface
**ProductListLoading**: Loading state for product lists
**CategoryLoading**: Loading state for category data

### Error Components

**Error Boundaries**: Graceful error handling
**404 Pages**: Custom not found pages
**Error Messages**: User-friendly error displays

## Styling and Theming

### Global Styles (`src/app/(app)/globals.css`)

**Purpose**: Global CSS styles and Tailwind CSS configuration.

**Features**:

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Variables**: CSS custom properties for theming
- **Base Styles**: Reset and base element styling
- **Component Styles**: Global component styles

### Custom Admin Styles (`src/app/(payload)/custom.scss`)

**Purpose**: Custom styling for Payload admin interface.

**Features**:

- **Admin Theming**: Custom admin interface styling
- **Brand Integration**: Harvestly branding in admin
- **Responsive Design**: Mobile-friendly admin interface

## Performance Considerations

### Data Fetching

- **Prefetching**: Critical data prefetched at layout level
- **Caching**: React Query caching for optimal performance
- **Suspense**: Loading states for better user experience

### Code Splitting

- **Route Groups**: Logical separation for code splitting
- **Dynamic Imports**: Lazy loading of non-critical components
- **Bundle Optimization**: Efficient bundle sizes

### SEO and Accessibility

- **Semantic HTML**: Proper HTML structure for accessibility
- **Meta Tags**: Comprehensive SEO metadata
- **Alt Text**: Image alt text for screen readers
- **Keyboard Navigation**: Full keyboard accessibility

This component architecture provides a robust, scalable foundation for the Harvestly platform with clear separation of concerns and optimal performance characteristics.
