import BigNumber from 'bignumber.js'
import { VaultAction, VaultActionInput } from 'components/vault/VaultActionInput'
import { DsrSidebarTabOptions } from 'features/dsr/sidebar/DsrSideBar'
import { HasGasEstimation } from 'helpers/form'
import React, { ChangeEvent } from 'react'
import { Box } from 'theme-ui'

import { DsrDepositInfoSection } from './DsrDepositInfoSection'

interface DsrWithdrawDaiFormProps {
  onDepositAmountChange: (e: ChangeEvent<HTMLInputElement>) => void
  action: VaultAction
  amount: BigNumber | undefined
  maxAmount: BigNumber | undefined
  activeTab: DsrSidebarTabOptions
  gasData: HasGasEstimation
}

export function DsrWithdrawDaiForm({
  onDepositAmountChange,
  action,
  amount,
  maxAmount,
  activeTab,
  gasData,
}: DsrWithdrawDaiFormProps) {
  return (
    <Box
      sx={{
        marginTop: 1,
      }}
    >
      <VaultActionInput
        action={action}
        currencyCode="DAI"
        onChange={onDepositAmountChange}
        hasError={false}
        amount={amount}
        maxAmount={maxAmount}
        showMax
        onSetMax={() =>
          onDepositAmountChange({
            target: { value: maxAmount?.toString() },
          } as ChangeEvent<HTMLInputElement>)
        }
      />

      {amount && (
        <Box
          sx={{
            mt: 3,
          }}
        >
          <DsrDepositInfoSection daiToDeposit={amount} activeTab={activeTab} gasData={gasData} />
        </Box>
      )}
    </Box>
  )
}
