import type { IRiskRatio } from '@oasisdex/dma-library'
import { RiskRatio } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { useAaveContext } from 'features/aave'
import { useAaveEarnYields } from 'features/aave/hooks'
import type { IStrategyConfig, ManageAaveHeaderProps } from 'features/aave/types'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import { has7daysYield, has90daysYield } from 'lendingProtocols/aave-like-common'
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
  minimumRiskRatio,
}: {
  maxRisk: IRiskRatio
  strategy: IStrategyConfig
  aaveTVL?: PreparedAaveTotalValueLocked
  minimumRiskRatio: IRiskRatio
}) {
  const { t } = useTranslation()

  const isSparkProtocol = strategy.protocol === LendingProtocol.SparkV3

  const minYields = useAaveEarnYields(
    !isSparkProtocol ? minimumRiskRatio : undefined,
    strategy.protocol,
    strategy.network,
  )
  const maxYields = useAaveEarnYields(
    !isSparkProtocol ? maxRisk || minimumRiskRatio : undefined,
    strategy.protocol,
    strategy.network,
  )

  const headlineDetails = []
  if (minYields && maxYields) {
    const formatYield = (yieldVal: BigNumber) =>
      formatPercent(yieldVal, {
        precision: 2,
      })

    if (has7daysYield(minYields) && has7daysYield(maxYields)) {
      const yield7DaysMin = minYields.apy7d ?? zero
      const yield7DaysMax = maxYields.apy7d ?? zero

      headlineDetails.push({
        label: t('open-earn.aave.product-header.current-yield'),
        value: `${formatYield(yield7DaysMin).toString()} - ${formatYield(
          yield7DaysMax,
        ).toString()}`,
      })
    } else {
      headlineDetails.push({
        label: t('open-earn.aave.product-header.current-yield'),
        value: `n/a`,
      })
    }
  }

  if (maxYields && has90daysYield(maxYields)) {
    headlineDetails.push({
      label: t('open-earn.aave.product-header.90-day-avg-yield'),
      value: formatPercent(maxYields.apy90d, {
        precision: 2,
      }),
    })
  } else {
    headlineDetails.push({
      label: t('open-earn.aave.product-header.90-day-avg-yield'),
      value: `n/a`,
    })
  }

  aaveTVL?.totalValueLocked &&
    headlineDetails.push({
      label: t('open-earn.aave.product-header.total-value-locked'),
      value: formatCryptoBalance(aaveTVL.totalValueLocked),
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

export function AavePositionHeaderNoDetails({ strategyConfig }: ManageAaveHeaderProps) {
  const { t } = useTranslation()
  const tokenData = tokenPairList[strategyConfig.protocol][strategyConfig.name]

  return (
    <VaultHeadline
      header={t(tokenData.translationKey)}
      tokens={tokenData.tokenList}
      details={[]}
      shareButton
    />
  )
}
