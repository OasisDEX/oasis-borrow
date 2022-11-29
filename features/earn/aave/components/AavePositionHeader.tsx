import { IRiskRatio, RiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatHugeNumbersToShortHuman, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'

import { useAaveContext } from '../../../aave/AaveContextProvider'
import { AaveStEthYieldsResponse } from '../../../aave/common'
import { AaveHeaderProps, StrategyConfig } from '../../../aave/common/StrategyConfigTypes'
import { PreparedAaveTotalValueLocked } from '../../../aave/helpers/aavePrepareAaveTotalValueLocked'

const tokenPairList = {
  stETHeth: {
    translationKey: 'open-earn.aave.product-header.token-pair-list.aave-steth-eth',
    tokenList: ['AAVE', 'STETH', 'ETH'],
  },
} as Record<string, { translationKey: string; tokenList: string[] }>

function AavePositionHeader({
  maxRisk,
  strategyName,
  aaveTVL,
  minimumRiskRatio,
}: {
  maxRisk?: IRiskRatio
  strategyName: string
  aaveTVL?: PreparedAaveTotalValueLocked
  minimumRiskRatio: IRiskRatio
}) {
  const { t } = useTranslation()

  const [minYields, setMinYields] = useState<AaveStEthYieldsResponse | undefined>(undefined)
  const [maxYields, setMaxYields] = useState<AaveStEthYieldsResponse | undefined>(undefined)

  const { aaveSthEthYieldsQuery } = useAaveContext()

  useEffect(() => {
    async function fetchYields() {
      return await aaveSthEthYieldsQuery(minimumRiskRatio, ['7Days'])
    }
    void fetchYields().then(setMinYields)
  }, [])

  useEffect(() => {
    async function fetchYields() {
      return await aaveSthEthYieldsQuery(maxRisk || minimumRiskRatio, [
        '7Days',
        '7DaysOffset',
        '90Days',
        '90DaysOffset',
      ])
    }
    void fetchYields().then(setMaxYields)
  }, [maxRisk?.toString()])

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
      value: formatHugeNumbersToShortHuman(aaveTVL.totalValueLocked),
    })

  return (
    <VaultHeadline
      header={t(tokenPairList[strategyName].translationKey)}
      token={tokenPairList[strategyName].tokenList}
      details={headlineDetails}
      loading={!aaveTVL?.totalValueLocked}
    />
  )
}

export function headerWithDetails(minimumRiskRatio: IRiskRatio) {
  return function AavePositionHeaderWithDetails({
    strategyConfig,
  }: {
    strategyConfig: StrategyConfig
  }) {
    const { aaveTotalValueLocked$, aaveReserveConfiguration } = useAaveContext()
    const [tvlState, tvlStateError] = useObservable(aaveTotalValueLocked$)
    const [aaveReserveConfigData, aaveReserveConfigDataError] = useObservable(
      aaveReserveConfiguration[strategyConfig.tokens.collateral],
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
              strategyName={strategyConfig.name}
              aaveTVL={_tvlState}
              minimumRiskRatio={minimumRiskRatio}
            />
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    )
  }
}

export function AavePositionHeaderNoDetails({ strategyConfig }: AaveHeaderProps) {
  const { t } = useTranslation()
  const tokenData = tokenPairList[strategyConfig.name]
  return (
    <VaultHeadline header={t(tokenData.translationKey)} token={tokenData.tokenList} details={[]} />
  )
}
