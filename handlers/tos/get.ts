import type { TosApproval } from '@prisma/client'
import { selecTosForAddress } from 'handlers/tos/tos'
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAccessToken } from 'pages/api/auth/check-auth'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  version: z.string(),
  walletAddress: z.string(),
})

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const { version, walletAddress } = paramsSchema.parse(req.query)

  const token = req.cookies[`token-${walletAddress.toLowerCase()}`]

  let authorized

  if (!token) {
    authorized = false
  } else {
    const decoded = verifyAccessToken(token)

    if (decoded?.address.toLowerCase() !== walletAddress.toLowerCase()) {
      authorized = false
    } else {
      authorized = true
    }
  }

  const tos = await selecTosForAddress(prisma, {
    address: walletAddress.toLowerCase(),
  })

  if (tos === undefined) {
    return res.status(404).send('Not Found')
  } else {
    const acceptances = serializeTos(tos)

    if (acceptances.length === 0) return res.status(200).json({ acceptance: false, authorized })

    return res
      .status(200)
      .json(
        acceptances.find(({ docVersion }) => docVersion === version)
          ? { acceptance: true, authorized }
          : { acceptance: false, updated: true, authorized },
      )
  }
}

function serializeTos(tos: TosApproval[]) {
  return tos.map(({ doc_version, sign_date }) => ({
    docVersion: doc_version,
    dateSign: sign_date,
  }))
}
