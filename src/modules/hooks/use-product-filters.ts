import {
  useQueryStates,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  parseAsBoolean,
} from "nuqs";

const sortValues = [
  "popularity",
  "freshness",
  "price-asc",
  "price-desc",
  "rating",
] as const;

const params = {
  search: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  sort: parseAsStringLiteral(sortValues).withDefault("popularity"),
  minPrice: parseAsString
    .withOptions({
      clearOnDefault: true,
    })
    .withDefault(""),
  maxPrice: parseAsString
    .withOptions({
      clearOnDefault: true,
    })
    .withDefault(""),
  tags: parseAsArrayOf(parseAsString)
    .withOptions({ clearOnDefault: true })
    .withDefault([]),
  inStockOnly: parseAsBoolean
    .withOptions({ clearOnDefault: true })
    .withDefault(false),
};

export const useProductFilters = () => {
  return useQueryStates(params);
};
