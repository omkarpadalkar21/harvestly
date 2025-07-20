import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import {getPayload} from "payload";
import config from "@payload-config";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const categories = [
  {
    name: "Vegetables",
    color: "#16a34a",
    slug: "vegetables",
    subcategories: [
      { name: "Leafy Greens", slug: "leafy-greens" },
      { name: "Root Vegetables", slug: "root-vegetables" },
      { name: "Fruit Vegetables", slug: "fruit-vegetables" },
      { name: "Gourds & Squashes", slug: "gourds" },
      { name: "Alliums (Onions & Garlic)", slug: "alliums" },
    ],
  },
  {
    name: "Fruits",
    color: "#d97706",
    slug: "fruits",
    subcategories: [
      { name: "Citrus", slug: "citrus" },
      { name: "Berries", slug: "berries" },
      { name: "Stone Fruits", slug: "stone-fruits" },
      { name: "Tropical Fruits", slug: "tropical" },
      { name: "Pomes (Apples & Pears)", slug: "pomes" },
    ],
  },
  {
    name: "Grains & Pulses",
    color: "#ca8a04",
    slug: "grains-pulses",
    subcategories: [
      { name: "Rice & Millets", slug: "rice-millets" },
      { name: "Wheat & Maize", slug: "wheat-maize" },
      { name: "Lentils (Dal)", slug: "lentils" },
      { name: "Beans & Peas", slug: "beans-peas" },
      { name: "Flours & Meal", slug: "flours" },
    ],
  },
  {
    name: "Herbs & Spices",
    color: "#10b981",
    slug: "herbs-spices",
    subcategories: [
      { name: "Fresh Herbs", slug: "fresh-herbs" },
      { name: "Dried Spices", slug: "dried-spices" },
      { name: "Seeds & Seasonings", slug: "seeds" },
      { name: "Masalas", slug: "masalas" },
    ],
  },
  {
    name: "Dairy & Eggs",
    color: "#60a5fa",
    slug: "dairy-eggs",
    subcategories: [
      { name: "Milk & Paneer", slug: "milk-paneer" },
      { name: "Yogurt & Curd", slug: "yogurt-curd" },
      { name: "Ghee & Butter", slug: "ghee-butter" },
      { name: "Farm Fresh Eggs", slug: "eggs" },
    ],
  },
  {
    name: "Organic Specials",
    color: "#65a30d",
    slug: "organic",
    subcategories: [
      { name: "Organic Vegetables", slug: "organic-vegetables" },
      { name: "Organic Fruits", slug: "organic-fruits" },
      { name: "Organic Grains", slug: "organic-grains" },
      { name: "Organic Dairy", slug: "organic-dairy-eggs" },
    ],
  },
];

const seed = async () => {
  const payload = await getPayload({ config });

  await payload.delete({
    collection: "categories",
    where: {}, // deletes all documents
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));

  for (const category of categories) {
    const parentCategory = await payload.create({
      collection: "categories",
      data: {
        name: category.name,
        slug: category.slug,
        colour: category.color,
        parent: null,
      },
    });

    for (const subcategory of category.subcategories || []) {
      const subCategories = await payload.create({
        collection: "categories",
        data: {
          name: subcategory.name,
          slug: subcategory.slug,
          parent: parentCategory.id,
        },
      });
    }
  }
};

try {
  await seed();
  console.log("Seeding completed successfully.");
  process.exit(0);
}catch (error) {
  console.error(error);
  process.exit(1);
}