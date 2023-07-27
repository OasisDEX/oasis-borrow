import { Footer } from 'components/Footer'
import { NavigationControllerDynamic } from 'features/navigation/controls/NavigationControllerDynamic'
import { WithChildren } from 'helpers/types'
import React from 'react'

import { marketingBackgrounds } from './backgrounds'
import { BasicLayout } from './BasicLayout'

export interface MarketingLayoutProps extends WithChildren {
  variant?: string
  topBackground?: keyof typeof marketingBackgrounds
}

export function MarketingLayout({
  children,
  variant,
  topBackground = 'default',
}: MarketingLayoutProps) {
  return (
    <>
      <BasicLayout
        header={<NavigationControllerDynamic />}
        footer={<Footer />}
        variant={variant || 'marketingContainer'}
        sx={{ position: 'relative' }}
        bg={marketingBackgrounds[topBackground]}
      >
        {children}
      </BasicLayout>
    </>
  )
}
