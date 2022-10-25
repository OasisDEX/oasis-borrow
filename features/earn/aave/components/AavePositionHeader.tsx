import { RiskRatio } from '@oasisdex/oasis-actions'
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
import { AavePositionHeaderPropsBase } from '../../../aave/common/StrategyConfigTypes'
import { aaveStETHMinimumRiskRatio } from '../../../aave/constants'
import { AaveStEthYieldsResponse } from '../../../aave/open/services'

export function AavePositionHeader({
  maxRisk,
  strategyName,
  aaveTVL,
  noDetails = false,
}: AavePositionHeaderPropsBase) {
  const { t } = useTranslation()
  const tokenPairList = {
    stETHeth: {
      name: t('open-earn.aave.product-header.token-pair-list.aave-steth-eth'),
      tokenList: ['AAVE', 'STETH', 'ETH'],
    },
  } as Record<string, { name: string; tokenList: string[] }>

  const tokenData = tokenPairList[strategyName]
  if (noDetails && (!maxRisk || !aaveTVL)) {
    // this should never change during runtime
    return <VaultHeadline header={tokenData.name} token={tokenData.tokenList} details={[]} />
  }

  const [minYields, setMinYields] = useState<AaveStEthYieldsResponse | undefined>(undefined)
  const [maxYields, setMaxYields] = useState<AaveStEthYieldsResponse | undefined>(undefined)

  const { aaveSthEthYieldsQuery } = useAaveContext()

  useEffect(() => {
    async function fetchYields() {
      return await aaveSthEthYieldsQuery(aaveStETHMinimumRiskRatio, ['7Days'])
    }
    fetchYields().then(setMinYields)
  }, [])

  useEffect(() => {
    async function fetchYields() {
      return await aaveSthEthYieldsQuery(maxRisk || aaveStETHMinimumRiskRatio, [
        '7Days',
        '7DaysOffset',
        '90Days',
        '90DaysOffset',
      ])
    }
    fetchYields().then(setMaxYields)
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
      header={tokenPairList[strategyName].name}
      token={tokenPairList[strategyName].tokenList}
      details={headlineDetails}
      loading={!aaveTVL?.totalValueLocked}
    />
  )
}

export function AavePositionHeaderWithDetails({ strategyName }: { strategyName: string }) {
  const { aaveTotalValueLocked$, aaveReserveStEthData$ } = useAaveContext()
  const [tvlState, tvlStateError] = useObservable(aaveTotalValueLocked$)
  const [aaveReserveConfigData, aaveReserveConfigDataError] = useObservable(aaveReserveStEthData$)

  return (
    <WithErrorHandler error={[tvlStateError, aaveReserveConfigDataError]}>
      <WithLoadingIndicator value={[tvlState, aaveReserveConfigData]} customLoader={<AppSpinner />}>
        {([_tvlState, _aaveReserveConfigData]) => (
          <AavePositionHeader
            maxRisk={new RiskRatio(_aaveReserveConfigData.ltv, RiskRatio.TYPE.LTV)}
            strategyName={strategyName}
            aaveTVL={_tvlState}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
