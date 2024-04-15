import { Banner } from 'components/Banner'
import { RefinanceModal } from 'features/refinance/components'
import type { RefinanceContextInput } from 'features/refinance/contexts'
import { useModalContext } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const RefinanceBanner: React.FC<{ contextInput?: RefinanceContextInput }> = ({
  contextInput,
}) => {
  const { openModal } = useModalContext()
  const { t } = useTranslation()

  if (!contextInput) {
    return null
  }

  return (
    <Banner
      title={t('refinance.banner.title')}
      description={t('refinance.banner.description')}
      image={{
        src: '/static/img/setup-banner/refinance.svg',
      }}
      button={{
        action: () => {
          openModal(RefinanceModal, { contextInput })
        },
        text: t('refinance.banner.button'),
      }}
    />
  )
}
