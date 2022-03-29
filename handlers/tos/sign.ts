import jwt from 'express-jwt'
import { runMiddleware } from 'helpers/runMiddleware'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

import { getUserFromRequest } from '../signature-auth/getUserFromRequest'

const tosSchema = z.object({
  docVersion: z.string(),
})

export async function sign(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(
    req,
    res,
    jwt({ secret: process.env.USER_JWT_SECRET!, algorithms: ['HS512'] }),
  )

  const { docVersion } = tosSchema.parse(req.body)
  const user = getUserFromRequest(req)
  const approvalData = {
    address: user.address,
    doc_version: docVersion,
    sign_date: new Date(),
  }

  await prisma.tosApproval.create({
    data: approvalData,
  })

  return res.status(200).json({ docVersion })
}
