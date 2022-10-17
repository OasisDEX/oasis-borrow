import { Banner, BannerProps } from 'components/Banner'
import { useSessionStorage } from 'helpers/useSessionStorage'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'

interface AutomationTriggeredBannerControlProps extends BannerProps {
  sessionStorageKey: string
}

export function AutomationTriggeredBannerControl({
  title,
  description,
  image,
  sessionStorageKey,
}: AutomationTriggeredBannerControlProps) {
  const { t } = useTranslation()
  const [isBannerClosed, setIsBannerClosed] = useSessionStorage(sessionStorageKey, false)
  const handleClose = useCallback(() => setIsBannerClosed(true), [])

  return (
    <>
      {!isBannerClosed && (
        <Banner
          title={title}
          description={description}
          image={image}
          button={{
            action: handleClose,
            text: t('close-notification'),
          }}
        />
      )}
    </>
  )
}
