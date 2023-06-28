import { PositionTransition } from '@oasisdex/dma-library'
import { Text } from '@theme-ui/components'
import { swapCall } from 'actions/aave'
import BigNumber from 'bignumber.js'
import {
  ensureGivenTokensExist,
  ensurePropertiesExist,
  getNetworkContracts,
} from 'blockchain/contracts'
import { amountFromWei, amountToWei } from 'blockchain/utils'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useMemo, useState } from 'react'

interface PriceImpactProps {
  slippage: BigNumber
  tokens: {
    collateral: string
    debt: string
  }
  transactionParameters: PositionTransition
  strategyConfig: IStrategyConfig
}

export function PriceImpact({
  tokens,
  transactionParameters,
  slippage,
  strategyConfig,
}: PriceImpactProps) {
  const { t } = useTranslation()
  const [marketPrice, setMarketPrice] = useState<BigNumber>(zero)
  const { toTokenAmount, targetToken, fromTokenAmount, sourceToken } =
    transactionParameters.simulation.swap

  const { swapAddress, sourceTokenAddress, targetTokenAddress, networkId } = useMemo(() => {
    const contracts = getNetworkContracts(strategyConfig.networkId)
    ensurePropertiesExist(strategyConfig.networkId, contracts, ['swapAddress'])
    ensureGivenTokensExist(strategyConfig.networkId, contracts, [
      sourceToken.symbol,
      targetToken.symbol,
    ])

    return {
      swapAddress: contracts.swapAddress,
      sourceTokenAddress: contracts.tokens[sourceToken.symbol].address,
      targetTokenAddress: contracts.tokens[targetToken.symbol].address,
      networkId: strategyConfig.networkId,
    }
  }, [strategyConfig, sourceToken, targetToken])

  const oneInchCall = useMemo(() => {
    return swapCall({ swapAddress }, networkId)
  }, [swapAddress, networkId])

  useEffect(() => {
    void oneInchCall(
      sourceTokenAddress,
      targetTokenAddress,
      amountToWei(one, sourceToken.precision),
      slippage,
    ).then((response) => {
      const from = amountFromWei(response.fromTokenAmount, sourceToken.precision)
      const to = amountFromWei(response.toTokenAmount, targetToken.precision)

      const price = sourceToken.symbol === tokens.collateral ? to.div(from) : from.div(to)
      setMarketPrice(price)
    })
  }, [
    targetToken,
    oneInchCall,
    sourceToken,
    slippage,
    tokens.collateral,
    sourceTokenAddress,
    targetTokenAddress,
  ])

  if (fromTokenAmount.eq(zero) || toTokenAmount.eq(zero)) {
    return <></>
  }

  const swapPrice =
    sourceToken.symbol === tokens.collateral
      ? amountFromWei(toTokenAmount, targetToken.precision).div(
          amountFromWei(fromTokenAmount, sourceToken.precision),
        )
      : amountFromWei(fromTokenAmount, sourceToken.precision).div(
          amountFromWei(toTokenAmount, targetToken.precision),
        )

  const priceImpact = calculatePriceImpact(marketPrice, swapPrice)

  return (
    <VaultChangesInformationItem
      label={t('vault-changes.price-impact', { token: `${tokens.collateral}/${tokens.debt}` })}
      value={
        <Text>
          {formatCryptoBalance(marketPrice)}{' '}
          <Text as="span" sx={{ color: 'critical100' }}>
            ({formatPercent(priceImpact, { precision: 2 })})
          </Text>
        </Text>
      }
    />
  )
}
