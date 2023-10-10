import type BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import type { VaultAction } from 'components/vault/VaultActionInput'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import type { DsrSidebarTabOptions } from 'features/dsr/helpers/dsrDeposit.types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { ChangeEvent } from 'react'
import React from 'react'
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
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        marginTop: 1,
      }}
    >
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80', mb: 4 }}>
        {t('dsr.common.conversion-desc')}
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
        <AppLink
          sx={{ fontSize: 2, fontWeight: 'regular' }}
          href={EXTERNAL_LINKS.KB.WHAT_IS_SDAI_CONVERSION}
        >
          {t('dsr.common.what-is-sdai-conversion')}
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
