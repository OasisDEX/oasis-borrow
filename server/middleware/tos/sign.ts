import express from 'express'
import { prisma } from 'server/prisma'
import * as z from 'zod'

import { getUserFromRequest } from '../signature-auth/getUserFromRequest'

const tosSchema = z.object({
  docVersion: z.string(),
  email: z.string().optional(),
})

export async function sign(req: express.Request, res: express.Response) {
  const { email, docVersion } = tosSchema.parse(req.body)
  const user = getUserFromRequest(req)
  const approvalData = {
    address: user.address,
    doc_version: docVersion,
    sign_date: new Date(),
  }

  if (email) {
    const userEmail = await prisma.userEmail.findOne({
      where: { email },
    })

    if (!userEmail) {
      // creating new user and approval
      await prisma.userEmail.create({
        data: {
          email,
          tos_approval: {
            create: approvalData,
          },
        },
      })
    } else {
      // creating new approval and connecting/linking existing user
      await prisma.tosApproval.create({
        data: {
          ...approvalData,
          email: {
            connect: {
              id: userEmail.id,
            },
          },
        },
      })
    }
  } else {
    await prisma.tosApproval.create({
      data: approvalData,
    })
  }

  return res.status(200).json({ docVersion })
}
