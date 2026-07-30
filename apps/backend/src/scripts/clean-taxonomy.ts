import * as fs from "fs";
import * as path from "path";

const filePath = path.resolve(__dirname, "../../../../google-taxonomy-en.md");

function cleanTaxonomy() {
  if (!fs.existsSync(filePath)) {
    console.error(`Taxonomy file not found at ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);
  const cleanedLines: string[] = [];

  let removedCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      cleanedLines.push(line);
      continue;
    }

    const levels = trimmed.split(" > ").map((l) => l.trim());

    // 1. Mature / adult / weapons
    if (levels[0] === "Mature") {
      removedCount++;
      continue;
    }

    // 2. Tobacco Products
    if (
      levels[0] === "Food, Beverages & Tobacco" &&
      levels[1] === "Tobacco Products"
    ) {
      removedCount++;
      continue;
    }

    // 3. Alcoholic Beverages
    if (
      levels[0] === "Food, Beverages & Tobacco" &&
      levels[1] === "Beverages" &&
      levels[2] === "Alcoholic Beverages"
    ) {
      removedCount++;
      continue;
    }

    // 4. Live Animals
    if (
      levels[0] === "Animals & Pet Supplies" &&
      levels[1] === "Live Animals"
    ) {
      removedCount++;
      continue;
    }

    // 5. Vehicles (Cars, Aircraft, Watercraft, etc.)
    if (levels[0] === "Vehicles & Parts" && levels[1] === "Vehicles") {
      removedCount++;
      continue;
    }

    // 6. Weapon Scopes & Accessories (in other categories)
    if (
      trimmed.includes("Weapon Scope & Sight Accessories") ||
      trimmed.includes("Weapon Scopes & Sights")
    ) {
      removedCount++;
      continue;
    }

    cleanedLines.push(line);
  }

  fs.writeFileSync(filePath, cleanedLines.join("\n"), "utf-8");
  console.log(`Successfully cleaned google-taxonomy-en.md!`);
  console.log(`Total categories removed: ${removedCount}`);
  console.log(
    `Remaining categories: ${cleanedLines.filter((l) => l.trim()).length}`,
  );
}

cleanTaxonomy();
