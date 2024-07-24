import { getUserFromRequest } from 'handlers/signature-auth/getUserFromRequest'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const tosSchema = z.object({
  docVersion: z.string(),
})

export async function sign(req: NextApiRequest, res: NextApiResponse) {
  const { docVersion } = tosSchema.parse(req.body)
  const user = getUserFromRequest(req)
  const approvalData = {
    address: user.address,
    signature: user.signature,
    message: user.challenge,
    chain_id: user.chainId,
    doc_version: docVersion,
    sign_date: new Date(),
  }

  await prisma.tosApproval.create({
    data: approvalData,
  })

  return res.status(200).json({ docVersion })
}
