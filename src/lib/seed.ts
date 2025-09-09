import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stjoseph.ac.ke' },
    update: {},
    create: {
      email: 'admin@stjoseph.ac.ke',
      name: 'System Administrator',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create some basic classes
  const classes = [
    { name: 'Baby Class', level: 1 },
    { name: 'PP1', level: 2 },
    { name: 'PP2', level: 3 },
    { name: 'Grade 1', level: 4 },
    { name: 'Grade 2', level: 5 },
    { name: 'Grade 3', level: 6 },
    { name: 'Grade 4', level: 7 },
    { name: 'Grade 5', level: 8 },
    { name: 'Grade 6', level: 9 },
    { name: 'Grade 7', level: 10 },
    { name: 'Grade 8', level: 11 },
  ]

  for (const classData of classes) {
    await prisma.class.upsert({
      where: { name: classData.name },
      update: {},
      create: classData,
    })
  }

  console.log('✅ Classes created')

  // Create fee groups
  const feeGroups = [
    { name: 'Day Scholar', description: 'Students who go home daily' },
    { name: 'Boarder', description: 'Students who stay at school' },
    { name: 'New Student', description: 'First-time students with admission fees' },
  ]

  for (const group of feeGroups) {
    await prisma.feeGroup.upsert({
      where: { name: group.name },
      update: {},
      create: group,
    })
  }

  console.log('✅ Fee groups created')

  // Create academic year
  await prisma.academicYear.upsert({
    where: { year: 2024 },
    update: {},
    create: {
      year: 2024,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
      isCurrent: true,
    },
  })

  console.log('✅ Academic year created')
  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })