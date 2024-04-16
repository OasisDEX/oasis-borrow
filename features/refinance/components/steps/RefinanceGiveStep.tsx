import { InfoSection } from 'components/infoSection/InfoSection'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import { useRefinanceContext } from 'features/refinance/contexts'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'

export const RefinanceGiveStep = () => {
  const { t } = useTranslation()
  const {
    environment: { gasEstimation },
  } = useRefinanceContext()

  return (
    <>
      <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
        {t('migrate.allowance-form.description')}
      </Text>
      <InfoSection
        items={[
          {
            label: t('system.max-transaction-cost'),
            value: <>{getEstimatedGasFeeText(gasEstimation)}</>,
          },
        ]}
      />
    </>
  )
}
