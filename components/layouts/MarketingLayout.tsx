import { Footer } from 'components/Footer'
import { renderCssGradient } from 'features/marketing-layouts/helpers'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import React from 'react'

import { marketingBackgrounds } from './backgrounds'
import { BasicLayout } from './BasicLayout'
import type { MarketingLayoutProps } from './MarketingLayout.types'

export function MarketingLayout({
  backgroundGradient,
  children,
  topBackground = 'default',
  variant,
}: MarketingLayoutProps) {
  return (
    <>
      <BasicLayout
        header={<NavigationController />}
        footer={<Footer />}
        variant={variant || 'marketingContainer'}
        sx={{
          position: 'relative',
          ...(backgroundGradient && {
            background: renderCssGradient('180deg', [...backgroundGradient, '#fff']),
            backgroundSize: '100% 1024px',
            backgroundRepeat: 'no-repeat',
          }),
        }}
        bg={marketingBackgrounds[topBackground]}
      >
        {children}
      </BasicLayout>
    </>
  )
}
