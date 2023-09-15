import { IMultiplyStrategy } from '@oasisdex/dma-library'
import { amountFromWei } from 'blockchain/utils'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import { formatAmount } from 'helpers/formatters/format'
import React from 'react'
import { Flex, Text } from 'theme-ui'

interface FlashLoanInformationProps {
  transactionParameters: IMultiplyStrategy
}

export function FlashLoanInformation({ transactionParameters }: FlashLoanInformationProps) {
  const flashLoanAmount = amountFromWei(
    transactionParameters.flashloan.amount,
    transactionParameters.flashloan.token.precision,
  )
  const flashloanToken = transactionParameters.flashloan.token.symbol

  return (
    <VaultChangesInformationItem
      label={'Flashloan Amount'}
      value={
        <Flex>
          <Text>
            {formatAmount(flashLoanAmount, flashloanToken)} {flashloanToken}
          </Text>
        </Flex>
      }
    />
  )
}
