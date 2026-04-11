import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

const baseClient =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  })

export const prisma = baseClient.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = Date.now()
      const result = await query(args)
      const duration = Date.now() - start

      // Log queries that take longer than 200ms in development
      if (process.env.NODE_ENV !== 'production' && duration > 200) {
        console.warn(`\x1b[33m[Prisma Slow Query]\x1b[0m ${model}.${operation} took ${duration}ms`)
      }

      return result
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = baseClient as PrismaClient
