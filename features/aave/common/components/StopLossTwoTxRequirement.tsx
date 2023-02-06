import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export function StopLossTwoTxRequirement({ typeKey }: { typeKey: string }) {
  const { t } = useTranslation()

  return (
    <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
      {t('open-vault-two-tx-setup-requirement', { type: t(typeKey) })}
    </Text>
  )
}
