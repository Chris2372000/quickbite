// Turns the dishes in src/data/sampleData.js into a JSON file the backend seed script reads.
// Run from the frontend folder:  node scripts/export-sample-dishes.mjs
// Then reseed the backend:       docker exec quickbite-api npm run seed
import { writeFileSync } from "node:fs";
import { restaurants } from "../src/data/sampleData.js";

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").trim();
const dishes = [];

for (const r of restaurants) {
  for (const section of r.menu || []) {
    for (const item of section.items) {
      const modifierGroups = [];
      if (item.sizes?.length)
        modifierGroups.push({ name: "Size", required: false, multiple: false, options: item.sizes });
      if (item.extras?.length)
        modifierGroups.push({ name: "Extras", required: false, multiple: true, options: item.extras });
      dishes.push({
        slug: norm(`${r.id}:${item.id}`), // same id the cart sends: "<restaurant id>:<dish id>"
        restaurant: r.name,
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: section.category,
        imageUrl: item.image || "",
        modifierGroups,
      });
    }
  }
}

const target = new URL("../../backend/utils/sampleDishes.json", import.meta.url);
writeFileSync(target, JSON.stringify(dishes, null, 2));
console.log(`Wrote ${dishes.length} dishes to ${target.pathname}`);
