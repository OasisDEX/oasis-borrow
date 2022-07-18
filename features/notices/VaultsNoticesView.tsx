import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { Notice } from 'components/Notice'
import { ReclaimCollateralButton } from 'features/reclaimCollateral/reclaimCollateralView'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import moment from 'moment'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useMemo, useState } from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { Box, Flex, Grid, Heading, SxStyleProp, Text } from 'theme-ui'

import { useTheme } from '../../theme/useThemeUI'
import { VaultNoticesState } from './vaultsNotices'

type VaultNoticeProps = {
  status?: JSX.Element
  header: JSX.Element | string
  subheader?: JSX.Element | string | false
  withClose?: boolean
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

export function VaultNotice({
  status,
  header,
  subheader,
  color,
  withClose = true,
}: VaultNoticeProps & { color: string }) {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <>
      {isVisible && (
        <Notice close={() => setIsVisible(false)} withClose={withClose}>
          <Flex sx={{ py: 2, pr: [2, 5] }}>
            {status && <Box sx={{ mr: 4, flexShrink: 0 }}>{status}</Box>}
            <Grid gap={2} sx={{ alignItems: 'center' }}>
              <Heading as="h3" sx={{ color, wordBreak: 'normal' }}>
                {header}
              </Heading>
              {subheader && (
                <Text variant="subheader" as="span" sx={{ wordBreak: 'normal' }}>
                  {subheader}
                </Text>
              )}
            </Grid>
          </Flex>
        </Notice>
      )}
    </>
  )
}

export function VaultLiquidatingNextPriceNotice({
  id,
  token,
  isVaultController,
  controller,
  dateNextCollateralPrice,
}: Pick<
  VaultNoticesState,
  'id' | 'token' | 'isVaultController' | 'controller' | 'dateNextCollateralPrice'
>) {
  const { t } = useTranslation()

  const headerTranslationOptions = {
    collateral: token.toUpperCase(),
    id: id.toString(),
  }

  return (
    <VaultNotice
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
                <Text sx={{ lineHeight: 'tight', fontSize: 1, color: 'neutral80Alt' }}>mins</Text>
              </Box>
            }
          />
        ),
        [dateNextCollateralPrice!],
      )}
      header={`${
        isVaultController
          ? t('vault-notices.liquidating.header1', headerTranslationOptions)
          : t('vault-notices.liquidating.header2', headerTranslationOptions)
      }`}
      subheader={`
        ${t('vault-notices.liquidating.subheader1', { collateral: token.toUpperCase() })}
        ${
          !isVaultController && controller
            ? t('vault-notices.liquidating.subheader2', { address: formatAddress(controller) })
            : t('vault-notices.liquidating.subheader1')
        }
      `}
      color="banner.warning"
    />
  )
}

export function VaultOwnershipBanner({
  controller,
  account,
}: Pick<VaultNoticesState, 'controller' | 'account'>) {
  const { t } = useTranslation()

  if (!controller) return null
  return (
    <VaultNotice
      status={
        <StatusFrame>
          <Icon size="auto" width="24" height="24" name="bannerWallet" />
        </StatusFrame>
      }
      header={t('vault-notices.ownership.header', { address: formatAddress(controller) })}
      subheader={
        !account ? (
          `${t('vault-notices.ownership.subheader1')}`
        ) : (
          <Text>
            {t('vault-notices.ownership.subheader2')}{' '}
            <AppLink href={`/owner/${account}`} target="_blank">
              {t('here')}
            </AppLink>
          </Text>
        )
      }
      color="banner.muted"
    />
  )
}

export function VaultOverviewOwnershipNotice({
  controller,
  account,
}: {
  controller: string
  account: string
}) {
  const { t } = useTranslation()

  return (
    <VaultNotice
      status={
        <StatusFrame>
          <Icon size="auto" width="24" height="24" name="bannerWallet" />
        </StatusFrame>
      }
      header={t('vaults-overview.banner-header', { address: formatAddress(controller) })}
      subheader={
        <Text>
          {t('vaults-overview.banner-content')}{' '}
          <AppLink href={`/owner/${account}`} target="_blank">
            {t('here')}
          </AppLink>
        </Text>
      }
      color="banner.muted"
    />
  )
}

