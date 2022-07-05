import { useAppContext } from 'components/AppContextProvider'
import { TabBar } from 'components/TabBar'
import {
  TAB_CHANGE_SUBJECT,
  TabChange,
} from 'features/automation/protection/common/UITypes/TabChange'
import { useTranslation } from 'next-i18next'
import React, { ReactElement, useEffect, useState } from 'react'
import { Card } from 'theme-ui'

export enum EarnSimulateViewMode {
  Simulate = 'simulate',
  FAQ = 'faq',
}

interface EarnVaultSimulateTabBarProps {
  detailsAndForm: JSX.Element
  faq?: ReactElement
}

export function EarnVaultSimulateTabBar({
  detailsAndForm,
  faq,
}: EarnVaultSimulateTabBarProps): JSX.Element {
  const [mode, setMode] = useState<EarnSimulateViewMode>(EarnSimulateViewMode.Simulate)
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()

  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<TabChange>(TAB_CHANGE_SUBJECT)
    const subscription = uiChanges$.subscribe((value) => {
      setMode(() => value.currentMode as EarnSimulateViewMode)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  return (
    <TabBar
      variant="underline"
      useDropdownOnMobile
      switchEvent={{ value: mode }}
      sections={[
        {
          value: 'simulate',
          label: t('open-vault.simulate'),
          content: detailsAndForm,
        },
        {
          value: 'faq',
          label: t('system.faq'),
          content: <Card variant="faq">{faq}</Card>,
        },
      ]}
    />
  )
}
