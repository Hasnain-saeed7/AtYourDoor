import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    {
      name: 'Plumber',
      icon: '🔧',
      description: 'Fix leaks, pipes, taps, and drainage issues',
    },
    {
      name: 'Electrician',
      icon: '⚡',
      description: 'Wiring, switches, fans, and electrical repairs',
    },
    {
      name: 'Carpenter',
      icon: '🪚',
      description: 'Furniture repair, doors, windows, and woodwork',
    },
    {
      name: 'Cleaner',
      icon: '🧹',
      description: 'Home deep cleaning, sofa, carpet, and kitchen',
    },
    {
      name: 'Tailor',
      icon: '🧵',
      description: 'Stitching, alterations, and measurements at home',
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log('Categories seeded successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())