export function VaultLiquidatingNotice({
  id,
  token,
  isVaultController,
  controller,
}: Pick<VaultNoticesState, 'id' | 'token' | 'isVaultController' | 'controller'>) {
  const { t } = useTranslation()

  const headerTranslationOptions = {
    collateral: token.toUpperCase(),
    id: id.toString(),
  }

  const header = isVaultController
    ? t('vault-notices.liquidating.header1', headerTranslationOptions)
    : t('vault-notices.liquidating.header2', headerTranslationOptions)

  const subheader = isVaultController
    ? t('vault-notices.liquidating.subheader3')
    : t('vault-notices.liquidating.subheader2', { address: controller })

  return (
    <VaultNotice
      status={
        <>
          <StatusFrame
            sx={{
              borderColor: 'banner.dangerBorder',
            }}
          >
            <Icon size="auto" height="24" width="6" name="exclamationMark" color="banner.danger" />
          </StatusFrame>
        </>
      }
      header={header}
      subheader={subheader}
      color="banner.danger"
    />
  )
}

export function VaultLiquidatedNotice({
  unlockedCollateral,
  isVaultController,
  controller,
  token,
  id,
}: Pick<
  VaultNoticesState,
  'unlockedCollateral' | 'controller' | 'token' | 'id' | 'isVaultController'
>) {
  const { t } = useTranslation()

  const header = isVaultController
    ? t('vault-notices.liquidated.header1')
    : t('vault-notices.liquidated.header2')

  const fallbackSubheader = controller
    ? `${t('vault-notices.liquidated.subheader3')} ${t('vault-notices.liquidated.subheader4', {
        address: formatAddress(controller),
      })}`
    : t('vault-notices.liquidated.subheader3')

  const subheader =
    unlockedCollateral.gt(zero) &&
    (isVaultController ? (
      <>
        <Text sx={{ mb: 3 }}>
          {t('vault-notices.liquidated.subheader1')}{' '}
          {t('vault-notices.liquidated.subheader2', {
            amount: formatCryptoBalance(unlockedCollateral),
            collateral: token.toUpperCase(),
          })}
        </Text>
        <ReclaimCollateralButton {...{ token, id, amount: unlockedCollateral }} />
      </>
    ) : (
      fallbackSubheader
    ))

  return (
    <VaultNotice
      status={
        <>
          <StatusFrame
            sx={{
              borderColor: 'banner.dangerBorder',
            }}
          >
            <Icon size="auto" height="24" width="6" name="exclamationMark" color="banner.danger" />
          </StatusFrame>
        </>
      }
      header={header}
      subheader={subheader}
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

  const { theme } = useTheme()

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
        [theme.colors?.counter.primary, 0],
        [theme.colors.counter.secondary, 0],
      ]}
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
            setConfig(({ key: _key }) => ({
              key: _key - 1,
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
            <Text sx={{ lineHeight: '1.0', fontSize: 1, color: 'neutral80Alt' }}>mins</Text>
          </Box>
        )
      }}
    </CountdownCircleTimer>
  )
}

export function VaultNoticesView({ id }: { id: BigNumber }) {
  const { vaultBanners$ } = useAppContext()
  const [vaultBanners] = useObservable(vaultBanners$(id))

  if (!vaultBanners) return null

  const {
    token,
    dateNextCollateralPrice,
    account,
    controller,
    unlockedCollateral,
    banner,
    isVaultController,
  } = vaultBanners

  switch (banner) {
    case 'liquidated':
      return (
        <VaultLiquidatedNotice
          {...{
            unlockedCollateral,
            token,
            isVaultController,
            controller,
            id,
          }}
        />
      )
    case 'liquidating':
      return <VaultLiquidatingNotice {...{ token, id, controller, isVaultController }} />
    case 'ownership':
      return <VaultOwnershipBanner {...{ account, controller }} />
    case 'liquidatingNextPrice':
      return (
        <VaultLiquidatingNextPriceNotice
          {...{ token, id, dateNextCollateralPrice, isVaultController, controller }}
        />
      )
    default:
      return null
  }
}
