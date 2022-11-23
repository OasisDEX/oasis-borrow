import BigNumber from 'bignumber.js'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { StrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { formatAmount } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AaveMultiplyHeader({ strategyConfig }: { strategyConfig: StrategyConfig }) {
  const { t } = useTranslation()
  const { aaveSTETHUSDCPrices$, getChainlinkUSDCUSDPrice$ } = useAaveContext()
  const [aaveSTETHUSDCPrices] = useObservable(aaveSTETHUSDCPrices$)
  const [chainlinkUSDCUSDPrice] = useObservable(getChainlinkUSDCUSDPrice$())
  const detailsList: HeadlineDetailsProp[] = []
  if (aaveSTETHUSDCPrices && chainlinkUSDCUSDPrice) {
    const [USDCPrice, STETHPrice] = aaveSTETHUSDCPrices as BigNumber[]

    detailsList.push(
      {
        label: 'Current stETH Price',
        value: `$${formatAmount(STETHPrice.div(USDCPrice).times(chainlinkUSDCUSDPrice), 'USD')}`,
      },
      {
        label: 'Current USDC Price',
        value: `$${formatAmount(new BigNumber(chainlinkUSDCUSDPrice), 'USDC')}`,
      },
    )
  }

  return (
    <VaultHeadline
      header={t('vault.header-aave-open', { ...strategyConfig.tokens })}
      token={[strategyConfig.tokens.collateral, strategyConfig.tokens.debt]}
      loading={!aaveSTETHUSDCPrices}
      details={detailsList}
    />
  )
}
