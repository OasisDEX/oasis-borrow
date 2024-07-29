import { useMainContext } from 'components/context/MainContextProvider'
import { Icon } from 'components/Icon'
import { SkeletonLine } from 'components/Skeleton'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import type { getRaysDailyChallengeData } from 'handlers/dailyRays'
import { dailyRaysAmount, explodeRays } from 'handlers/dailyRays'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import { useObservable } from 'helpers/observableHook'
import React, { useEffect, useState } from 'react'
import { rays } from 'theme/icons'
import { Box, Button, Flex, Grid, Text } from 'theme-ui'

const flashButton = ({
  setIsExploding,
}: {
  setIsExploding: React.Dispatch<React.SetStateAction<boolean>>
}) =>
  new Promise((resolve) => {
    explodeRays()
    setIsExploding(true)
    setTimeout(() => {
      setIsExploding(false)
      return resolve(null)
    }, 400)
  })

export const PortfolioDailyRays = ({
  refreshUserRaysData,
}: {
  refreshUserRaysData?: () => void
}) => {
  const { connectedContext$ } = useMainContext()
  const [context] = useObservable(connectedContext$)
  const { wallet } = useWalletManagement()
  const [isExploding, setIsExploding] = useState(false)
  const [userError, setUserError] = useState(false)
  const [baseRaysChallengeData, setBaseRaysChallengeData] = useState<
    Partial<ReturnType<typeof getRaysDailyChallengeData>> & {
      message?: string
      loaded: boolean
      alreadyClaimed?: boolean
    }
  >({
    currentStreak: 0,
    dailyChallengeRays: 0,
    loaded: false,
  })
  const [loadingBaseRaysChallengeData, setloadingBaseRaysChallengeData] = useState(false)

  useEffect(() => {
    if (!loadingBaseRaysChallengeData && !baseRaysChallengeData.loaded && wallet?.address) {
      setloadingBaseRaysChallengeData(true)
      void fetch(`/api/daily-challenge?walletAddress=${wallet?.address}`, {
        method: 'GET',
      })
        .then((res) => res.json())
        .then((baseDailyRaysData) => {
          setBaseRaysChallengeData({ ...baseDailyRaysData, loaded: true })
        })
    }
  }, [baseRaysChallengeData, wallet?.address, loadingBaseRaysChallengeData])

  const requiredItems =
    wallet?.address && wallet?.chainId && context?.web3.eth.personal.sign && baseRaysChallengeData

  const dailyRaysCall = (signature: string) => {
    requiredItems &&
      void fetch('/api/daily-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: wallet?.address,
          signature,
          chainId: wallet?.chainId,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.isSignatureValid) {
            refreshUserRaysData && refreshUserRaysData()
            setBaseRaysChallengeData((prev) => ({ ...prev, ...res, loaded: true }))
            !res.alreadyClaimed && void flashButton({ setIsExploding })
          } else {
            setUserError(true)
          }
        })
  }

  const explodeRaysHandler = (_ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setUserError(false)
    void flashButton({ setIsExploding }).then(() => {
      if (requiredItems && baseRaysChallengeData.message) {
        void context?.web3.eth.personal
          .sign(baseRaysChallengeData.message, wallet?.address, '')
          .then(dailyRaysCall)
          .catch(() => setUserError(true))
      }
    })
  }
  return (
    <>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Flex sx={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text variant="boldParagraph2">Rays Daily Challenge</Text>
        </Flex>
      </Flex>
      <Box sx={{ mt: 3, mb: 4 }}>
        <Text as="p" variant="paragraph3" color="neutral80">
          Every day you can claim your Rays. Claim Rays for 7 days in a row and get a special 500
          Rays bonus.
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
          {baseRaysChallengeData.loaded ? (
            <Text variant="boldParagraph3" sx={{ textAlign: 'right' }}>
              {baseRaysChallengeData.currentStreak}{' '}
              {baseRaysChallengeData.currentStreak === 1 ? 'day' : 'days'}
            </Text>
          ) : (
            <SkeletonLine sx={{ justifySelf: 'flex-end' }} height={15} width={50} />
          )}
          <Text variant="paragraph3">Daily challenge Rays</Text>
          <Box as="span" sx={{ textAlign: 'right', justifySelf: 'flex-end' }}>
            {baseRaysChallengeData.loaded ? (
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
          <Button
            variant="outlineSmall"
            // disabled={!requiredItems || baseRaysChallengeData?.alreadyClaimed}
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
        </Box>
        <Text
          as="p"
          variant="paragraph3"
          color="warning100"
          sx={{ mt: 3, opacity: userError ? 1 : 0 }}
        >
          Something went wrong. Please try again.
        </Text>
      </Box>
    </>
  )
}
