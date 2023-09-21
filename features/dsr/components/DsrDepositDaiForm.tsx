import type BigNumber from 'bignumber.js'
import { Checkbox } from 'components/Checkbox'
import { AppLink } from 'components/Links'
import type { VaultAction } from 'components/vault/VaultActionInput'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import type { DsrSidebarTabOptions } from 'features/dsr/helpers/dsrDeposit.types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { useTranslation } from 'next-i18next'
import type { ChangeEvent } from 'react'
import React from 'react'
import { Box, Flex, Text } from 'theme-ui'

import { DsrDepositInfoSection } from './DsrDepositInfoSection'

interface DsrDepositDaiFormProps {
  onDepositAmountChange: (e: ChangeEvent<HTMLInputElement>) => void
  onCheckboxChange: () => void
  action: VaultAction
  amount: BigNumber | undefined
  maxAmount: BigNumber | undefined
  activeTab: DsrSidebarTabOptions
  gasData: HasGasEstimation
  isMintingSDai: boolean
}

export function DsrDepositDaiFrom({
  onDepositAmountChange,
  onCheckboxChange,
  action,
  amount,
  maxAmount,
  activeTab,
  gasData,
  isMintingSDai,
}: DsrDepositDaiFormProps) {
  const { t } = useTranslation()

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
      <Flex sx={{ my: 3, alignItems: 'center' }}>
        <Checkbox checked={isMintingSDai} onClick={onCheckboxChange} />
        <Flex sx={{ justifyContent: 'space-between', ml: 2, width: '100%' }}>
          <Text as="p" variant="paragraph3" sx={{ fontWeight: 'regular' }}>
            {t('dsr.common.mint-savings-dai')}
          </Text>
          <AppLink
            sx={{ fontSize: 2, fontWeight: 'regular' }}
            href={EXTERNAL_LINKS.KB.WHAT_IS_SDAI}
          >
            {t('dsr.links.what-is-sdai')}
          </AppLink>
        </Flex>
      </Flex>
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
