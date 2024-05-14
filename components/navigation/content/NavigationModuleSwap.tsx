import { NavigationMenuDropdownContentListItem } from 'components/navigation/NavigationMenuDropdownContentListItem'
import type { SwapWidgetChangeAction } from 'features/swapWidget/SwapWidgetChange'
import { SWAP_WIDGET_CHANGE_SUBJECT } from 'features/swapWidget/SwapWidgetChange'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { uiChanges } from 'helpers/uiChanges'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { exchange } from 'theme/icons'

export const NavigationModuleSwap: FC = () => {
  const { t } = useTranslation()

  const { connect } = useConnection()

  return (
    <NavigationMenuDropdownContentListItem
      title={t('nav.swap')}
      description={t('nav.swap-description')}
      icon={{
        position: 'global',
        icon: exchange,
      }}
      onClick={() => {
        connect()
        uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, {
          type: 'open',
          variant: 'swap',
        })
      }}
    />
  )
}
