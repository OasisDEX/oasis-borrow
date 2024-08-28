import { getRaysDailyChallengeData, getRaysDailyChallengeDateFormat } from 'helpers/dailyRays'
import type { NextApiHandler } from 'next'
import { prisma } from 'server/prisma'

export const dailyRaysGetHandler: NextApiHandler = async (req, res) => {
  // message is retrieved from the server
  // so we wont need to think about user's timezone
  const { walletAddress } = req.query
  const dailyChallengeData = await prisma.raysDailyChallenge.findUnique({
    where: {
      address: (walletAddress as string).toLocaleLowerCase(),
    },
  })
  const calculatedData = getRaysDailyChallengeData(dailyChallengeData?.claimed_dates)
  return res.status(200).json({
    ...calculatedData,
    alreadyClaimed: dailyChallengeData?.claimed_dates.includes(getRaysDailyChallengeDateFormat()),
  })
}

export const dailyRaysPostHandler: NextApiHandler = async (req, res) => {
  const { address, chainId } = req.body
  if (!address || !chainId) {
    return res.status(400).end()
  }

  const token = req.cookies[`token-${address.toLocaleLowerCase()}`]

  if (!token) {
    return res.status(401).json({ authenticated: false })
  }

  const usersOverview = await fetch(
    `${process.env.FUNCTIONS_API_URL}/api/portfolio/overview?address=${address}`,
  ).then((usersOverviewRes) => usersOverviewRes.json())

  if (!usersOverview.summerUsdValue) {
    return res.status(200).json({ alreadyClaimed: false, error: 'No assets', isJwtValid: true })
  }

  const todaysDate = getRaysDailyChallengeDateFormat()

  const walletsDailyChallenge = await prisma.raysDailyChallenge.findUnique({
    where: {
      address: address.toLocaleLowerCase(),
    },
  })

  if (walletsDailyChallenge?.claimed_dates.includes(todaysDate)) {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { dailyChallengeRays, streakRays, allBonusRays, currentStreak, streaks } =
      getRaysDailyChallengeData(walletsDailyChallenge.claimed_dates)
    return res.status(200).json({
      isJwtValid: true,
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
          address: address.toLocaleLowerCase(),
        },
        data: {
          claimed_dates: {
            push: todaysDate,
          },
        },
      })
    : await prisma.raysDailyChallenge.create({
        data: {
          address: address.toLocaleLowerCase(),
          claimed_dates: [todaysDate],
        },
      })

  const { dailyChallengeRays, streakRays, allBonusRays, currentStreak, streaks } =
    getRaysDailyChallengeData(updateDailyChallengeData.claimed_dates)

  return res.status(200).json({
    isJwtValid: true,
    alreadyClaimed: true,
    dailyChallengeRays,
    streakRays,
    allBonusRays,
    currentStreak,
    streaks,
  })
}
