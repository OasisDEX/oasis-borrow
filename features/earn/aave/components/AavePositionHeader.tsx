import { IRiskRatio, RiskRatio } from '@oasisdex/oasis-actions'
import { Protocol } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { useAaveEarnYields } from 'features/aave/common/hooks'
import { IStrategyConfig, ManageAaveHeaderProps } from 'features/aave/common/StrategyConfigTypes'
import { createFollowButton } from 'features/aave/helpers/createFollowButton'
import { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { PreparedAaveTotalValueLocked } from 'lendingProtocols/aave-v2/pipelines'
import { useTranslation } from 'next-i18next'
import React from 'react'

const tokenPairList = {
  stETHeth: {
    translationKey: 'open-earn.aave.product-header.token-pair-list.aave-steth-eth',
    tokenList: ['AAVE', 'STETH', 'ETH'],
  },
  wstETHeth: {
    translationKey: 'open-earn.aave.product-header.token-pair-list.aave-wsteth-eth',
    tokenList: ['AAVE', 'WSTETH', 'ETH'],
  },
} as Record<string, { translationKey: string; tokenList: string[] }>

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

  const minYields = useAaveEarnYields(minimumRiskRatio, strategy.protocol, ['7Days'])
  const maxYields = useAaveEarnYields(maxRisk || minimumRiskRatio, strategy.protocol, [
    '7Days',
    '7DaysOffset',
    '90Days',
    '90DaysOffset',
  ])

  const headlineDetails = []
  if (minYields && maxYields) {
    const formatYield = (yieldVal: BigNumber) =>
      formatPercent(yieldVal, {
        precision: 2,
      })
    const yield7DaysMin = minYields.annualisedYield7days!
    const yield7DaysMax = maxYields.annualisedYield7days!

    const yield7DaysDiff = maxYields.annualisedYield7days!.minus(
      maxYields.annualisedYield7daysOffset!,
    )

    headlineDetails.push({
      label: t('open-earn.aave.product-header.current-yield'),
      value: `${formatYield(yield7DaysMin).toString()} - ${formatYield(yield7DaysMax).toString()}`,
      sub: formatPercent(yield7DaysDiff, {
        precision: 2,
        plus: true,
      }),
      subColor: getPriceChangeColor({
        collateralPricePercentageChange: yield7DaysDiff,
      }),
    })
  }
  if (maxYields?.annualisedYield90days) {
    const yield90DaysDiff = maxYields.annualisedYield90daysOffset!.minus(
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
  }

  aaveTVL?.totalValueLocked &&
    headlineDetails.push({
      label: t('open-earn.aave.product-header.total-value-locked'),
      value: formatCryptoBalance(aaveTVL.totalValueLocked),
    })

  return (
    <VaultHeadline
      header={t(tokenPairList[strategy.name].translationKey)}
      token={tokenPairList[strategy.name].tokenList}
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
    const { aaveTotalValueLocked$, aaveReserveConfigurationData$ } = useAaveContext(
      strategyConfig.protocol,
    )
    const [tvlState, tvlStateError] = useObservable(aaveTotalValueLocked$)
    const [aaveReserveConfigData, aaveReserveConfigDataError] = useObservable(
      aaveReserveConfigurationData$({ token: strategyConfig.tokens.collateral }),
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
  const tokenData = tokenPairList[strategyConfig.name]
  const { protocol } = strategyConfig
  const followButton: FollowButtonControlProps | undefined = createFollowButton(
    positionId,
    protocol.toLowerCase() as Protocol,
  )
  return (
    <VaultHeadline
      header={t(tokenData.translationKey)}
      token={tokenData.tokenList}
      details={[]}
      followButton={followButton}
      shareButton
    />
  )
}
