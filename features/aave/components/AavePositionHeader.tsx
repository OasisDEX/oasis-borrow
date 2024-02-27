import type { IRiskRatio } from '@oasisdex/dma-library'
import { RiskRatio } from '@oasisdex/dma-library'
import type { Protocol } from '@prisma/client'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { useAaveContext } from 'features/aave'
import { createFollowButton } from 'features/aave/helpers/createFollowButton'
import type { IStrategyConfig, ManageAaveHeaderProps } from 'features/aave/types'
import type { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
import { useAaveLikeHeadlineDetails } from 'features/omni-kit/protocols/aave-like/hooks'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import type { PreparedAaveTotalValueLocked } from 'lendingProtocols/aave-v2/pipelines'
import { useTranslation } from 'next-i18next'
import React from 'react'

const tokenPairList = {
  [LendingProtocol.AaveV2]: {
    stETHethV2: {
      translationKey: 'open-earn.aave.product-header.token-pair-list.aave-steth-eth',
      tokenList: ['AAVE', 'STETH', 'ETH'],
    },
    wstETHethV2: {
      translationKey: 'open-earn.aave.product-header.token-pair-list.aave-wsteth-eth',
      tokenList: ['AAVE', 'WSTETH', 'ETH'],
    },
  },
  [LendingProtocol.AaveV3]: {
    stETHethV3: {
      translationKey: 'open-earn.aave.product-header.token-pair-list.aave-steth-eth',
      tokenList: ['AAVE', 'STETH', 'ETH'],
    },
    wstETHethV3: {
      translationKey: 'open-earn.aave.product-header.token-pair-list.aave-wsteth-eth',
      tokenList: ['AAVE', 'WSTETH', 'ETH'],
    },
  },
  [LendingProtocol.SparkV3]: {
    wstethethV3: {
      translationKey: 'open-earn.aave.product-header.token-pair-list.spark-wsteth-eth',
      tokenList: ['SPARK', 'WSTETH', 'ETH'],
    },
    rethethV3: {
      translationKey: 'open-earn.aave.product-header.token-pair-list.spark-reth-eth',
      tokenList: ['SPARK', 'RETH', 'ETH'],
    },
  },
} as Record<
  AaveLikeLendingProtocol,
  Record<string, { translationKey: string; tokenList: string[] }>
>

function AavePositionHeader({
  maxRisk,
  strategy,
  aaveTVL,
}: {
  maxRisk?: IRiskRatio
  strategy: IStrategyConfig
  aaveTVL?: PreparedAaveTotalValueLocked
  minimumRiskRatio: IRiskRatio
}) {
  const { t } = useTranslation()

  const { headlineDetails } = useAaveLikeHeadlineDetails({
    maxRiskRatio: maxRisk,
    protocol: strategy.protocol,
    network: strategy.network,
  })

  return (
    <VaultHeadline
      header={t(tokenPairList[strategy.protocol][strategy.name].translationKey)}
      tokens={tokenPairList[strategy.protocol][strategy.name].tokenList}
      details={headlineDetails}
      loading={!aaveTVL?.totalValueLocked}
    />
  )
}

export function headerWithDetails(minimumRiskRatio: IRiskRatio) {
  return function AavePositionHeaderWithDetails({
    strategyConfig,
  }: {
    strategyConfig: IStrategyConfig
  }) {
    const { aaveTotalValueLocked$, aaveLikeReserveConfigurationData$ } = useAaveContext(
      strategyConfig.protocol,
      strategyConfig.network,
    )
    const [tvlState, tvlStateError] = useObservable(aaveTotalValueLocked$)
    const [aaveReserveConfigData, aaveReserveConfigDataError] = useObservable(
      aaveLikeReserveConfigurationData$({
        collateralToken: strategyConfig.tokens.collateral,
        debtToken: strategyConfig.tokens.debt,
      }),
    )

    return (
      <WithErrorHandler error={[tvlStateError, aaveReserveConfigDataError]}>
        <WithLoadingIndicator
          value={[tvlState, aaveReserveConfigData]}
          customLoader={<AppSpinner />}
        >
          {([_tvlState, _aaveReserveConfigData]) => (
            <AavePositionHeader
              maxRisk={new RiskRatio(_aaveReserveConfigData.ltv, RiskRatio.TYPE.LTV)}
              strategy={strategyConfig}
              aaveTVL={_tvlState}
              minimumRiskRatio={minimumRiskRatio}
            />
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    )
  }
}

export function AavePositionHeaderNoDetails({ strategyConfig, positionId }: ManageAaveHeaderProps) {
  const { t } = useTranslation()
  const tokenData = tokenPairList[strategyConfig.protocol][strategyConfig.name]
  const { protocol } = strategyConfig
  const followButton: FollowButtonControlProps | undefined = createFollowButton(
    positionId,
    protocol.toLowerCase() as Protocol,
  )
  return (
    <VaultHeadline
      header={t(tokenData.translationKey)}
      tokens={tokenData.tokenList}
      details={[]}
      followButton={followButton}
      shareButton
    />
  )
}
