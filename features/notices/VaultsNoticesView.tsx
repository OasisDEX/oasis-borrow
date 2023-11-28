import { useActor } from '@xstate/react'
import type BigNumber from 'bignumber.js'
import { ensureIsSupportedAaveV3NetworkId } from 'blockchain/aave-v3'
import { networksByName } from 'blockchain/networks'
import { useProductContext } from 'components/context/ProductContextProvider'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { Notice } from 'components/Notice'
import dayjs from 'dayjs'
import { useManageAaveStateMachineContext } from 'features/aave/manage/contexts'
import type { ManageAaveStateMachine } from 'features/aave/manage/state'
import { getAaveNoticeBanner, getLiquidatedHeaderNotice } from 'features/notices/helpers'
import { ReclaimCollateralButton } from 'features/reclaimCollateral/reclaimCollateralView'
import type { ProtocolsServices } from 'helpers/context/types'
import {
  formatAddress,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { getPortfolioLink } from 'helpers/get-portfolio-link'
import { useObservable } from 'helpers/observableHook'
import type { TranslateStringType } from 'helpers/translateStringType'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import type { PropsWithChildren } from 'react'
import React, { useEffect, useMemo, useState } from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { bannerWallet, exclamationMark } from 'theme/icons'
import { useTheme } from 'theme/useThemeUI'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'
import type { LiquidationCallEvent as AaveLiquidationCallEventV2 } from 'types/ethers-contracts/AaveV2LendingPool'
import type { LiquidationCallEvent as AaveLiquidationCallEventV3 } from 'types/ethers-contracts/AaveV3Pool'
import type { StateFrom } from 'xstate'

import type { VaultNoticesState } from './vaultsNotices'

type VaultNoticeProps = {
  status?: JSX.Element
  header: JSX.Element | TranslateStringType
  subheader?: JSX.Element | TranslateStringType | false
  withClose?: boolean
}

function StatusFrame({ children, sx }: PropsWithChildren<{ sx?: ThemeUIStyleObject }>) {
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
  mb = 0,
}: VaultNoticeProps & { color: string; mb?: number }) {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <>
      {isVisible && (
        <Notice close={() => setIsVisible(false)} withClose={withClose} sx={{ mb }}>
          <Flex sx={{ py: 2, pr: [2, 5] }}>
            {status && <Box sx={{ mr: 4, flexShrink: 0 }}>{status}</Box>}
            <Grid gap={2} sx={{ alignItems: 'center' }}>
              <Heading as="h3" sx={{ color, wordBreak: 'normal' }}>
                {header}
              </Heading>
              {subheader && (
                <Text variant="paragraph2" as="p" sx={{ wordBreak: 'normal' }}>
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
                  sx={{ lineHeight: 'tight', fontWeight: 'semiBold', color: 'warning100' }}
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
      color="warning100"
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
          <Icon size="auto" width="24" height="24" icon={bannerWallet} />
        </StatusFrame>
      }
      header={t('vault-notices.ownership.header', { address: formatAddress(controller) })}
      subheader={
        !account ? (
          `${t('vault-notices.ownership.subheader1')}`
        ) : (
          <Text as="span">
            {t('vault-notices.ownership.subheader2')}{' '}
            <AppLink href={getPortfolioLink(account)} target="_blank" sx={{ fontSize: 3 }}>
              {t('here')}
            </AppLink>
          </Text>
        )
      }
      color="primary100"
    />
  )
}

function PositionOwnershipBanner({
  account,
  connectedWalletAddress,
}: {
  account: string
  connectedWalletAddress?: string
}) {
  const { t } = useTranslation()
  return (
    <VaultNotice
      status={
        <StatusFrame>
          <Icon size="auto" width="24" height="24" icon={bannerWallet} />
        </StatusFrame>
      }
      header={t('vault-notices.position.header', { address: formatAddress(account) })}
      subheader={
        !connectedWalletAddress ? (
          t('vault-notices.position.subheader1')
        ) : (
          <Text>
            {t('vault-notices.position.subheader2')}{' '}
            <AppLink href={getPortfolioLink(connectedWalletAddress)} target="_blank">
              {t('here')}
            </AppLink>
          </Text>
        )
      }
      color="primary100"
      mb={4}
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
          <Icon size="auto" width="24" height="24" icon={bannerWallet} />
        </StatusFrame>
      }
      header={t('vaults-overview.banner-header', { address: formatAddress(controller) })}
      subheader={
        <Text>
          {t('vaults-overview.banner-content')}{' '}
          <AppLink href={getPortfolioLink(account)} internalInNewTab={true} sx={{ fontSize: 3 }}>
            {t('here')}
          </AppLink>
        </Text>
      }
      color="primary100"
    />
  )
}

function DangerStatusFrame() {
  return (
    <StatusFrame
      sx={{
        borderColor: 'critical10',
      }}
    >
      <Icon size="auto" height="24" width="6" icon={exclamationMark} color="critical100" />
    </StatusFrame>
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
      status={<DangerStatusFrame />}
      header={header}
      subheader={subheader}
      color="critical100"
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

  const header = t(getLiquidatedHeaderNotice(isVaultController), { position: t('maker-vault') })

  const fallbackSubheader = controller
    ? `${t('vault-notices.liquidated.maker.subheader3')} ${t(
        'vault-notices.liquidated.maker.subheader4',
        {
          address: formatAddress(controller),
        },
      )}`
    : t('vault-notices.liquidated.maker.subheader3')

  const subheader =
    unlockedCollateral.gt(zero) &&
    (isVaultController ? (
      <>
        <Text sx={{ mb: 3 }}>
          {t('vault-notices.liquidated.maker.subheader1')}{' '}
          {t('vault-notices.liquidated.maker.subheader2', {
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
      status={<DangerStatusFrame />}
      header={header}
      subheader={subheader}
      color="critical100"
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
    const now = dayjs().unix()
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
            <Heading as="h3" sx={{ lineHeight: '1.0', color: 'warning100' }}>
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
  const { vaultBanners$ } = useProductContext()
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

export function AavePositionAlreadyOpenedNotice() {
  const { t } = useTranslation()
  return (
    <Box sx={{ mb: 4 }}>
      <VaultNotice
        header={t('vault-notices.aave-multi-position.header')}
        subheader={t('vault-notices.aave-multi-position.subheader') as string}
        color="warning100"
        withClose={false}
      />
    </Box>
  )
}

function AaveLiquidatedNotice({ isPositionController }: { isPositionController: boolean }) {
  const { t } = useTranslation()

  const header = t(getLiquidatedHeaderNotice(isPositionController), { position: t('position') })
  const subheader = t('vault-notices.liquidated.aave.subheader1')

  return (
    <VaultNotice
      status={<DangerStatusFrame />}
      header={header}
      subheader={subheader}
      color="critical100"
    />
  )
}

function AavePositionAboveMaxLtvNotice({
  loanToValue,
  maxLoanToValue,
  liquidationThreshold,
}: {
  loanToValue: BigNumber
  maxLoanToValue: BigNumber
  liquidationThreshold: BigNumber
}) {
  const { t } = useTranslation()
  const header = t('vault-notices.above-max-ltv.header')
  const subheader = t('vault-notices.above-max-ltv.subheader', {
    loanToValue: formatDecimalAsPercent(loanToValue),
    maxLoanToValue: formatDecimalAsPercent(maxLoanToValue),
    liquidationThreshold: formatDecimalAsPercent(liquidationThreshold),
  })

  return (
    <VaultNotice
      status={<DangerStatusFrame />}
      header={header}
      subheader={subheader}
      color="critical100"
    />
  )
}

function getProtocolServices(
  { context: { strategyConfig } }: StateFrom<ManageAaveStateMachine>,
  protocols: ProtocolsServices,
) {
  if (strategyConfig.protocol === LendingProtocol.AaveV2) {
    return protocols[strategyConfig.protocol]
  }
  const networkId = networksByName[strategyConfig.network].id
  ensureIsSupportedAaveV3NetworkId(networkId)
  return protocols[strategyConfig.protocol as LendingProtocol.AaveV3][networkId] // this isnt a thing on Spark V3
}

export function AavePositionNoticesView() {
  const { protocols } = useProductContext()
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const { aaveLikeLiquidations$ } = getProtocolServices(state, protocols)
  const preparedAaveLiquidations$ = aaveLikeLiquidations$({
    proxyAddress: state.context.proxyAddress || '',
  })
  const [aaveLiquidations] = useObservable(preparedAaveLiquidations$)

  if (
    !state.context.currentPosition ||
    !state.context.proxyAddress ||
    !state.context.ownerAddress
  ) {
    return null
  }

  const {
    context: {
      connectedProxyAddress,
      web3Context,
      ownerAddress,
      currentPosition: {
        category: { maxLoanToValue, liquidationThreshold },
        riskRatio: { loanToValue },
      },
    },
  } = state

  const isPositionController = ownerAddress === web3Context?.account

  const banner = getAaveNoticeBanner({
    loanToValue,
    maxLoanToValue,
    liquidationThreshold,
    connectedProxyAddress,
    aaveLiquidations: aaveLiquidations as
      | AaveLiquidationCallEventV3[]
      | AaveLiquidationCallEventV2[], // as this is only for aave
    ownerAddress,
    connectedAddress: web3Context?.account,
  })

  switch (banner) {
    case 'liquidated':
      return <AaveLiquidatedNotice isPositionController={isPositionController} />
    case 'aboveMaxLtv':
      return (
        <AavePositionAboveMaxLtvNotice
          loanToValue={loanToValue}
          maxLoanToValue={maxLoanToValue}
          liquidationThreshold={liquidationThreshold}
        />
      )
    case 'ownership':
      return (
        <PositionOwnershipBanner
          account={ownerAddress}
          connectedWalletAddress={web3Context?.account}
        />
      )
    default:
      return null
  }
}
