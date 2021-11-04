import { WithVaultFormStepIndicator } from 'components/vault/VaultForm'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Text } from 'theme-ui'

import { OpenMultiplyVaultState } from '../openMultiplyVault'

export function OpenMultiplyVaultTitle({
  isEditingStage,
  isProxyStage,
  isAllowanceStage,
  token,
  totalSteps,
  currentStep,
  stage,
  title,
  subTitle,
}: OpenMultiplyVaultState & { title: string; subTitle: string }) {
  const { t } = useTranslation()
  return (
    <Box>
      <WithVaultFormStepIndicator {...{ totalSteps, currentStep }}>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
          {isEditingStage
            ? title
            : isProxyStage
            ? t('vault-form.header.proxy')
            : isAllowanceStage
            ? t('vault-form.header.allowance', { token: token.toUpperCase() })
            : stage === 'openInProgress'
            ? t('vault-form.header.confirm-in-progress')
            : t('vault-form.header.confirm')}
        </Text>
      </WithVaultFormStepIndicator>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {isEditingStage
          ? subTitle
          : isProxyStage
          ? t('vault-form.subtext.proxy')
          : isAllowanceStage
          ? t('vault-form.subtext.allowance')
          : stage === 'openInProgress'
          ? t('vault-form.subtext.confirm-in-progress')
          : t('vault-form.subtext.review-manage')}
      </Text>
    </Box>
  )
}
