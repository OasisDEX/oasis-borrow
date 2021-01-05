import { TosApproval } from '@prisma/client'
import express from 'express'
import { selecTosForAddress } from 'server/database/tos'
import { prisma } from 'server/prisma'
import * as z from 'zod'

import { getUserFromRequest } from '../signature-auth/getUserFromRequest'

const paramsSchema = z.object({
  version: z.string(),
})

export async function get(req: express.Request, res: express.Response) {
  const user = getUserFromRequest(req)
  const params = paramsSchema.parse(req.params)

  const tos = await selecTosForAddress(prisma, {
    address: user.address,
  })

  if (tos === undefined) {
    return res.sendStatus(404)
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
