import type { IMultiplyStrategy } from '@oasisdex/dma-library'
import { Text } from '@theme-ui/components'
import { swapCall } from 'actions/aave-like'
import type BigNumber from 'bignumber.js'
import {
  ensureGivenTokensExist,
  ensurePropertiesExist,
  getNetworkContracts,
} from 'blockchain/contracts'
import { amountFromWei, amountToWei } from 'blockchain/utils'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import { StrategyType } from 'features/aave/types/strategy-config'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'

type GetPriceArgs = {
  fromAmountInBaseUnit: BigNumber
  toAmountInBaseUnit: BigNumber
  sourceToken: {
    symbol: string
    precision: number
  }
  strategyType: StrategyType
  targetToken: {
    symbol: string
    precision: number
  }
  tokens: {
    collateral: string
    debt: string
  }
}
const getPrice = ({
  sourceToken,
  targetToken,
  strategyType,
  fromAmountInBaseUnit,
  toAmountInBaseUnit,
  tokens,
}: GetPriceArgs): BigNumber => {
  const from = amountFromWei(fromAmountInBaseUnit, sourceToken.precision)
  const to = amountFromWei(toAmountInBaseUnit, targetToken.precision)

  return match({ sourceToken, strategyType })
    .with({ sourceToken: { symbol: tokens.collateral }, strategyType: StrategyType.Long }, () =>
      to.div(from),
    )
    .with({ sourceToken: { symbol: tokens.collateral }, strategyType: StrategyType.Short }, () =>
      from.div(to),
    )
    .with({ sourceToken: { symbol: tokens.debt }, strategyType: StrategyType.Long }, () =>
      from.div(to),
    )
    .with({ sourceToken: { symbol: tokens.debt }, strategyType: StrategyType.Short }, () =>
      to.div(from),
    )
    .otherwise(() => zero)
}

interface PriceImpactProps {
  slippage: BigNumber
  tokens: {
    collateral: string
    debt: string
  }
  transactionParameters: IMultiplyStrategy
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
      const price = getPrice({
        fromAmountInBaseUnit: response.fromTokenAmount,
        toAmountInBaseUnit: response.toTokenAmount,
        sourceToken,
        strategyType: strategyConfig.strategyType,
        targetToken,
        tokens,
      })
      setMarketPrice(price)
    })
  }, [
    targetToken,
    oneInchCall,
    sourceToken,
    slippage,
    sourceTokenAddress,
    targetTokenAddress,
    strategyConfig,
    tokens,
  ])

  if (fromTokenAmount.eq(zero) || toTokenAmount.eq(zero)) {
    return <></>
  }

  const swapPrice = getPrice({
    fromAmountInBaseUnit: fromTokenAmount,
    toAmountInBaseUnit: toTokenAmount,
    sourceToken,
    strategyType: strategyConfig.strategyType,
    targetToken,
    tokens,
  })

  const priceImpact = calculatePriceImpact(marketPrice, swapPrice)

  const displayToken = match(strategyConfig.strategyType)
    .with(StrategyType.Long, () => `${tokens.collateral}/${tokens.debt}`)
    .with(StrategyType.Short, () => `${tokens.debt}/${tokens.collateral}`)
    .otherwise(() => '')

  return (
    <VaultChangesInformationItem
      label={t('vault-changes.price-impact', { token: displayToken })}
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
