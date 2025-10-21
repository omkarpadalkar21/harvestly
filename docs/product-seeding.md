# Product Seeding Script

This script creates a complete setup for the "omkar-farms" user with products, categories, tags, and media.

## What it creates:

### User Account
- **Username**: omkar-farms
- **Email**: omkar@gmail.com  
- **Password**: 12345
- **Role**: user

### Tenant
- **Name**: Omkar Farms
- **Subdomain**: omkar-farms
- **Stripe Account**: Automatically created and linked

### Products (8 items)
1. **Fresh Tomatoes** - ₹80/kg (Vegetables > Fruit Vegetables)
2. **Green Grapes** - ₹120/500g (Fruits > Berries)
3. **Fresh Spinach** - ₹40/250g (Vegetables > Leafy Greens)
4. **Red Onions** - ₹60/kg (Vegetables > Alliums)
5. **Green Chilies** - ₹30/100g (Herbs & Spices > Fresh Herbs)
6. **Farm Fresh Eggs** - ₹8/pc (Dairy & Eggs > Farm Fresh Eggs)
7. **Red Chili Powder** - ₹45/100g (Herbs & Spices > Dried Spices)
8. **Mixed Vegetables** - ₹70/500g (Vegetables > Root Vegetables)

### Tags
- organic, fresh, local, sweet, vitamin-c, nutritious, iron-rich, sharp, cooking, spicy, hot, protein, free-range, powder, mixed, seasonal

### Media
- All product images are automatically uploaded from the `/media` folder
- Images are linked to their respective products

## Usage

```bash
# Run the product seeding script
npm run seed:products
```

## Prerequisites

1. Make sure you have run the main seed script first to create categories:
   ```bash
   npm run seed
   ```

2. Ensure you have the required media files in the `/media` folder:
   - Roma_or_Bangalore_Tomatoes_(Indian_hybrid).jpg
   - grapes-1-500x500.png
   - Spinach-Edited.jpg
   - Onion-72ea178.jpg
   - hari-mirch-ke-fayde-in-hindi-2.jpg
   - white-poultry-egg-500x500.jpg
   - lal-mirch-powder.jpeg
   - shutterstock_206261176.jpg

## Features

- **Automatic Stripe Integration**: Creates a Stripe Express account for the tenant
- **Smart Category Mapping**: Automatically maps products to existing categories and subcategories
- **Media Upload**: Uploads and links product images
- **Tag Management**: Creates and assigns relevant tags to products
- **Perishability Logic**: Automatically sets refund policies based on perishability levels
- **Error Handling**: Comprehensive error handling and logging

## Product Structure

Each product includes:
- Name and description
- Price in ₹ (Indian Rupees)
- Quantity with unit (kg, g, pc, etc.)
- Category and subcategory relationships
- Tags for filtering and search
- Product image
- Perishability level (high/medium/low/none)
- Automatic refund policy based on perishability

## Notes

- The script will create a new Stripe account for each run
- If the user already exists, the script will fail (intentionally)
- All products are created under the omkar-farms tenant
- Refund policies are automatically set based on perishability:
  - High perishable: 1-day refund
  - Medium perishable: 3-day refund  
  - Low perishable: 7-day refund
  - Non-perishable: 30-day refund
