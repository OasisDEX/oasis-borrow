import { WithVaultFormStepIndicator } from 'components/vault/VaultForm'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Text } from 'theme-ui'

import { OpenBorrowVaultContext } from '../OpenVaultView'

export function OpenVaultTitle() {
  const {
    isEditingStage,
    isProxyStage,
    isAllowanceStage,
    token,
    stage,
    totalSteps,
    currentStep,
  } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    isEditingStage: ctx.isEditingStage,
    isProxyStage: ctx.isProxyStage,
    isAllowanceStage: ctx.isAllowanceStage,
    token: ctx.token,
    stage: ctx.stage,
    totalSteps: ctx.totalSteps,
    currentStep: ctx.currentStep,
  }))
  const { t } = useTranslation()
  return (
    <Box>
      <WithVaultFormStepIndicator {...{ totalSteps, currentStep }}>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
          {isEditingStage
            ? t('vault-form.header.edit')
            : isProxyStage
            ? t('vault-form.header.proxy')
            : isAllowanceStage
            ? t('vault-form.header.allowance', { token: token.toUpperCase() })
            : stage === 'txInProgress'
            ? t('vault-form.header.confirm-in-progress')
            : t('vault-form.header.confirm')}
        </Text>
      </WithVaultFormStepIndicator>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {isEditingStage
          ? t('vault-form.subtext.edit')
          : isProxyStage
          ? t('vault-form.subtext.proxy')
          : isAllowanceStage
          ? t('vault-form.subtext.allowance')
          : stage === 'txInProgress'
          ? t('vault-form.subtext.confirm-in-progress')
          : t('vault-form.subtext.review-manage')}
      </Text>
    </Box>
  )
}
