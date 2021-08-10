import express from 'express'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const vaultSchema = z.object({
    id: z.number(),
    type: z.enum(['multiply', 'borrow'])
})

export async function createOrUpdate(req:express.Request, res: express.Response) {
    // const params = paramsSchema.parse(req.params)
    
}