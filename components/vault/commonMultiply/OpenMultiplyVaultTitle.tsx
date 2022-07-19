import { WithVaultFormStepIndicator } from 'components/vault/VaultForm'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Box, Text } from 'theme-ui'

import { OpenMultiplyVaultStage } from '../../../features/multiply/open/pipes/openMultiplyVault'
import { VaultProxySubtitle } from '../VaultProxy'

export interface OpenMultiplyVaultTitleProps {
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  token: string
  totalSteps: number
  currentStep: number
  stage: OpenMultiplyVaultStage
  title: string
  subTitle: ReactNode
}

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
}: OpenMultiplyVaultTitleProps) {
  const { t } = useTranslation()
  return (
    <Box>
      <WithVaultFormStepIndicator {...{ totalSteps, currentStep }}>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
          {isEditingStage
            ? title
            : isProxyStage
            ? stage === 'proxySuccess'
              ? t('vault-form.header.proxy-success')
              : t('vault-form.header.proxy')
            : isAllowanceStage
            ? t('vault-form.header.allowance', { token: token.toUpperCase() })
            : stage === 'txInProgress'
            ? t('vault-form.header.confirm-in-progress')
            : t('vault-form.header.confirm')}
        </Text>
      </WithVaultFormStepIndicator>
      <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
        {isEditingStage ? (
          subTitle
        ) : isProxyStage ? (
          <VaultProxySubtitle stage={stage} />
        ) : isAllowanceStage ? (
          t('vault-form.subtext.allowance')
        ) : stage === 'txInProgress' ? (
          t('vault-form.subtext.confirm-in-progress')
        ) : (
          t('vault-form.subtext.review-manage')
        )}
      </Text>
    </Box>
  )
}
