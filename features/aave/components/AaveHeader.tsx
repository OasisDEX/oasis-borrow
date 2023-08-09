import { Protocol } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { ProtocolLabelProps } from 'components/ProtocolLabel'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import { useAaveContext } from 'features/aave'
import { createFollowButton } from 'features/aave/helpers/createFollowButton'
import { IStrategyConfig, ManageAaveHeaderProps } from 'features/aave/types'
import { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAmount } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

function AaveHeader({
  strategyConfig,
  headerLabelString,
  followButton,
  shareButton,
}: {
  strategyConfig: IStrategyConfig
  headerLabelString: string
  followButton?: FollowButtonControlProps
  shareButton?: boolean
}) {
  const { t } = useTranslation()
  const { getAaveAssetsPrices$, chainlinkUSDCUSDOraclePrice$ } = useAaveContext(
    strategyConfig.protocol,
    strategyConfig.network,
  )
  const [positionTokenPrices, positionTokenPricesError] = useObservable(
    getAaveAssetsPrices$({
      tokens: [strategyConfig.tokens.debt, strategyConfig.tokens.collateral],
    }),
  )
  const [chainlinkUSDCUSDPrice, chainlinkUSDCUSDPriceError] = useObservable(
    chainlinkUSDCUSDOraclePrice$,
  )

  const detailsList: HeadlineDetailsProp[] = []
  if (positionTokenPrices && chainlinkUSDCUSDPrice) {
    const [debtTokenPrice, collateralTokenPrice] = positionTokenPrices
    detailsList.push(
      {
        label: t('system.current-token-price', { token: strategyConfig.tokens.collateral }),
        value: `$${formatAmount(
          collateralTokenPrice.div(debtTokenPrice).times(chainlinkUSDCUSDPrice),
          'USD',
        )}`,
      },
      {
        label: t('system.current-token-price', { token: strategyConfig.tokens.debt }),
        value: `$${formatAmount(new BigNumber(chainlinkUSDCUSDPrice), 'USDC')}`,
      },
    )
  }

  const protocol: ProtocolLabelProps = {
    network: strategyConfig.network,
    protocol: strategyConfig.protocol,
  }

  return (
    <WithErrorHandler error={[positionTokenPricesError, chainlinkUSDCUSDPriceError]}>
      <VaultHeadline
        header={t(headerLabelString, { ...strategyConfig.tokens })}
        tokens={[strategyConfig.tokens.collateral, strategyConfig.tokens.debt]}
        loading={!positionTokenPrices}
        details={detailsList}
        followButton={followButton}
        shareButton={shareButton}
        protocol={protocol}
      />
    </WithErrorHandler>
  )
}

export function AaveOpenHeader({ strategyConfig }: { strategyConfig: IStrategyConfig }) {
  return <AaveHeader strategyConfig={strategyConfig} headerLabelString={'vault.header-aave-open'} />
}

export function AaveManageHeader({ strategyConfig, positionId }: ManageAaveHeaderProps) {
  const { protocol } = strategyConfig
  const followButton: FollowButtonControlProps | undefined = createFollowButton(
    positionId,
    protocol.toLowerCase() as Protocol,
  )

  return (
    <AaveHeader
      strategyConfig={strategyConfig}
      headerLabelString={'vault.header-aave-view'}
      followButton={followButton}
      shareButton
    />
  )
}
