import { PositionTransition } from '@oasisdex/dma-library'
import { Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { amountFromWei, amountToWei } from 'blockchain/utils'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import { getTokenMetaData } from 'features/exchange/exchange'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { getOneInchCall } from 'helpers/swap'
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
}

export function PriceImpact({ tokens, transactionParameters, slippage }: PriceImpactProps) {
  const { t } = useTranslation()
  const [marketPrice, setMarketPrice] = useState<BigNumber>(zero)
  const { toTokenAmount, targetToken, fromTokenAmount, sourceToken } =
    transactionParameters.simulation.swap

  const oneInchCall = useMemo(() => {
    const contracts = getNetworkContracts(NetworkIds.MAINNET) // for now it's only mainnet.
    return getOneInchCall(contracts.swapAddress)
  }, [])

  useEffect(() => {
    const contracts = getNetworkContracts(NetworkIds.MAINNET) // for now it's only mainnet.
    const sourceTokenAddress = getTokenMetaData(sourceToken.symbol, contracts.tokens).address
    const targetTokenAddress = getTokenMetaData(targetToken.symbol, contracts.tokens).address
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
  }, [targetToken, oneInchCall, sourceToken, slippage, tokens.collateral])

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
