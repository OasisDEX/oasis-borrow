import { trackingEvents } from 'analytics/trackingEvents'
import { FunctionalContextHandler } from 'components/context/FunctionalContextHandler'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import {
  getDailyRaysBaseData,
  type RaysDailyChallengeResponse,
  updateDailyRaysData,
} from 'components/portfolio/helpers/getRaysDailyChallenge'
import { SkeletonLine } from 'components/Skeleton'
import { jwtAuthGetToken } from 'features/shared/jwt'
import { TermsOfService } from 'features/termsOfService/TermsOfService'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { bonusRaysAmount, dailyRaysAmount, explodeRays } from 'helpers/dailyRays'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React, { useEffect, useState } from 'react'
import { rays } from 'theme/icons'
import { Box, Button, Divider, Flex, Grid, Image, Text } from 'theme-ui'

const flashButton = ({
  setIsExploding,
  small,
}: {
  setIsExploding: React.Dispatch<React.SetStateAction<boolean>>
  small: boolean
}) =>
  new Promise((resolve) => {
    explodeRays(small)
    setIsExploding(true)
    setTimeout(() => {
      setIsExploding(false)
      return resolve(null)
    }, 400)
  })

const SignTosComponent = ({ wallet }: { wallet?: string }) => {
  const [signTosEnabled, setSignTosEnabled] = useState(false)
  const jwtToken = wallet ? jwtAuthGetToken(wallet) : ''
  if (!jwtToken && !signTosEnabled) {
    return (
      <Button variant="outlineSmall" onClick={() => setSignTosEnabled(true)} sx={{ mt: 3 }}>
        Sign Terms of service
      </Button>
    )
  }
  return <TermsOfService refreshAfterSign />
}

