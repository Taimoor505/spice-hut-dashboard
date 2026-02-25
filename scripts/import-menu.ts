import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const prisma = new PrismaClient();

type MenuCsvRow = {
  Category?: string;
  Product_Name?: string;
  Price?: string;
  Stock?: string;
  Description?: string;
  Image_URL?: string;
};

function toNumber(value: string | undefined): number {
  const n = Number((value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function toAvailable(stock: string | undefined): boolean {
  const raw = (stock || '').toLowerCase().trim();
  if (!raw) return true;
  if (raw === '0' || raw === 'false' || raw === 'no') return false;
  return true;
}

async function main() {
  const inputPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.resolve(process.cwd(), 'data', 'menu_knowledge_base_final.csv');

  const content = await fs.readFile(inputPath, 'utf8');
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as MenuCsvRow[];

  const items = rows
    .map((row) => {
      const name = (row.Product_Name || '').trim();
      const category = (row.Category || 'Uncategorized').trim();
      const description = (row.Description || `${category}: ${name}`).trim();
      const price = toNumber(row.Price);
      const available = toAvailable(row.Stock);
      const imageUrl = (row.Image_URL || '').trim() || null;

      if (!name || !category) return null;

      return {
        name,
        category,
        description,
        price,
        available,
        imageUrl
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  await prisma.menuItem.deleteMany();
  if (items.length > 0) {
    await prisma.menuItem.createMany({ data: items });
  }

  console.log(`Imported ${items.length} menu items from ${inputPath}`);
}

main()
  .catch((err) => {
    console.error('Menu import failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
