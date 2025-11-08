import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables before importing modules that depend on them
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import config from "@payload-config";
import { getPayload } from "payload";

// Sample products data
const products = [
  // Vegetables - Leafy Greens
  {
    name: "Fresh Spinach",
    description:
      "Nutrient-rich leafy green spinach, perfect for salads, smoothies, and cooking.",
    price: 40,
    quantity: { amount: 250, unit: "g" },
    category: "Vegetables",
    subcategory: "Leafy Greens",
    tags: ["organic", "nutritious", "iron-rich"],
    image: "Spinach-Edited.jpg",
    perishability: "high",
  },
  {
    name: "Coriander Leaves",
    description:
      "Fresh coriander leaves perfect for garnishing and adding flavor to Indian dishes.",
    price: 20,
    quantity: { amount: 100, unit: "g" },
    category: "Vegetables",
    subcategory: "Leafy Greens",
    tags: ["fresh", "garnish", "aromatic"],
    image: "spanich-500x500.png",
    perishability: "high",
  },
  {
    name: "Mint Leaves",
    description: "Fresh mint leaves for chutneys, teas, and refreshing drinks.",
    price: 25,
    quantity: { amount: 100, unit: "g" },
    category: "Vegetables",
    subcategory: "Leafy Greens",
    tags: ["fresh", "aromatic", "cooling"],
    image: "spanich-500x500.png",
    perishability: "high",
  },
  {
    name: "Fenugreek Leaves",
    description: "Fresh methi leaves perfect for Indian curries and parathas.",
    price: 30,
    quantity: { amount: 200, unit: "g" },
    category: "Vegetables",
    subcategory: "Leafy Greens",
    tags: ["fresh", "bitter", "nutritious"],
    image: "spanich-500x500.png",
    perishability: "high",
  },
  {
    name: "Curry Leaves",
    description:
      "Aromatic curry leaves essential for South Indian cooking and tempering.",
    price: 15,
    quantity: { amount: 50, unit: "g" },
    category: "Vegetables",
    subcategory: "Leafy Greens",
    tags: ["aromatic", "tempering", "south-indian"],
    image: "spanich-500x500.png",
    perishability: "medium",
  },

  // Vegetables - Root Vegetables
  {
    name: "Carrots",
    description:
      "Sweet and crunchy carrots, rich in beta-carotene and perfect for salads.",
    price: 50,
    quantity: { amount: 1, unit: "kg" },
    category: "Vegetables",
    subcategory: "Root Vegetables",
    tags: ["sweet", "crunchy", "vitamin-a"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },
  {
    name: "Potatoes",
    description:
      "Fresh potatoes perfect for curries, fries, and traditional Indian dishes.",
    price: 35,
    quantity: { amount: 1, unit: "kg" },
    category: "Vegetables",
    subcategory: "Root Vegetables",
    tags: ["starchy", "versatile", "local"],
    image: "shutterstock_206261176.jpg",
    perishability: "low",
  },
  {
    name: "Sweet Potatoes",
    description:
      "Nutritious sweet potatoes perfect for roasting and traditional Indian sweets.",
    price: 60,
    quantity: { amount: 1, unit: "kg" },
    category: "Vegetables",
    subcategory: "Root Vegetables",
    tags: ["sweet", "nutritious", "fiber-rich"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },
  {
    name: "Beetroot",
    description:
      "Fresh beetroot perfect for salads, juices, and traditional Indian pickles.",
    price: 40,
    quantity: { amount: 500, unit: "g" },
    category: "Vegetables",
    subcategory: "Root Vegetables",
    tags: ["nutritious", "colorful", "iron-rich"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },
  {
    name: "Radish",
    description:
      "Crisp white radish perfect for salads and traditional Indian dishes.",
    price: 30,
    quantity: { amount: 500, unit: "g" },
    category: "Vegetables",
    subcategory: "Root Vegetables",
    tags: ["crisp", "mild", "cooling"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },

  // Vegetables - Fruit Vegetables
  {
    name: "Fresh Tomatoes",
    description:
      "Juicy, ripe tomatoes perfect for salads, cooking, and sauces. Grown organically without pesticides.",
    price: 80,
    quantity: { amount: 1, unit: "kg" },
    category: "Vegetables",
    subcategory: "Fruit Vegetables",
    tags: ["organic", "fresh", "local"],
    image: "Roma_or_Bangalore_Tomatoes_(Indian_hybrid).jpg",
    perishability: "high",
  },
  {
    name: "Cucumber",
    description:
      "Fresh cucumber perfect for salads, raita, and refreshing summer dishes.",
    price: 25,
    quantity: { amount: 500, unit: "g" },
    category: "Vegetables",
    subcategory: "Fruit Vegetables",
    tags: ["cooling", "hydrating", "fresh"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },
  {
    name: "Brinjal (Eggplant)",
    description:
      "Fresh brinjal perfect for curries, bharta, and traditional Indian dishes.",
    price: 40,
    quantity: { amount: 1, unit: "kg" },
    category: "Vegetables",
    subcategory: "Fruit Vegetables",
    tags: ["versatile", "purple", "cooking"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },
  {
    name: "Okra (Ladyfinger)",
    description:
      "Fresh okra perfect for bhindi masala and traditional Indian curries.",
    price: 50,
    quantity: { amount: 500, unit: "g" },
    category: "Vegetables",
    subcategory: "Fruit Vegetables",
    tags: ["slimy", "nutritious", "traditional"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },
  {
    name: "Capsicum (Bell Pepper)",
    description:
      "Colorful bell peppers perfect for stir-fries, salads, and stuffed dishes.",
    price: 80,
    quantity: { amount: 500, unit: "g" },
    category: "Vegetables",
    subcategory: "Fruit Vegetables",
    tags: ["colorful", "crunchy", "vitamin-c"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },

  // Vegetables - Gourds & Squashes
  {
    name: "Bottle Gourd (Lauki)",
    description:
      "Fresh bottle gourd perfect for traditional Indian curries and healthy cooking.",
    price: 30,
    quantity: { amount: 1, unit: "kg" },
    category: "Vegetables",
    subcategory: "Gourds & Squashes",
    tags: ["light", "digestive", "traditional"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },
  {
    name: "Ridge Gourd (Turai)",
    description:
      "Fresh ridge gourd perfect for South Indian curries and traditional dishes.",
    price: 35,
    quantity: { amount: 500, unit: "g" },
    category: "Vegetables",
    subcategory: "Gourds & Squashes",
    tags: ["fibrous", "nutritious", "south-indian"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },
  {
    name: "Bitter Gourd (Karela)",
    description:
      "Fresh bitter gourd known for its health benefits and traditional medicinal properties.",
    price: 40,
    quantity: { amount: 500, unit: "g" },
    category: "Vegetables",
    subcategory: "Gourds & Squashes",
    tags: ["bitter", "medicinal", "healthy"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },
  {
    name: "Pumpkin",
    description:
      "Sweet pumpkin perfect for curries, sweets, and traditional Indian dishes.",
    price: 25,
    quantity: { amount: 1, unit: "kg" },
    category: "Vegetables",
    subcategory: "Gourds & Squashes",
    tags: ["sweet", "nutritious", "versatile"],
    image: "shutterstock_206261176.jpg",
    perishability: "low",
  },

  // Vegetables - Alliums
  {
    name: "Red Onions",
    description:
      "Sharp and flavorful red onions, essential for Indian cooking and salads.",
    price: 60,
    quantity: { amount: 1, unit: "kg" },
    category: "Vegetables",
    subcategory: "Alliums (Onions & Garlic)",
    tags: ["sharp", "cooking", "local"],
    image: "Onion-72ea178.jpg",
    perishability: "low",
  },
  {
    name: "White Onions",
    description: "Mild white onions perfect for salads and light cooking.",
    price: 55,
    quantity: { amount: 1, unit: "kg" },
    category: "Vegetables",
    subcategory: "Alliums (Onions & Garlic)",
    tags: ["mild", "salad", "cooking"],
    image: "Onion-72ea178.jpg",
    perishability: "low",
  },
  {
    name: "Garlic",
    description:
      "Fresh garlic cloves essential for Indian cooking and traditional medicine.",
    price: 200,
    quantity: { amount: 250, unit: "g" },
    category: "Vegetables",
    subcategory: "Alliums (Onions & Garlic)",
    tags: ["aromatic", "medicinal", "cooking"],
    image: "Onion-72ea178.jpg",
    perishability: "low",
  },
  {
    name: "Spring Onions",
    description:
      "Fresh spring onions perfect for garnishing and Chinese-style cooking.",
    price: 30,
    quantity: { amount: 100, unit: "g" },
    category: "Vegetables",
    subcategory: "Alliums (Onions & Garlic)",
    tags: ["fresh", "garnish", "mild"],
    image: "Onion-72ea178.jpg",
    perishability: "high",
  },

  // Fruits - Citrus
  {
    name: "Oranges",
    description:
      "Sweet and juicy oranges rich in vitamin C, perfect for fresh juice.",
    price: 60,
    quantity: { amount: 1, unit: "kg" },
    category: "Fruits",
    subcategory: "Citrus",
    tags: ["sweet", "vitamin-c", "juicy"],
    image:
      "photo-1576045057995-568f588f82fbq=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.jpg",
    perishability: "medium",
  },
  {
    name: "Lemons",
    description:
      "Fresh lemons perfect for cooking, drinks, and traditional remedies.",
    price: 40,
    quantity: { amount: 500, unit: "g" },
    category: "Fruits",
    subcategory: "Citrus",
    tags: ["sour", "vitamin-c", "versatile"],
    image:
      "photo-1576045057995-568f588f82fbq=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.jpg",
    perishability: "medium",
  },
  {
    name: "Sweet Lime (Mosambi)",
    description:
      "Sweet and refreshing mosambi perfect for fresh juice and summer drinks.",
    price: 50,
    quantity: { amount: 1, unit: "kg" },
    category: "Fruits",
    subcategory: "Citrus",
    tags: ["sweet", "refreshing", "summer"],
    image:
      "photo-1576045057995-568f588f82fbq=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.jpg",
    perishability: "medium",
  },

  // Fruits - Berries
  {
    name: "Green Grapes",
    description:
      "Sweet and crisp green grapes, perfect for snacking or making fresh juice.",
    price: 120,
    quantity: { amount: 500, unit: "g" },
    category: "Fruits",
    subcategory: "Berries",
    tags: ["sweet", "fresh", "vitamin-c"],
    image: "grapes-1-500x500.png",
    perishability: "medium",
  },
  {
    name: "Black Grapes",
    description:
      "Sweet black grapes rich in antioxidants, perfect for snacking.",
    price: 130,
    quantity: { amount: 500, unit: "g" },
    category: "Fruits",
    subcategory: "Berries",
    tags: ["sweet", "antioxidants", "dark"],
    image: "grapes-1-500x500.png",
    perishability: "medium",
  },
  {
    name: "Strawberries",
    description:
      "Fresh strawberries perfect for desserts, smoothies, and snacking.",
    price: 200,
    quantity: { amount: 250, unit: "g" },
    category: "Fruits",
    subcategory: "Berries",
    tags: ["sweet", "delicate", "dessert"],
    image:
      "photo-1603833665858-e61d17a86224q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.jpg",
    perishability: "high",
  },

  // Fruits - Stone Fruits
  {
    name: "Mangoes",
    description:
      "Sweet and juicy mangoes, the king of fruits, perfect for summer.",
    price: 100,
    quantity: { amount: 1, unit: "kg" },
    category: "Fruits",
    subcategory: "Stone Fruits",
    tags: ["sweet", "summer", "king-of-fruits"],
    image:
      "photo-1608554208766-8198d5536b46q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "medium",
  },
  {
    name: "Peaches",
    description:
      "Sweet and juicy peaches perfect for desserts and fresh eating.",
    price: 150,
    quantity: { amount: 500, unit: "g" },
    category: "Fruits",
    subcategory: "Stone Fruits",
    tags: ["sweet", "juicy", "dessert"],
    image:
      "photo-1608554208766-8198d5536b46q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "high",
  },
  {
    name: "Plums",
    description:
      "Sweet and tart plums perfect for snacking and making preserves.",
    price: 120,
    quantity: { amount: 500, unit: "g" },
    category: "Fruits",
    subcategory: "Stone Fruits",
    tags: ["sweet", "tart", "preserves"],
    image:
      "photo-1608554208766-8198d5536b46q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "medium",
  },

  // Fruits - Tropical Fruits
  {
    name: "Bananas",
    description:
      "Sweet bananas rich in potassium, perfect for snacking and smoothies.",
    price: 40,
    quantity: { amount: 1, unit: "kg" },
    category: "Fruits",
    subcategory: "Tropical Fruits",
    tags: ["sweet", "potassium", "energy"],
    image:
      "photo-1608554208766-8198d5536b46q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "medium",
  },
  {
    name: "Papaya",
    description:
      "Sweet papaya rich in enzymes and vitamins, perfect for breakfast.",
    price: 50,
    quantity: { amount: 1, unit: "kg" },
    category: "Fruits",
    subcategory: "Tropical Fruits",
    tags: ["sweet", "enzymes", "breakfast"],
    image:
      "photo-1608554208766-8198d5536b46q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "medium",
  },
  {
    name: "Pineapple",
    description:
      "Sweet and tangy pineapple perfect for desserts and tropical drinks.",
    price: 80,
    quantity: { amount: 1, unit: "kg" },
    category: "Fruits",
    subcategory: "Tropical Fruits",
    tags: ["sweet", "tangy", "tropical"],
    image:
      "photo-1608554208766-8198d5536b46q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "medium",
  },

  // Fruits - Pomes
  {
    name: "Apples",
    description:
      "Crisp and sweet apples perfect for snacking and traditional Indian desserts.",
    price: 120,
    quantity: { amount: 1, unit: "kg" },
    category: "Fruits",
    subcategory: "Pomes (Apples & Pears)",
    tags: ["crisp", "sweet", "fiber"],
    image:
      "photo-1608554208766-8198d5536b46q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "low",
  },
  {
    name: "Pears",
    description: "Sweet and juicy pears perfect for desserts and fresh eating.",
    price: 100,
    quantity: { amount: 1, unit: "kg" },
    category: "Fruits",
    subcategory: "Pomes (Apples & Pears)",
    tags: ["sweet", "juicy", "dessert"],
    image:
      "photo-1608554208766-8198d5536b46q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "medium",
  },

  // Herbs & Spices - Fresh Herbs
  {
    name: "Green Chilies",
    description:
      "Spicy green chilies perfect for adding heat to your dishes. Fresh from our farm.",
    price: 30,
    quantity: { amount: 100, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Fresh Herbs",
    tags: ["spicy", "fresh", "hot"],
    image: "hari-mirch-ke-fayde-in-hindi-2.jpg",
    perishability: "medium",
  },
  {
    name: "Red Chilies",
    description:
      "Dried red chilies perfect for tempering and adding heat to Indian dishes.",
    price: 200,
    quantity: { amount: 100, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Fresh Herbs",
    tags: ["spicy", "dried", "tempering"],
    image: "hari-mirch-ke-fayde-in-hindi-2.jpg",
    perishability: "none",
  },
  {
    name: "Ginger",
    description:
      "Fresh ginger root perfect for Indian cooking and traditional medicine.",
    price: 80,
    quantity: { amount: 250, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Fresh Herbs",
    tags: ["aromatic", "medicinal", "warming"],
    image: "hari-mirch-ke-fayde-in-hindi-2.jpg",
    perishability: "medium",
  },
  {
    name: "Turmeric Root",
    description:
      "Fresh turmeric root known for its medicinal properties and golden color.",
    price: 100,
    quantity: { amount: 250, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Fresh Herbs",
    tags: ["medicinal", "golden", "anti-inflammatory"],
    image: "hari-mirch-ke-fayde-in-hindi-2.jpg",
    perishability: "medium",
  },

  // Herbs & Spices - Dried Spices
  {
    name: "Red Chili Powder",
    description:
      "Finely ground red chili powder with perfect heat level for Indian cuisine.",
    price: 45,
    quantity: { amount: 100, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Dried Spices",
    tags: ["spicy", "powder", "cooking"],
    image: "lal-mirch-powder.jpeg",
    perishability: "none",
  },
  {
    name: "Turmeric Powder",
    description:
      "Pure turmeric powder essential for Indian cooking and its golden color.",
    price: 60,
    quantity: { amount: 100, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Dried Spices",
    tags: ["golden", "medicinal", "essential"],
    image: "lal-mirch-powder.jpeg",
    perishability: "none",
  },
  {
    name: "Cumin Powder",
    description:
      "Aromatic cumin powder perfect for Indian curries and tempering.",
    price: 80,
    quantity: { amount: 100, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Dried Spices",
    tags: ["aromatic", "tempering", "curry"],
    image: "lal-mirch-powder.jpeg",
    perishability: "none",
  },
  {
    name: "Coriander Powder",
    description:
      "Fresh coriander powder essential for Indian cooking and marinades.",
    price: 70,
    quantity: { amount: 100, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Dried Spices",
    tags: ["aromatic", "marinade", "essential"],
    image: "lal-mirch-powder.jpeg",
    perishability: "none",
  },
  {
    name: "Garam Masala",
    description:
      "Traditional garam masala blend perfect for Indian curries and biryanis.",
    price: 120,
    quantity: { amount: 100, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Dried Spices",
    tags: ["traditional", "blend", "aromatic"],
    image: "lal-mirch-powder.jpeg",
    perishability: "none",
  },

  // Herbs & Spices - Seeds & Seasonings
  {
    name: "Cumin Seeds",
    description:
      "Aromatic cumin seeds perfect for tempering and Indian cooking.",
    price: 100,
    quantity: { amount: 100, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Seeds & Seasonings",
    tags: ["aromatic", "tempering", "seeds"],
    image: "lal-mirch-powder.jpeg",
    perishability: "none",
  },
  {
    name: "Mustard Seeds",
    description:
      "Black mustard seeds essential for South Indian tempering and pickles.",
    price: 80,
    quantity: { amount: 100, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Seeds & Seasonings",
    tags: ["tempering", "south-indian", "pickles"],
    image: "lal-mirch-powder.jpeg",
    perishability: "none",
  },
  {
    name: "Fenugreek Seeds",
    description:
      "Bitter fenugreek seeds known for their health benefits and medicinal properties.",
    price: 90,
    quantity: { amount: 100, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Seeds & Seasonings",
    tags: ["bitter", "medicinal", "healthy"],
    image: "lal-mirch-powder.jpeg",
    perishability: "none",
  },
  {
    name: "Sesame Seeds",
    description:
      "Nutty sesame seeds perfect for garnishing and traditional Indian sweets.",
    price: 150,
    quantity: { amount: 100, unit: "g" },
    category: "Herbs & Spices",
    subcategory: "Seeds & Seasonings",
    tags: ["nutty", "garnish", "sweets"],
    image: "lal-mirch-powder.jpeg",
    perishability: "none",
  },

  // Dairy & Eggs
  {
    name: "Farm Fresh Eggs",
    description:
      "Fresh eggs from free-range chickens. Rich in protein and perfect for breakfast.",
    price: 8,
    quantity: { amount: 1, unit: "pc" },
    category: "Dairy & Eggs",
    subcategory: "Farm Fresh Eggs",
    tags: ["protein", "fresh", "free-range"],
    image: "white-poultry-egg-500x500.jpg",
    perishability: "medium",
  },
  {
    name: "Fresh Milk",
    description:
      "Fresh cow milk rich in calcium and protein, perfect for daily consumption.",
    price: 60,
    quantity: { amount: 1, unit: "l" },
    category: "Dairy & Eggs",
    subcategory: "Milk & Paneer",
    tags: ["fresh", "calcium", "protein"],
    image: "white-poultry-egg-500x500.jpg",
    perishability: "high",
  },
  {
    name: "Paneer",
    description:
      "Fresh homemade paneer perfect for Indian curries and desserts.",
    price: 200,
    quantity: { amount: 250, unit: "g" },
    category: "Dairy & Eggs",
    subcategory: "Milk & Paneer",
    tags: ["fresh", "homemade", "protein"],
    image: "white-poultry-egg-500x500.jpg",
    perishability: "high",
  },
  {
    name: "Curd (Yogurt)",
    description:
      "Fresh homemade curd perfect for raita, lassi, and traditional Indian dishes.",
    price: 40,
    quantity: { amount: 500, unit: "g" },
    category: "Dairy & Eggs",
    subcategory: "Yogurt & Curd",
    tags: ["fresh", "probiotic", "traditional"],
    image: "white-poultry-egg-500x500.jpg",
    perishability: "high",
  },
  {
    name: "Ghee",
    description:
      "Pure homemade ghee perfect for cooking and traditional Indian sweets.",
    price: 300,
    quantity: { amount: 250, unit: "g" },
    category: "Dairy & Eggs",
    subcategory: "Ghee & Butter",
    tags: ["pure", "homemade", "traditional"],
    image: "white-poultry-egg-500x500.jpg",
    perishability: "none",
  },

  // Grains & Pulses - Rice & Millets
  {
    name: "Basmati Rice",
    description:
      "Premium basmati rice perfect for biryanis and traditional Indian meals.",
    price: 80,
    quantity: { amount: 1, unit: "kg" },
    category: "Grains & Pulses",
    subcategory: "Rice & Millets",
    tags: ["premium", "aromatic", "long-grain"],
    image:
      "photo-1702041295471-01b73fd39907q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "none",
  },
  {
    name: "Brown Rice",
    description: "Nutritious brown rice rich in fiber and essential nutrients.",
    price: 60,
    quantity: { amount: 1, unit: "kg" },
    category: "Grains & Pulses",
    subcategory: "Rice & Millets",
    tags: ["nutritious", "fiber", "healthy"],
    image:
      "photo-1702041295471-01b73fd39907q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "none",
  },
  {
    name: "Quinoa",
    description:
      "Superfood quinoa rich in protein and perfect for healthy meals.",
    price: 200,
    quantity: { amount: 500, unit: "g" },
    category: "Grains & Pulses",
    subcategory: "Rice & Millets",
    tags: ["superfood", "protein", "healthy"],
    image:
      "photo-1702041295471-01b73fd39907q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "none",
  },

  // Grains & Pulses - Lentils
  {
    name: "Moong Dal",
    description:
      "Split green gram dal perfect for traditional Indian dal and khichdi.",
    price: 80,
    quantity: { amount: 1, unit: "kg" },
    category: "Grains & Pulses",
    subcategory: "Lentils (Dal)",
    tags: ["protein", "traditional", "digestive"],
    image:
      "photo-1702041295471-01b73fd39907q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "none",
  },
  {
    name: "Toor Dal",
    description:
      "Split pigeon pea dal essential for South Indian sambar and traditional dishes.",
    price: 90,
    quantity: { amount: 1, unit: "kg" },
    category: "Grains & Pulses",
    subcategory: "Lentils (Dal)",
    tags: ["protein", "south-indian", "sambar"],
    image:
      "photo-1702041295471-01b73fd39907q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "none",
  },
  {
    name: "Chana Dal",
    description:
      "Split chickpea dal perfect for traditional Indian curries and snacks.",
    price: 85,
    quantity: { amount: 1, unit: "kg" },
    category: "Grains & Pulses",
    subcategory: "Lentils (Dal)",
    tags: ["protein", "traditional", "snacks"],
    image:
      "photo-1702041295471-01b73fd39907q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
    perishability: "none",
  },

  // Mixed Vegetables
  {
    name: "Mixed Vegetables",
    description:
      "A fresh mix of seasonal vegetables including carrots, beans, and peas.",
    price: 70,
    quantity: { amount: 500, unit: "g" },
    category: "Vegetables",
    subcategory: "Root Vegetables",
    tags: ["mixed", "seasonal", "fresh"],
    image: "shutterstock_206261176.jpg",
    perishability: "medium",
  },
];

const seedProducts = async () => {
  const payload = await getPayload({ config });

  try {
    // Create Stripe account for omkar-farms (using mock for development)
    console.log("Creating Stripe account for omkar-farms...");
    console.log(
      "⚠️  Using mock Stripe account for development (Stripe Connect limitations)"
    );
    const stripeAccount = {
      id: "acct_mock_omkar_farms_" + Date.now(),
      type: "express",
      country: "US",
      email: "omkar@gmail.com",
    };

    // Create tenant for omkar-farms
    console.log("Creating tenant for omkar-farms...");

    // Check if tenant already exists
    const existingTenant = await payload.find({
      collection: "tenants",
      where: {
        subdomain: {
          equals: "omkar-farms",
        },
      },
    });

    let tenant;
    if (existingTenant.docs.length > 0) {
      console.log("⚠️  Tenant already exists, using existing tenant");
      tenant = existingTenant.docs[0];
    } else {
      tenant = await payload.create({
        collection: "tenants",
        data: {
          name: "Omkar Farms",
          subdomain: "omkar-farms",
          stripeAccountId: stripeAccount.id,
          stripeDetailsSubmitted: true, // Allow product creation
        },
      });
    }

    // Create user for omkar-farms
    console.log("Creating user for omkar-farms...");

    // Check if user already exists
    const existingUser = await payload.find({
      collection: "users",
      where: {
        username: {
          equals: "omkar-farms",
        },
      },
    });

    let user;
    if (existingUser.docs.length > 0) {
      console.log("⚠️  User already exists, using existing user");
      user = existingUser.docs[0];
    } else {
      user = await payload.create({
        collection: "users",
        data: {
          email: "omkar@gmail.com",
          password: "12345",
          username: "omkar-farms",
          roles: ["seller"],
          tenants: [
            {
              tenant: tenant.id,
            },
          ],
        },
      });
    }

    // Create tags
    console.log("Creating tags...");
    const tagMap = new Map();
    const uniqueTags = [...new Set(products.flatMap((p) => p.tags))];

    for (const tagName of uniqueTags) {
      const tag = await payload.create({
        collection: "tags",
        data: {
          name: tagName,
        },
      });
      tagMap.set(tagName, tag.id);
    }

    // Upload images to media collection
    console.log("Uploading product images...");
    const mediaMap = new Map();
    const mediaDir = path.resolve(__dirname, "../../media");

    for (const product of products) {
      if (product.image) {
        const imagePath = path.join(mediaDir, product.image);
        if (fs.existsSync(imagePath)) {
          const media = await payload.create({
            collection: "media",
            data: {
              alt: product.name,
            },
            filePath: imagePath,
          });
          mediaMap.set(product.image, media.id);
        }
      }
    }

    // Get categories
    console.log("Fetching categories...");
    const categoriesResult = await payload.find({
      collection: "categories",
      where: {
        parent: {
          exists: false,
        },
      },
    });

    const subcategoriesResult = await payload.find({
      collection: "categories",
      where: {
        parent: {
          exists: true,
        },
      },
    });

    const categoryMap = new Map();
    const subcategoryMap = new Map();

    categoriesResult.docs.forEach((cat) => {
      categoryMap.set(cat.name, cat.id);
    });

    subcategoriesResult.docs.forEach((subcat) => {
      subcategoryMap.set(subcat.name, subcat.id);
    });

    const allowedUnits = ["kg", "g", "l", "ml", "pc", "pack", "other"] as const;
    type AllowedUnit = (typeof allowedUnits)[number];
    const isAllowedUnit = (u: unknown): u is AllowedUnit =>
      typeof u === "string" && (allowedUnits as readonly string[]).includes(u);

    // Create products
    console.log("Creating products...");
    for (const productData of products) {
      const product = await payload.create({
        collection: "products",
        data: {
          tenant: tenant.id,
          name: productData.name,
          description:
            typeof productData.description === "string"
              ? {
                  root: {
                    type: "root",
                    format: "",
                    indent: 0,
                    version: 1,
                    children: [
                      {
                        children: [
                          {
                            detail: 0,
                            format: 0,
                            mode: "normal",
                            style: "",
                            text: productData.description,
                            type: "text",
                            version: 1,
                          },
                        ],
                        direction: "ltr",
                        format: "",
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                  },
                }
              : productData.description,
          price: productData.price,
          quantity: {
            amount: productData.quantity.amount,
            unit: isAllowedUnit(productData.quantity.unit)
              ? productData.quantity.unit
              : "other",
          },
          category: categoryMap.get(productData.category),
          subcategory: subcategoryMap.get(productData.subcategory),
          tags: productData.tags.map((tag) => tagMap.get(tag)).filter(Boolean),
          image: mediaMap.get(productData.image),
          perishability: ((p: unknown) => {
            const allowed = ["high", "medium", "low", "none"] as const;
            type Perishability = (typeof allowed)[number];
            return typeof p === "string" &&
              (allowed as readonly string[]).includes(p)
              ? (p as Perishability)
              : "none";
          })(productData.perishability),
          // refundPolicy will be set automatically by the hook based on perishability
        },
      });

      console.log(`Created product: ${product.name}`);
    }

    console.log("✅ Product seeding completed successfully!");
    console.log(`Created user: omkar-farms (${user.email})`);
    console.log(`Created tenant: ${tenant.name}`);
    console.log(`Created ${products.length} products`);
    console.log(`Created ${uniqueTags.length} tags`);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
};

// Run the seed function
try {
  await seedProducts();
  process.exit(0);
} catch (error) {
  console.error("Seeding failed:", error);
  process.exit(1);
}
