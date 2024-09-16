import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAccessToken } from 'pages/api/auth/check-auth'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const tosSchema = z.object({
  docVersion: z.string(),
  walletAddress: z.string(),
})

export async function sign(req: NextApiRequest, res: NextApiResponse) {
  const { docVersion, walletAddress } = tosSchema.parse(req.body)

  const token = req.cookies[`token-${walletAddress.toLowerCase()}`]

  if (!token) {
    return res.status(401).json({ authenticated: false })
  }

  const decoded = verifyAccessToken(token)

  if (!decoded) {
    return res.status(401).json({ authenticated: false })
  }

  const approvalData = {
    address: decoded.address,
    signature: decoded.signature,
    message: decoded.challenge,
    chain_id: decoded.chainId,
    doc_version: docVersion,
    sign_date: new Date(),
  }

  const queryResult = await prisma.tosApproval.findMany({
    where: {
      address: decoded.address,
      doc_version: docVersion,
    },
  })

  const currentRecord = queryResult[0]

  if (currentRecord) {
    await prisma.tosApproval.update({
      where: {
        address_chain_id_doc_version: {
          address: currentRecord.address,
          doc_version: currentRecord.doc_version,
          chain_id: currentRecord.chain_id,
        },
      },
      data: approvalData,
    })
  } else {
    await prisma.tosApproval.create({
      data: approvalData,
    })
  }

  return res.status(200).json({ docVersion })
}
