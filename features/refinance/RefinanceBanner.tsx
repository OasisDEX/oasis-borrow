import { Banner } from 'components/Banner'
import type { RefinanceContextInput } from 'features/refinance/contexts'
import { useRefinanceGeneralContext } from 'features/refinance/contexts'
import { RefinanceModalController } from 'features/refinance/controllers'
import { useModalContext } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const RefinanceBanner: React.FC<{ contextInput?: RefinanceContextInput }> = ({
  contextInput,
}) => {
  const { openModal } = useModalContext()
  const { handleSetContext } = useRefinanceGeneralContext()

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
          handleSetContext(contextInput)
          openModal(RefinanceModalController, { contextInput })
        },
        text: t('refinance.banner.button'),
      }}
    />
  )
}
