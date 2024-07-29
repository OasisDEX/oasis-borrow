import { getBackendRpcUrl } from 'blockchain/networks'
import {
  getDailyChallengeMessage,
  getRaysDailyChallengeData,
  getRaysDailyChallengeDateFormat,
} from 'handlers/dailyRays'
import type { NextApiHandler } from 'next'
import { prisma } from 'server/prisma'
import Web3 from 'web3'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      // message is retreived from the server
      // so we wont need to think about user's timezone
      const { walletAddress } = req.query
      const dailyChallengeData = await prisma.raysDailyChallenge.findUnique({
        where: {
          address: walletAddress as string,
        },
      })
      const calculatedData = getRaysDailyChallengeData(dailyChallengeData?.claimed_dates)
      return res.status(200).json({
        ...calculatedData,
        message: getDailyChallengeMessage(),
        alreadyClaimed: dailyChallengeData?.claimed_dates.includes(
          getRaysDailyChallengeDateFormat(),
        ),
      })
    case 'POST':
      const { address, signature, chainId } = req.body
      if (!address || !signature || !chainId) {
        return res.status(400).end()
      }
      const rpcUrl = getBackendRpcUrl(Number(chainId))
      const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))
      const messageToBeSigned = getDailyChallengeMessage()

      const isSignatureValid = web3.eth.accounts.recover(messageToBeSigned, signature) === address

      if (!isSignatureValid) {
        return res.status(200).json({ isSignatureValid })
      }

      const todaysDate = getRaysDailyChallengeDateFormat()

      const walletsDailyChallenge = await prisma.raysDailyChallenge.findUnique({
        where: {
          address,
        },
      })

      if (walletsDailyChallenge?.claimed_dates.includes(todaysDate)) {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const { dailyChallengeRays, streakRays, allBonusRays, currentStreak, streaks } =
          getRaysDailyChallengeData(walletsDailyChallenge.claimed_dates)
        return res.status(200).json({
          isSignatureValid,
          alreadyClaimed: true,
          dailyChallengeRays,
          streakRays,
          allBonusRays,
          currentStreak,
          streaks,
        })
      }

      const updateDailyChallengeData = walletsDailyChallenge
        ? await prisma.raysDailyChallenge.update({
            where: {
              address,
            },
            data: {
              claimed_dates: {
                push: todaysDate,
              },
            },
          })
        : await prisma.raysDailyChallenge.create({
            data: {
              address,
              claimed_dates: [todaysDate],
            },
          })

      const { dailyChallengeRays, streakRays, allBonusRays, currentStreak, streaks } =
        getRaysDailyChallengeData(updateDailyChallengeData.claimed_dates)

      return res.status(200).json({
        isSignatureValid,
        alreadyClaimed: true,
        dailyChallengeRays,
        streakRays,
        allBonusRays,
        currentStreak,
        streaks,
      })
    default:
      return res.status(405).json({ error: 'Method Not Allowed' })
  }
}

export default handler