const PortfolioDailyRaysHeader = () => (
  <Flex sx={{ justifyContent: 'space-between' }}>
    <Flex sx={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text variant="boldParagraph2">Rays Daily Challenge</Text>
    </Flex>
  </Flex>
)

export const PortfolioDailyRays = ({
  refreshUserRaysData,
}: {
  refreshUserRaysData?: () => void
}) => {
  const { wallet } = useWalletManagement()
  const [isExploding, setIsExploding] = useState(false)
  const [isAddingPoints, setIsAddingPoints] = useState(false)
  const [userError, setUserError] = useState(false)
  const [baseRaysChallengeData, setBaseRaysChallengeData] = useState<RaysDailyChallengeResponse>({
    currentStreak: 0,
    dailyChallengeRays: 0,
    loaded: false,
  })
  const [loadingBaseRaysChallengeData, setloadingBaseRaysChallengeData] = useState(false)
  const jwtToken = wallet?.address ? jwtAuthGetToken(wallet.address) : ''

  useEffect(() => {
    if (!loadingBaseRaysChallengeData && !baseRaysChallengeData.loaded && wallet?.address) {
      setloadingBaseRaysChallengeData(true)
      void getDailyRaysBaseData({
        walletAddress: wallet.address,
        callback: (baseDailyRaysData) => {
          setBaseRaysChallengeData({ ...baseDailyRaysData, loaded: true })
        },
      })
    }
  }, [baseRaysChallengeData, wallet?.address, loadingBaseRaysChallengeData])

  const requiredItems = wallet?.address && wallet?.chainId && baseRaysChallengeData && jwtToken

  const updateDailyRays = () => {
    setIsAddingPoints(true)
    requiredItems &&
      void updateDailyRaysData({
        wallet,
        token: jwtToken,
        callback: (res) => {
          setIsAddingPoints(false)
          if (res.isJwtValid) {
            refreshUserRaysData && refreshUserRaysData()
            setBaseRaysChallengeData((prev) => ({ ...prev, ...res, loaded: true }))
            res.allBonusRays &&
              res.streaks &&
              res.currentStreak &&
              trackingEvents.raysDailyRewards.claim({
                allBonusRays: res.allBonusRays,
                streaks: res.streaks,
                currentStreak: res.currentStreak,
              })
            void flashButton({ setIsExploding, small: false })
          } else {
            setUserError(true)
          }
        },
      })
  }

  const explodeRaysHandler = (_ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setUserError(false)
    void flashButton({ setIsExploding, small: true }).then(() => {
      if (requiredItems && baseRaysChallengeData.loaded) {
        if (!jwtToken) {
          setUserError(true)
          return
        }
        updateDailyRays()
      }
    })
  }
  return (
    <>
      <PortfolioDailyRaysHeader />
      <Box sx={{ mt: 3, mb: 3 }}>
        <Text as="p" variant="paragraph3" color="neutral80">
          Every day you can claim your Rays. Claim Rays for 7 days in a row and get a special{' '}
          {bonusRaysAmount} Rays bonus.
        </Text>
        <Grid
          gap={2}
          columns={2}
          sx={{
            mt: 4,
            alignItems: 'center',
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <Text variant="paragraph3">Current streak</Text>
          {baseRaysChallengeData.loaded && !isAddingPoints ? (
            <Text variant="boldParagraph3" sx={{ textAlign: 'right' }}>
              {baseRaysChallengeData.currentStreak}{' '}
              {baseRaysChallengeData.currentStreak === 1 ? 'day' : 'days'}
            </Text>
          ) : (
            <SkeletonLine sx={{ justifySelf: 'flex-end' }} height={15} width={50} />
          )}
          <Text variant="paragraph3">Daily challenge Rays</Text>
          <Box as="span" sx={{ textAlign: 'right', justifySelf: 'flex-end' }}>
            {baseRaysChallengeData.loaded && !isAddingPoints ? (
              <Text variant="boldParagraph3" as="span" sx={getGradientColor(summerBrandGradient)}>
                {baseRaysChallengeData?.allBonusRays}
              </Text>
            ) : (
              <SkeletonLine height={15} width={50} color="fancy" />
            )}
          </Box>
        </Grid>
        <div
          id="claim-rays"
          style={{ position: 'relative', zIndex: 10, left: '20%', top: '25px' }}
        />
        <Box
          sx={{
            backgroundColor: 'white',
            position: 'relative',
            zIndex: 100,
            width: 'fit-content',
            borderRadius: 'round',
          }}
        >
          {jwtToken ? (
            <Button
              variant="outlineSmall"
              disabled={!requiredItems || baseRaysChallengeData?.alreadyClaimed || isAddingPoints}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 3,
                transition: 'box-shadow 0.5s cubic-bezier(0,1.81,.41,1.37)',
                userSelect: 'none',
                boxShadow: isExploding
                  ? '-10px -6px 14px -8px #007da3,14px -8px 15px -8px #e7a77f,-11px 14px 15px -14px #e97047'
                  : '0px',
                animation: 'animateGradient 10s infinite linear alternate',
                ...getGradientColor(summerBrandGradient),
                backgroundSize: '400px',
                '@keyframes animateGradient': {
                  '0%': {
                    backgroundPositionX: '50px',
                  },
                  '100%': {
                    backgroundPositionX: '-160px',
                  },
                },
              }}
              onClick={
                requiredItems && !baseRaysChallengeData?.alreadyClaimed
                  ? explodeRaysHandler
                  : () => null
              }
            >
              <Icon icon={rays} color="primary60" sx={{ mr: 3 }} />
              Claim {dailyRaysAmount} Rays now
            </Button>
          ) : (
            <FunctionalContextHandler>
              <SignTosComponent wallet={wallet?.address} />
            </FunctionalContextHandler>
          )}
        </Box>
        {userError && (
          <Text as="p" variant="paragraph3" color="warning100" sx={{ mt: 3 }}>
            Something went wrong. Please try again.
          </Text>
        )}
      </Box>
      <Divider sx={{ mb: 3 }} />
    </>
  )
}

export const PortfolioDailyRaysNotAUser = () => {
  return (
    <>
      <PortfolioDailyRaysHeader />
      <Box sx={{ mt: 3, mb: 3 }}>
        <Image
          src={staticFilesRuntimeUrl(`/static/img/daily-rays-not-a-user-banner.svg`)}
          sx={{ width: '100%', margin: '0 auto', borderRadius: 'large' }}
        />
        <Text variant="paragraph3" color="neutral80" sx={{ mt: 3 }}>
          To earn daily rays you need to have a position. Claim Rays for 7 days in a row and get a
          special 30 Rays bonus.
        </Text>
        <AppLink href="/earn">
          <Button variant="primary" sx={{ fontSize: 1, py: 1, px: 4, mt: 3 }}>
            Get started
          </Button>
        </AppLink>
      </Box>
      <Divider sx={{ mb: 3 }} />
    </>
  )
}
