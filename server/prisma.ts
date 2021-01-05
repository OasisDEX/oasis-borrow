import { PrismaClient } from '@prisma/client'

/**
 * Note: you should use this instance of PrismaClient rather than creating your own otherwise we can't terminate process during tests
 */
export const prisma = new PrismaClient()
