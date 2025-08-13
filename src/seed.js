"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.categories = void 0;
var payload_1 = require("payload");
var _payload_config_1 = require("@payload-config");
exports.categories = [
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
      { name: "Citrus", slug: "fruitscitrus" },
      { name: "Berries", slug: "fruitsberries" },
      { name: "Stone Fruits", slug: "fruitsstone-fruits" },
      { name: "Tropical Fruits", slug: "fruitstropical" },
      { name: "Pomes (Apples & Pears)", slug: "fruitspomes" },
    ],
  },
  {
    name: "Grains & Pulses",
    color: "#ca8a04",
    slug: "grains-pulses",
    subcategories: [
      { name: "Rice & Millets", slug: "grains-pulsesrice-millets" },
      { name: "Wheat & Maize", slug: "grains-pulseswheat-maize" },
      { name: "Lentils (Dal)", slug: "grains-pulseslentils" },
      { name: "Beans & Peas", slug: "grains-pulsesbeans-peas" },
      { name: "Flours & Meal", slug: "grains-pulsesflours" },
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
var seed = function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var payload,
      _i,
      categories_1,
      category,
      parentCategory,
      _a,
      _b,
      subcategory,
      subCategories;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          return [
            4 /*yield*/,
            (0, payload_1.getPayload)({ config: _payload_config_1.default }),
          ];
        case 1:
          payload = _c.sent();
          ((_i = 0), (categories_1 = exports.categories));
          _c.label = 2;
        case 2:
          if (!(_i < categories_1.length)) return [3 /*break*/, 8];
          category = categories_1[_i];
          return [
            4 /*yield*/,
            payload.create({
              collection: "categories",
              data: {
                name: category.name,
                slug: category.slug,
                colour: category.color,
                parent: null,
              },
            }),
          ];
        case 3:
          parentCategory = _c.sent();
          ((_a = 0), (_b = category.subcategories || []));
          _c.label = 4;
        case 4:
          if (!(_a < _b.length)) return [3 /*break*/, 7];
          subcategory = _b[_a];
          return [
            4 /*yield*/,
            payload.create({
              collection: "categories",
              data: {
                name: subcategory.name,
                slug: subcategory.slug,
                parent: parentCategory.id,
              },
            }),
          ];
        case 5:
          subCategories = _c.sent();
          _c.label = 6;
        case 6:
          _a++;
          return [3 /*break*/, 4];
        case 7:
          _i++;
          return [3 /*break*/, 2];
        case 8:
          return [2 /*return*/];
      }
    });
  });
};
await seed();
process.exit(0);
