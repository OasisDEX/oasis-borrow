import { TosApproval } from '@prisma/client'
import { selecTosForAddress } from 'handlers/tos/tos'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

import { getUserFromRequest } from '../signature-auth/getUserFromRequest'

const paramsSchema = z.object({
  version: z.string(),
})

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req)
  const params = paramsSchema.parse(req.query)

  const tos = await selecTosForAddress(prisma, {
    address: user.address,
  })

  if (tos === undefined) {
    return res.status(404).send('Not Found')
  } else {
    const acceptances = serializeTos(tos)

    if (acceptances.length === 0) return res.status(200).json({ acceptance: false })

    return res
      .status(200)
      .json(
        acceptances.find(({ docVersion }) => docVersion === params.version)
          ? { acceptance: true }
          : { acceptance: false, updated: true },
      )
  }
}

function serializeTos(tos: TosApproval[]) {
  return tos.map(({ doc_version, sign_date }) => ({
    docVersion: doc_version,
    dateSign: sign_date,
  }))
}
