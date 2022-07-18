import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Text } from 'theme-ui'

import { ManageMultiplyVaultState } from '../../../features/multiply/manage/pipes/manageMultiplyVault'
import { WithVaultFormStepIndicator } from '../VaultForm'
import { VaultProxySubtitle } from '../VaultProxy'

export function ManageVaultHeaderAllowance({
  isProxyStage,
  isCollateralAllowanceStage,
  isDaiAllowanceStage,
  stage,
  currentStep,
  totalSteps,
  vault: { token },
}: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  return (
    <Box>
      <WithVaultFormStepIndicator {...{ totalSteps, currentStep }}>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
          {isProxyStage
            ? stage === 'proxySuccess'
              ? t('vault-form.header.proxy-success')
              : t('vault-form.header.proxy')
            : isCollateralAllowanceStage
            ? t('vault-form.header.allowance', { token: token.toUpperCase() })
            : isDaiAllowanceStage
            ? t('vault-form.header.daiAllowance')
            : stage === 'manageInProgress'
            ? t('vault-form.header.modified')
            : t('vault-form.header.review-manage')}
        </Text>
      </WithVaultFormStepIndicator>
      <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
        {isProxyStage ? (
          <VaultProxySubtitle stage={stage} />
        ) : isCollateralAllowanceStage ? (
          t('vault-form.subtext.allowance', { token: token.toUpperCase() })
        ) : isDaiAllowanceStage ? (
          t('vault-form.subtext.daiAllowance')
        ) : stage === 'manageInProgress' ? (
          t('vault-form.subtext.modified')
        ) : (
          t('vault-form.subtext.review-manage')
        )}
      </Text>
    </Box>
  )
}
