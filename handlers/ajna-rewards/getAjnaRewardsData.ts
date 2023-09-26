import BigNumber from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { zero } from 'helpers/zero'
import type { NextApiRequest } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const querySchema = z.object({
  address: z.string(),
  networkId: z.string(),
})

export async function getAjnaRewardsData(query: NextApiRequest['query']) {
  try {
    querySchema.parse(query)
  } catch (error) {
    return {
      errorMessage: 'Invalid GET parameters',
      error: String(error),
    }
  }

  const { address, networkId } = querySchema.parse(query)

  try {
    return {
      amount: (
        await prisma.ajnaRewardsWeeklyClaim.findMany({
          where: {
            user_address: address,
            chain_id: parseInt(networkId, 10),
          },
        })
      )
        .reduce<BigNumber>((total, current) => total.plus(new BigNumber(current.amount)), zero)
        .shiftedBy(NEGATIVE_WAD_PRECISION)
        .toString(),
    }
  } catch (error) {
    return {
      errorMessage: 'Unknown error occured',
      error: String(error),
    }
  }
}
