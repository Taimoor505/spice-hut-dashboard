import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword('Password123!');

  await prisma.user.upsert({
    where: { email: 'admin@spicehut.com' },
    update: { passwordHash, name: 'Spice Hut Admin', role: 'ADMIN' },
    create: {
      email: 'admin@spicehut.com',
      passwordHash,
      name: 'Spice Hut Admin',
      role: 'ADMIN'
    }
  });

  const menuCount = await prisma.menuItem.count();
  if (menuCount === 0) {
    await prisma.menuItem.createMany({
      data: [
        {
          name: 'Chicken Biryani',
          category: 'Main Course',
          description: 'Fragrant basmati rice with spiced chicken.',
          price: 14.99,
          available: true
        },
        {
          name: 'Paneer Tikka',
          category: 'Appetizers',
          description: 'Char-grilled cottage cheese with masala.',
          price: 9.5,
          available: true
        },
        {
          name: 'Mango Lassi',
          category: 'Drinks',
          description: 'Chilled yogurt drink with mango pulp.',
          price: 4.25,
          available: false
        }
      ]
    });
  }

  const callCount = await prisma.callLog.count();
  if (callCount === 0) {
    await prisma.callLog.create({
      data: {
        customerName: 'John Carter',
        phone: '+15550112222',
        direction: 'INBOUND',
        status: 'COMPLETED',
        duration: 312,
        timestamp: new Date(),
        transcription: 'Customer requested two chicken biryanis and one mango lassi for pickup.',
        orderSummary: 'Chicken Biryani x2, Mango Lassi x1, $34.23',
        aiConfidence: 0.92
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
