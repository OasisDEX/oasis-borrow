import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { VaultAction, VaultActionInput } from 'components/vault/VaultActionInput'
import { DsrSidebarTabOptions } from 'features/dsr/sidebar/DsrSideBar'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { HasGasEstimation } from 'helpers/form'
import { zero } from 'helpers/zero'
import React, { ChangeEvent } from 'react'
import { Box, Text } from 'theme-ui'

import { DsrDepositInfoSection } from './DsrDepositInfoSection'

interface DsrConvertDaiFormProps {
  onDepositAmountChange: (e: ChangeEvent<HTMLInputElement>) => void
  action: VaultAction
  amount: BigNumber | undefined
  maxAmount: BigNumber | undefined
  activeTab: DsrSidebarTabOptions
  gasData: HasGasEstimation
}

export function DsrConvertDaiForm({
  onDepositAmountChange,
  action,
  amount,
  maxAmount,
  activeTab,
  gasData,
}: DsrConvertDaiFormProps) {
  return (
    <Box
      sx={{
        marginTop: 1,
      }}
    >
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80', mb: 4 }}>
        If you are are holding Savings Dai (sDAI) you can convert it back to Dai. Converting back to
        Dai means you will no longer accrue the Dai Savings Rate on the amount you convert.
      </Text>
      <VaultActionInput
        optionalLabel="Convert sDai to Dai"
        action={action}
        currencyCode="SDAI"
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
      <Box sx={{ mt: 2 }}>
        <AppLink sx={{ fontSize: 2, fontWeight: 'regular' }} href={EXTERNAL_LINKS.KB.WHAT_IS_SDAI}>
          What is sDAI conversion?
        </AppLink>
      </Box>

      {amount && (
        <Box
          sx={{
            mt: 3,
          }}
        >
          <DsrDepositInfoSection
            daiToDeposit={amount.gt(maxAmount || zero) ? maxAmount || zero : amount}
            activeTab={activeTab}
            gasData={gasData}
            token="SDAI"
          />
        </Box>
      )}
    </Box>
  )
}
