# Harvestly Documentation

Welcome to the Harvestly documentation! This comprehensive guide covers the architecture, components, and development patterns used in the Harvestly B2C platform.

## 📚 Documentation Index

### 🏗️ Architecture & Structure

- **[App Structure](./app-structure.md)** - Complete overview of the `src/app` directory structure
- **[Components Overview](./components-overview.md)** - Detailed documentation of all key components
- **[Routing Guide](./routing-guide.md)** - Next.js App Router patterns and navigation

### 🚀 Quick Start

1. **Understanding the Structure**: Start with [App Structure](./app-structure.md) to understand the overall architecture
2. **Component Development**: Use [Components Overview](./components-overview.md) for building new features
3. **Routing Implementation**: Follow [Routing Guide](./routing-guide.md) for navigation patterns

## 🎯 Key Concepts

### Route Groups

Harvestly uses Next.js route groups to organize code logically:

- `(app)` - Main application (user-facing)
- `(payload)` - Admin interface (content management)

### Component Architecture

- **Layout Components**: Root and page-specific layouts
- **UI Components**: Reusable interface elements
- **Feature Components**: Business logic components
- **Admin Components**: Content management interface

### Data Flow

- **tRPC**: Type-safe API communication
- **React Query**: Server state management
- **Payload CMS**: Content management system
- **MongoDB**: Database storage

## 🛠️ Development Guidelines

### File Organization

```
src/
├── app/                    # Next.js App Router
├── components/             # Shared UI components
├── modules/                # Feature-based modules
├── collections/            # Payload CMS collections
├── trpc/                   # tRPC configuration
└── lib/                    # Utility functions
```

### Coding Standards

- **TypeScript**: Full type safety throughout
- **Component Co-location**: Components near their usage
- **Feature Modules**: Organized by business domain
- **Consistent Naming**: Clear, descriptive names

### Performance Best Practices

- **Route Prefetching**: Critical data prefetched at layout level
- **Suspense Boundaries**: Loading states for async components
- **Code Splitting**: Efficient bundle optimization
- **Caching**: React Query for optimal data management

## 🔧 Technology Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library

### Backend

- **Payload CMS**: Headless CMS
- **tRPC**: Type-safe API layer
- **MongoDB**: Database
- **React Query**: Server state management

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

## 📖 Documentation Structure

### App Structure (`app-structure.md`)

- Directory organization
- Route group explanations
- File purposes and responsibilities
- Integration patterns

### Components Overview (`components-overview.md`)

- Component categorization
- Feature descriptions
- Usage examples
- Performance considerations

### Routing Guide (`routing-guide.md`)

- Route patterns
- Dynamic routing
- Navigation implementation
- SEO and metadata

## 🎨 Design System

### UI Components

- **shadcn/ui**: Pre-built component library
- **Custom Components**: Platform-specific components
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliance

### Styling

- **Tailwind CSS**: Utility classes
- **CSS Variables**: Theme customization
- **Component Styles**: Scoped styling
- **Global Styles**: Base styles and resets

## 🔒 Security & Authentication

### Authentication Flow

- **Payload Auth**: User authentication
- **Session Management**: Secure session handling
- **Route Protection**: Protected routes
- **Admin Access**: Role-based permissions

### API Security

- **tRPC**: Type-safe API calls
- **Input Validation**: Server-side validation
- **CORS**: Cross-origin request handling
- **Error Handling**: Secure error responses

## 🚀 Deployment & Performance

### Build Optimization

- **Code Splitting**: Efficient bundle sizes
- **Image Optimization**: Next.js image optimization
- **Static Generation**: Pre-rendered pages
- **Incremental Static Regeneration**: Dynamic content

### Monitoring

- **Performance Metrics**: Core Web Vitals
- **Error Tracking**: Error monitoring
- **Analytics**: User behavior tracking
- **SEO**: Search engine optimization

## 🤝 Contributing

### Development Workflow

1. **Feature Planning**: Understand requirements
2. **Component Development**: Build reusable components
3. **Integration**: Connect with existing systems
4. **Testing**: Verify functionality
5. **Documentation**: Update relevant docs

### Code Review

- **Type Safety**: Ensure TypeScript compliance
- **Performance**: Check for optimization opportunities
- **Accessibility**: Verify WCAG compliance
- **Documentation**: Update component docs

## 📞 Support

### Getting Help

- **Documentation**: Check relevant docs first
- **Code Examples**: Review existing implementations
- **Architecture**: Understand the overall structure
- **Best Practices**: Follow established patterns

### Common Issues

- **Routing**: Check route group organization
- **Components**: Verify component structure
- **Data Flow**: Ensure proper tRPC usage
- **Styling**: Follow Tailwind patterns

---

This documentation provides a comprehensive guide to developing and maintaining the Harvestly platform. For specific questions or clarifications, refer to the relevant documentation sections or consult the development team.
