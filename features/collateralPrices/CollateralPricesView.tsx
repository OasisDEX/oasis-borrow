import { useAppContext } from 'components/AppContextProvider'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useObservableWithError } from 'helpers/observableHook'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { CollateralPrice, CollateralPrices } from './collateralPrices'

function CollateralPricesRow({
  token,
  currentPrice,
  nextPrice,
  percentageChange,
  currentPriceUpdate,
  nextPriceUpdate,
  isStaticPrice,
}: CollateralPrice) {
  return (
    <>
      <Text>{token} </Text>
      <Text>${formatAmount(currentPrice, 'USD')}</Text>
      <Text>${formatAmount(nextPrice, 'USD')}</Text>
      <Text>
        {formatPercent(percentageChange.times(100), {
          precision: 4,
          plus: true,
        })}
      </Text>
      <Text>
        {currentPriceUpdate
          ? `${currentPriceUpdate.toLocaleDateString()} ${currentPriceUpdate.toLocaleTimeString()}`
          : '--'}
      </Text>
      <Text>
        {nextPriceUpdate
          ? `${nextPriceUpdate.toLocaleDateString()} ${nextPriceUpdate.toLocaleTimeString()}`
          : '--'}
      </Text>
      <Text>{isStaticPrice ? 'DSvalue' : 'OSM'}</Text>
    </>
  )
}

function CollateralPricesHeader() {
  return (
    <>
      {[
        'Token',
        'Current Price',
        'Next Price',
        '% Change',
        'Last Update',
        'Next Update',
        'Oracle Type',
      ].map((colHeader, idx) => (
        <Text key={`collateralPricesHeader-${idx}`} mb={4}>
          {colHeader}
        </Text>
      ))}
    </>
  )
}

function CollateralPricesTable({ collateralPrices }: { collateralPrices: CollateralPrices }) {
  return (
    <Grid columns="auto auto auto auto auto auto auto" sx={{ width: '100%' }}>
      <CollateralPricesHeader />
      {collateralPrices.map((collateralPrice, idx) => (
        <CollateralPricesRow key={`collateralPricesRow-${idx}`} {...collateralPrice} />
      ))}
    </Grid>
  )
}

export function CollateralPricesView() {
  const { collateralPrices$ } = useAppContext()
  const collateralPricesWithError = useObservableWithError(collateralPrices$)

  return (
    <WithLoadingIndicator {...collateralPricesWithError}>
      {(collateralPrices) => <CollateralPricesTable {...{ collateralPrices }} />}
    </WithLoadingIndicator>
  )
}
