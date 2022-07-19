import { InfoSection } from 'components/infoSection/InfoSection'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ConstantMultipleProps {}

export function ConstantMultipleInfoSection({}: ConstantMultipleProps) {
  const { t } = useTranslation()

  return <InfoSection title={t('auto-buy.buy-title')} items={[]} />
}
