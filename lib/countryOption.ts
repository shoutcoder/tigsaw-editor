// utils/countryOptions.js
import { countries } from "countries-list";

export const countryOptions = Object.entries(countries).map(([code, data]) => ({
  code,
  name: data.name,
}));
