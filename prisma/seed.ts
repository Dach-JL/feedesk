const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Create a Class
  const classA = await prisma.class.create({
    data: {
      name: 'Class 10A',
    },
  })
  console.log(`Created class with id: ${classA.id}`)

  // Create a Student
  const student = await prisma.student.create({
    data: {
      name: 'Alice Smith',
      email: 'alice@example.com',
      classId: classA.id,
    },
  })
  console.log(`Created student with id: ${student.id}`)

  // Create a Fee Plan
  const feePlan = await prisma.feePlan.create({
    data: {
      name: 'Term 1 Tuition',
      amount: 500.0,
      dueDate: new Date('2026-05-01T00:00:00.000Z'),
      classId: classA.id,
    },
  })
  console.log(`Created fee plan with id: ${feePlan.id}`)

  // Create an Assignment
  const assignment = await prisma.studentFeeAssignment.create({
    data: {
      studentId: student.id,
      feePlanId: feePlan.id,
      status: 'PAID', // It's paid because we create a complete payment
    },
  })
  console.log(`Created student fee assignment with id: ${assignment.id}`)

  // Create a Payment
  const payment = await prisma.payment.create({
    data: {
      amount: 250.0,
      studentFeeAssignmentId: assignment.id,
      status: 'COMPLETED',
    },
  })
  console.log(`Created payment with id: ${payment.id}`)

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
