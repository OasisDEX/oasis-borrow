import { InfoSection } from 'components/infoSection/InfoSection'
import { useTranslation } from 'next-i18next'
import React from 'react'

// interface ConstantMultipleProps {} // TODO ŁW use when needed

export function ConstantMultipleInfoSection(/*{}: ConstantMultipleProps*/) {
  const { t } = useTranslation()

  return <InfoSection title={t('constant-multiple.title')} items={[]} />
}
