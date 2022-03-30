import { NextApiRequest, NextApiResponse } from 'next'
import {
  createRiskForAddress,
  selectRiskForAddress,
  updateRiskForAddress,
} from 'server/database/risk'
import { getUserFromRequest } from 'server/middleware/signature-auth/getUserFromRequest'
import { prisma } from 'server/prisma'

enum RiskType {
  OWNERSHIP = 'OWNERSHIP',
  COUNTERPARTY = 'COUNTERPARTY',
}

export interface RiskDataResponse {
  accountExternalId: string
  address: string
  addressRiskIndicators: {
    category: string
    categoryId: string
    categoryRiskScoreLevel: string
    categoryRiskScoreLevelLabel: string
    incomingVolumeUsd: string
    outgoingVolumeUsd: string
    riskType: RiskType
    totalVolumeUsd: string
  }[]
  addressSubmitted: string
  chain: string
  entities: {
    category: string
    categoryId: string
    riskScoreLevel: number
    riskScoreLevelLabel: string
    trmAppUrl: string
    trmUrn: string
  }[]
  trmAppUrl: string
}

async function getTrmRisk(account: string): Promise<RiskDataResponse> {
  return fetch('https://api.trmlabs.com/public/v2/screening/addresses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.TRM_API_KEY}`,
    },
    body: JSON.stringify([
      {
        address: account,
        chain: 'ethereum',
        accountExternalId: 'oazo',
      },
    ]),
  })
    .catch((error) => {
      throw error
    })
    .then((resp) => resp.json())
    .then((data) => {
      if (data[0].code === 403 || data[0].code === 500) {
        throw Error(data[0].name)
      }
      return data[0]
    })
}

const offset = new Date().getTime() + 5 * 24 * 60 * 60 * 100 // 5 days

export async function getRisk(req: NextApiRequest, res: NextApiResponse) {
  // TODO provide correct typing after Damians changes
  const user = getUserFromRequest(req as any)
  const { isGnosis } = req.body

  try {
    // check risk and return it to ui without saving in db
    if (isGnosis) {
      const trmData = await getTrmRisk(user.address)
      const isRisky = !!trmData.addressRiskIndicators.length

      return res.status(200).json({ isRisky })
    }

    // check if record exists
    const risk = await selectRiskForAddress(prisma, {
      address: user.address,
    })

    // create record in db
    if (risk === null) {
      const trmData = await getTrmRisk(user.address)
      const isRisky = !!trmData.addressRiskIndicators.length

      // await createRiskForAddress(prisma, user.address, isRisky)
      await createRiskForAddress(prisma, user.address, isRisky)

      return res.status(200).json({ isRisky })
    }

    const lastCheckTime = new Date(risk.last_check).getTime()
    const now = new Date().getTime()

    // check if update needed
    if (now - lastCheckTime < offset) {
      return res.status(200).json({ isRisky: risk.is_risky })
    }

    // update
    const trmData = await getTrmRisk(user.address)
    const isRisky = !!trmData.addressRiskIndicators.length

    await updateRiskForAddress(prisma, user.address, isRisky)

    return res.status(200).json({ isRisky })
  } catch (error: any) {
    return res.status(200).json({ error: error.message || error.toString() })
  }
}
