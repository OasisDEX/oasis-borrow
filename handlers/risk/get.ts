import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAccessToken } from 'pages/api/auth/check-auth'
import {
  createRiskForAddress,
  selectRiskForAddress,
  updateRiskForAddress,
} from 'server/database/risk'
import { prisma } from 'server/prisma'
import * as z from 'zod'

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
    .then((resp) => {
      if (!resp.ok) {
        throw Error(`Risk service status code ${resp.status} ${resp.statusText}`)
      }
      return resp.json()
    })
    .then((data) => {
      return data[0]
    })
}

const offset = 14 * 24 * 60 * 60 * 1000 // 14 days

async function checkIfRisky(address: string) {
  if (process.env.NODE_ENV !== 'production' && process.env.USE_TRM_API === '0') {
    return true
  }
  try {
    const trmData = await getTrmRisk(address)

    try {
      console.info(`TRM_LOG ${address} check, payload ${JSON.stringify(trmData)}`)
    } catch (ex) {
      console.error('TRM_LOG logging failed', ex)
    }

    if (!trmData.addressRiskIndicators.length) {
      return false
    }

    return trmData.addressRiskIndicators
      .map((indicator) => Number(indicator.totalVolumeUsd) > 0)
      .includes(true)
  } catch (ex) {
    console.error(`TRM_LOG ${address} check failed`)
    console.error(ex)
    throw ex
  }
}

const inputSchema = z.object({
  chainId: z.number(),
  walletAddress: z.string(),
})

export async function getRisk(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, walletAddress } = inputSchema.parse(req.body)

  const userAddress = walletAddress.toLowerCase()

  const token = req.cookies[`token-${userAddress}`]

  if (!token) {
    return res.status(401).json({ authenticated: false })
  }

  const decoded = verifyAccessToken(token)

  if (!decoded) {
    return res.status(401).json({ authenticated: false })
  }

  if (chainId !== 1) {
    return res.status(200).json({ isRisky: false })
  }

  try {
    // check if record exists
    const risk = await selectRiskForAddress(prisma, {
      address: userAddress,
    })

    // create record in db
    if (risk === null) {
      const isRisky = await checkIfRisky(userAddress)

      await createRiskForAddress(prisma, userAddress, isRisky)

      return res.status(200).json({ isRisky })
    }

    // force re-check if wallet is still flagged as risky
    // it's necessary for cases where provider flags user as risky by mistake
    // and after a short period of time it's fixed on provider side
    if (risk.is_risky) {
      const isRisky = await checkIfRisky(userAddress)
      await updateRiskForAddress(prisma, userAddress, isRisky)

      return res.status(200).json({ isRisky })
    }

    const lastCheckTime = new Date(risk.last_check).getTime()
    const now = new Date().getTime()

    // check if update needed
    if (now - lastCheckTime < offset) {
      return res.status(200).json({ isRisky: risk.is_risky })
    }

    // update
    const isRisky = await checkIfRisky(userAddress)
    await updateRiskForAddress(prisma, userAddress, isRisky)

    return res.status(200).json({ isRisky })
  } catch (error) {
    // @ts-ignore
    return res.status(500).json({ error: error.message || error.toString() })
  }
}
