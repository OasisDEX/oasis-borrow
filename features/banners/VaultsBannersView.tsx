import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { Banner } from 'components/Banner'
import { AppLink } from 'components/Links'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { Box, Flex, Grid, Heading, SxStyleProp, Text, useThemeUI } from 'theme-ui'

type VaultBannerProps = {
  status: JSX.Element
  header: JSX.Element | string
  subheader?: JSX.Element | string | false
}

function StatusFrame({ children, sx }: WithChildren & { sx?: SxStyleProp }) {
  return (
    <Flex
      sx={{
        border: 'bold',
        borderRadius: 'circle',
        width: '56px',
        height: '56px',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      {children}
    </Flex>
  )
}
export function VaultBanner({
  status,
  header,
  subheader,
  color,
}: VaultBannerProps & { color: string }) {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <>
      {isVisible && (
        <Banner close={() => setIsVisible(false)}>
          <Flex sx={{ py: 2, pr: 5 }}>
            <Box sx={{ mr: 4 }}>{status}</Box>
            <Grid gap={2} sx={{ alignItems: 'center' }}>
              <Heading as="h3" sx={{ color }}>
                {header}
              </Heading>
              {subheader && <Text variant="subheader">{subheader}</Text>}
            </Grid>
          </Flex>
        </Banner>
      )}
    </>
  )
}

export function VaultWarningBanner({
  id,
  token,
  dateNextCollateralPrice,
}: {
  id: string
  token: string
  dateNextCollateralPrice: Date | undefined
}) {
  return (
    <VaultBanner
      status={useMemo(
        () => (
          <VaultNextPriceUpdateCounter
            nextPriceUpdateDate={dateNextCollateralPrice!}
            threshold={120}
            thresholdReachedLabel={
              <Box sx={{ textAlign: 'center' }}>
                <Heading
                  as="h3"
                  sx={{ lineHeight: 'tight', fontWeight: 'semiBold', color: 'banner.warning' }}
                >
                  {'<2'}
                </Heading>
                <Text sx={{ lineHeight: 'tight', fontSize: 1, color: 'mutedAlt' }}>mins</Text>
              </Box>
            }
          />
        ),
        [dateNextCollateralPrice!],
      )}
      header={`${token.toUpperCase()} Vault #${id} about to get liquidated`}
      subheader={`
        The next price will cause a liquidation on this Vault. You can still save your Vault from
        liquidation by adding collateral or pay back DAI.
      `}
      color="banner.warning"
    />
  )
}

export function VaultMutedBanner({ address, account }: { address: string; account?: string }) {
  return (
    <VaultBanner
      status={
        <StatusFrame>
          <Icon size="auto" width="24" height="24" name="bannerWallet" />
        </StatusFrame>
      }
      header={`You are viewing ${formatAddress(address)} Vault`}
      subheader={
        !account ? (
          `Please connect your wallet to open, manage or view your Vaults.`
        ) : (
          <Text>
            You can view your vaults{' '}
            <AppLink href={`/owner/${account}`} target="_blank">
              here
            </AppLink>
          </Text>
        )
      }
      color="banner.muted"
    />
  )
}

export function VaultDangerBanner({
  unlockedCollateral,
  token,
}: {
  unlockedCollateral: BigNumber
  token: string
}) {
  return (
    <VaultBanner
      status={
        <>
          <StatusFrame
            sx={{
              borderColor: '#FBE1D9',
            }}
          >
            <Icon size="auto" height="24" width="6" name="exclamationMark" color="banner.danger" />
          </StatusFrame>
        </>
      }
      header={`Your Vault got liquidated`}
      subheader={
        unlockedCollateral.gt(zero) &&
        `A liquidation has happened on this Vault. Reclaim ${formatCryptoBalance(
          unlockedCollateral,
        )} ${token.toUpperCase()}`
      }
      color="banner.danger"
    />
  )
}

interface VaultNextPriceUpdateCounterProps {
  nextPriceUpdateDate: Date
  // Once the counter reaches the threshold it is marked as completed and not more values are updated.
  // Substracts the seconds for the nextPriceUpdateDate
  //  - threshold - number in seconds - .
  threshold?: number
  // Displays the text that will be displayed when the threshold is reached.
  // - thresholdReachedLabel - could be a React components or simple string
  thresholdReachedLabel?: JSX.Element | string
}

export function VaultNextPriceUpdateCounter({
  nextPriceUpdateDate,
  threshold,
  thresholdReachedLabel = threshold?.toString(),
}: VaultNextPriceUpdateCounterProps) {
  const [{ key, duration }, setConfig] = useState({
    key: 0,
    duration: 0,
  })

  const { theme } = useThemeUI()

  useEffect(() => {
    const nextUpdateTimestamp = nextPriceUpdateDate?.getTime()
    const nextUpdateInSeconds = nextUpdateTimestamp ? nextUpdateTimestamp / 1000 : 0
    const now = moment().unix()
    const left = nextUpdateInSeconds - now

    setConfig({
      key: nextUpdateTimestamp,
      duration: left >= 0 ? left : 0,
    })
  }, [nextPriceUpdateDate])

  return (
    <CountdownCircleTimer
      key={key}
      size={56}
      strokeWidth={3}
      colors={[
        // @ts-ignore
        [theme.colors.counter.primary, 0],
        // @ts-ignore
        [theme.colors.counter.secondary, 0],
      ]}
      // @ts-ignore
      trailColor={theme.colors.counter.surface}
      duration={duration}
      isLinearGradient={true}
      isPlaying={!!duration}
    >
      {({ remainingTime }) => {
        const hasHitThreshold =
          threshold &&
          remainingTime !== undefined &&
          remainingTime !== null &&
          remainingTime < threshold

        // Since there is not exposed mechanism to force the countdown to display
        // finished state, it must be forced by setting the counter to 0. That
        // way it will display finished state.
        // Using a new key basically forces the counter to restart. When it restarts the duration
        // is set to 0 so it goes into finished state immediately.
        useEffect(() => {
          if (hasHitThreshold && remainingTime && remainingTime > 0) {
            setConfig(({ key }) => ({
              key: key - 1,
              duration: 0,
            }))
          }
        }, [remainingTime])

        return hasHitThreshold ? (
          thresholdReachedLabel
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Heading as="h3" sx={{ lineHeight: '1.0', color: 'banner.warning' }}>
              {remainingTime && Math.floor(remainingTime / 60)}
            </Heading>
            <Text sx={{ lineHeight: '1.0', fontSize: 1, color: 'mutedAlt' }}>mins</Text>
          </Box>
        )
      }}
    </CountdownCircleTimer>
  )
}

export function VaultBannersView({ id }: { id: BigNumber }) {
  const { vaultBanners$ } = useAppContext()
  const state = useObservable(vaultBanners$(id))
  if (!state) return null

  const {
    token,
    nextCollateralPrice,
    dateNextCollateralPrice,
    liquidationPrice,
    account,
    controller,
    hasBeenLiquidated,
    unlockedCollateral,
  } = state

  // Banner that is displayed when the user had liquidaton on his vault
  if (hasBeenLiquidated) {
    return <VaultDangerBanner {...{ unlockedCollateral, token }} />
  }

  // Banner that is displayed when the user is about to be liquidated on next osm price update
  if (nextCollateralPrice?.lt(liquidationPrice)) {
    return (
      <VaultWarningBanner
        token={token}
        id={id.toString()}
        dateNextCollateralPrice={dateNextCollateralPrice}
      />
    )
  }

  // Banner that is displayed when the user is viewing someone else's vault
  if (!account || account !== controller) {
    return <VaultMutedBanner {...{ account, address: controller }} />
  }

  return null
}
