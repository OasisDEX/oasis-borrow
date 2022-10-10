import { useTranslation } from 'next-i18next'
import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import React from 'react'
import { HasGasEstimation } from '../../../../../helpers/form'

type OpenAaveInformationContainerProps = {
  state: {
    context: {
      estimatedGasPrice?: HasGasEstimation
    }
  }
}

export function OpenAaveInformationContainer({ state }: OpenAaveInformationContainerProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationContainer title="Order information">
      <VaultChangesInformationItem
        label={t('transaction-fee')}
        value={getEstimatedGasFeeTextOld(state.context.estimatedGasPrice)}
      />
    </VaultChangesInformationContainer>
  )
}
