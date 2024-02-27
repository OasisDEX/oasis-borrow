import type { IMultiplyStrategy } from '@oasisdex/dma-library'
import { NetworkIds } from 'blockchain/networks'
import { amountFromWei } from 'blockchain/utils'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import { formatAmount } from 'helpers/formatters/format'
import { useBalancerVaultLiquidity } from 'helpers/hooks/useBalancerLiquidity'
import React from 'react'
import { Flex, Text } from 'theme-ui'
import { match, P } from 'ts-pattern'

interface FlashLoanInformationProps {
  transactionParameters: IMultiplyStrategy
  networkId: NetworkIds
}

export function FlashLoanInformation({
  transactionParameters,
  networkId,
}: FlashLoanInformationProps) {
  const flashLoanAmount = amountFromWei(
    transactionParameters.flashloan.amount,
    transactionParameters.flashloan.token.precision,
  )
  const flashloanToken = transactionParameters.flashloan.token.symbol

  const balancerLiquidity = useBalancerVaultLiquidity({ tokenSymbol: flashloanToken, networkId })

  const isFloashLoanWithBalancer = networkId !== NetworkIds.MAINNET

  const liquidityColor = match({ balancerLiquidity, isFloashLoanWithBalancer })
    .with({ isFloashLoanWithBalancer: false }, () => 'primary100')
    .with(
      { balancerLiquidity: P.when((value) => value && value.lte(flashLoanAmount)) },
      () => 'critical100',
    )
    .otherwise(() => 'success100')

  return (
    <>
      <VaultChangesInformationItem
        label={'Flashloan Amount'}
        value={
          <Flex>
            <Text as={'span'}>
              {formatAmount(flashLoanAmount, flashloanToken)} {flashloanToken}
            </Text>
          </Flex>
        }
      />
      {isFloashLoanWithBalancer && balancerLiquidity && (
        <VaultChangesInformationItem
          label={'Flashloan Provider Liquidity'}
          value={
            <Text as={'span'} color={liquidityColor} sx={{ ml: 2 }}>
              {formatAmount(balancerLiquidity, flashloanToken)} {flashloanToken}
            </Text>
          }
        />
      )}
    </>
  )
}
