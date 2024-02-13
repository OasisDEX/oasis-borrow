import type { AjnaRewardsWeeklyClaim } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { getEpochWeekId } from 'helpers/getEpochWeekId'
import { zero } from 'helpers/zero'
import type { NextApiRequest } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

import { AjnaRewardsSource } from '.prisma/client'

const querySchema = z.object({
  address: z.string(),
  networkId: z.string(),
  claimedBonusWeeks: z.string().optional(),
  claimedCoreWeeks: z.string().optional(),
  poolAddress: z.string().optional(),
})

const mapStringToNumberArray = (input: string) => input.split(',').map((item) => Number(item))

const mapToAmount = <T extends { week_number: number; amount: string }[]>(records: T) => {
  return records
    .reduce<BigNumber>((total, current) => total.plus(new BigNumber(current.amount)), zero)
    .shiftedBy(NEGATIVE_WAD_PRECISION)
    .toString()
}

type PayloadBase = {
  proofs: string[][]
  weeks: string[]
  amounts: string[]
}

export type RewardsPayload = {
  [AjnaRewardsSource.bonus]: PayloadBase
  [AjnaRewardsSource.core]: PayloadBase
}

const initMapToProofes: RewardsPayload = {
  bonus: {
    proofs: [],
    weeks: [],
    amounts: [],
  },
  core: {
    proofs: [],
    weeks: [],
    amounts: [],
  },
}

const mapToPayload = (records: AjnaRewardsWeeklyClaim[]): RewardsPayload =>
  records.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.source]: {
        proofs: [...acc[curr.source].proofs, curr.proof],
        weeks: [...acc[curr.source].weeks, curr.week_number],
        amounts: [...acc[curr.source].amounts, curr.amount],
      },
    }),
    initMapToProofes,
  )

export async function getAjnaRewardsData(query: NextApiRequest['query']) {
  try {
    querySchema.parse(query)
  } catch (error) {
    return {
      errorMessage: 'Invalid GET parameters',
      error: String(error),
    }
  }

  const { address, networkId, claimedBonusWeeks, claimedCoreWeeks, poolAddress } =
    querySchema.parse(query)

  const parsedClaimedBonusWeeks = claimedBonusWeeks?.length
    ? mapStringToNumberArray(claimedBonusWeeks)
    : []

  const parsedClaimedCoreWeeks = claimedCoreWeeks?.length
    ? mapStringToNumberArray(claimedCoreWeeks)
    : []

  const commonQuery = {
    user_address: address,
    chain_id: {
      notIn: [NetworkIds.GOERLI],
    },
  }

  try {
    const bonusClaimable = await prisma.ajnaRewardsWeeklyClaim.findMany({
      where: {
        ...commonQuery,
        week_number: {
          notIn: parsedClaimedBonusWeeks,
        },
        source: AjnaRewardsSource.bonus,
      },
    })

    const coreClaimable = await prisma.ajnaRewardsWeeklyClaim.findMany({
      where: {
        user_address: address,
        chain_id: parseInt(networkId, 10),
        week_number: {
          notIn: parsedClaimedCoreWeeks,
        },
        source: AjnaRewardsSource.core,
      },
    })

    const coreNotClaimable = await prisma.ajnaRewardsDailyClaim.findMany({
      where: {
        ...commonQuery,
        week_number: {
          notIn: parsedClaimedCoreWeeks,
        },
        ...(poolAddress && {
          pool_address: poolAddress,
        }),
        source: AjnaRewardsSource.core,
      },
    })

    const lastDayRewards = (
      coreNotClaimable[coreNotClaimable.length - 1]
        ? new BigNumber(coreNotClaimable[coreNotClaimable.length - 1].amount).shiftedBy(
            NEGATIVE_WAD_PRECISION,
          )
        : zero
    ).toString()

    const coreNotClaimableAmount = mapToAmount(coreNotClaimable)

    const currentWeekId = getEpochWeekId()

    const currentPeriodPositionEarnedAmount = mapToAmount(
      await prisma.ajnaRewardsDailyClaim.findMany({
        where: {
          ...commonQuery,
          week_number: currentWeekId,
          ...(poolAddress && {
            pool_address: poolAddress,
          }),
          source: {
            in: [AjnaRewardsSource.core, AjnaRewardsSource.bonus],
          },
        },
      }),
    )

    const currentPeriodTotalEarnedAmount = mapToAmount(
      await prisma.ajnaRewardsDailyClaim.findMany({
        where: {
          ...commonQuery,
          week_number: currentWeekId,
          source: {
            in: [AjnaRewardsSource.core, AjnaRewardsSource.bonus],
          },
        },
      }),
    )

    const totalEarnedToDateAmount = mapToAmount(
      await prisma.ajnaRewardsDailyClaim.findMany({
        where: {
          ...commonQuery,
          source: {
            in: [AjnaRewardsSource.core, AjnaRewardsSource.bonus],
          },
        },
      }),
    )

    const bonusNotClaimableAmount = mapToAmount(
      await prisma.ajnaRewardsDailyClaim.findMany({
        where: {
          ...commonQuery,
          week_number: {
            notIn: parsedClaimedBonusWeeks,
          },
          ...(poolAddress && {
            pool_address: poolAddress,
          }),
          source: AjnaRewardsSource.bonus,
        },
      }),
    )

    const claimableTodayData = [...bonusClaimable, ...coreClaimable]

    const claimableToday = mapToAmount(claimableTodayData)
    const claimableBonusToday = mapToAmount(bonusClaimable)
    const payload = mapToPayload(claimableTodayData)

    const totalClaimableAndTotalCurrentPeriodEarnedAmount = new BigNumber(claimableToday)
      .plus(claimableBonusToday)
      .plus(currentPeriodTotalEarnedAmount)
      .toString()

    return {
      bonusAmount: bonusNotClaimableAmount,
      coreAmount: coreNotClaimableAmount,
      claimableToday,
      claimableBonusToday,
      lastDayRewards,
      payload,
      currentPeriodPositionEarned: currentPeriodPositionEarnedAmount,
      currentPeriodTotalEarned: currentPeriodTotalEarnedAmount,
      totalClaimableAndTotalCurrentPeriodEarned: totalClaimableAndTotalCurrentPeriodEarnedAmount,
      totalEarnedToDate: totalEarnedToDateAmount,
    }
  } catch (error) {
    return {
      errorMessage: 'Unknown error occured',
      error: String(error),
    }
  }
}
