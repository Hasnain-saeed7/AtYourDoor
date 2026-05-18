const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting to seed categories...')
  const categories = [
    { name: 'Plumber', icon: '🔧', description: 'Fix leaks, pipes, taps, and drainage issues' },
    { name: 'Electrician', icon: '⚡', description: 'Wiring, switches, fans, and electrical repairs' },
    { name: 'Carpenter', icon: '🪚', description: 'Furniture repair, doors, windows, and woodwork' },
    { name: 'Cleaner', icon: '🧹', description: 'Home deep cleaning, sofa, carpet, and kitchen' },
    { name: 'Tailor', icon: '🧵', description: 'Stitching, alterations, and measurements at home' },
  ]

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: category.name },
    })
    if (!existingCategory) {
      await prisma.category.create({
        data: category,
      })
      console.log(`✅ Created category: ${category.name}`)
    } else {
      console.log(`- Category already exists: ${category.name}`)
    }
  }
  console.log('🎉 Category seeding finished.')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
