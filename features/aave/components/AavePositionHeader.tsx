import type { IRiskRatio } from '@oasisdex/dma-library'
import { RiskRatio } from '@oasisdex/dma-library'
import type { Protocol } from '@prisma/client'
import type BigNumber from 'bignumber.js'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { useAaveContext } from 'features/aave'
import { createFollowButton } from 'features/aave/helpers/createFollowButton'
import { useAaveEarnYields } from 'features/aave/hooks'
import type { IStrategyConfig, ManageAaveHeaderProps } from 'features/aave/types'
import type { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
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
  maxRisk?: IRiskRatio
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
    ['7Days'],
  )
  const maxYields = useAaveEarnYields(
    !isSparkProtocol ? maxRisk || minimumRiskRatio : undefined,
    strategy.protocol,
    strategy.network,
    ['7Days', '7DaysOffset', '90Days', '90DaysOffset'],
  )

  const headlineDetails = []
  if (minYields && maxYields) {
    const formatYield = (yieldVal: BigNumber) =>
      formatPercent(yieldVal, {
        precision: 2,
      })

    if (has7daysYield(minYields, false) && has7daysYield(maxYields)) {
      const yield7DaysMin = minYields.annualisedYield7days ?? zero
      const yield7DaysMax = maxYields.annualisedYield7days ?? zero

      const yield7DaysDiff = maxYields.annualisedYield7days.minus(
        maxYields.annualisedYield7daysOffset,
      )

      headlineDetails.push({
        label: t('open-earn.aave.product-header.current-yield'),
        value: `${formatYield(yield7DaysMin).toString()} - ${formatYield(
          yield7DaysMax,
        ).toString()}`,
        sub: formatPercent(yield7DaysDiff, {
          precision: 2,
          plus: true,
        }),
        subColor: getPriceChangeColor({
          collateralPricePercentageChange: yield7DaysDiff,
        }),
      })
    } else {
      headlineDetails.push({
        label: t('open-earn.aave.product-header.current-yield'),
        value: `n/a`,
      })
    }
  }

  if (maxYields && has90daysYield(maxYields)) {
    const yield90DaysDiff = maxYields.annualisedYield90daysOffset.minus(
      maxYields.annualisedYield90days,
    )
    headlineDetails.push({
      label: t('open-earn.aave.product-header.90-day-avg-yield'),
      value: formatPercent(maxYields.annualisedYield90days, {
        precision: 2,
      }),
      sub: formatPercent(yield90DaysDiff, {
        precision: 2,
        plus: true,
      }),
      subColor: getPriceChangeColor({
        collateralPricePercentageChange: yield90DaysDiff,
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
