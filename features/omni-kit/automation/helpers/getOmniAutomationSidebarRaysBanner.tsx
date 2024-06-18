import { RaysSidebarBanner } from 'components/RaysSidebarBanner'
import { TriggerAction } from 'helpers/lambda/triggers'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const getOmniAutomationSidebarRaysBanner = ({
  activeTriggersNumber,
  action,
}: {
  activeTriggersNumber: number
  action: TriggerAction
}) => {
  const { t } = useTranslation()

  if (activeTriggersNumber === 0) {
    return (
      <RaysSidebarBanner
        title={t('rays.sidebar.banner.boost.title', { rays: '12345' })}
        description={t('rays.sidebar.banner.boost.description')}
      />
    )
  }

  if ([TriggerAction.Add, TriggerAction.Update].includes(action)) {
    return <RaysSidebarBanner title={t('rays.sidebar.banner.auto-ongoing.title')} />
  }

  if (action === TriggerAction.Remove) {
    return (
      <RaysSidebarBanner
        title={t('rays.sidebar.banner.reduceAuto.title', { rays: '12345' })}
        description={t('rays.sidebar.banner.reduceAuto.description')}
      />
    )
  }

  return null
}
