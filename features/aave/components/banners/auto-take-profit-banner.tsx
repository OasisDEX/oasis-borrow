import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import React from 'react'

export function AutoTakeProfitBanner({ buttonClicked }: { buttonClicked: () => void }) {
  // TODO: add translations
  return (
    <Banner
      title={'Automate your exit with Auto Take Profit'}
      description={<>Maker Auto take profit description</>}
      image={{
        src: '/static/img/setup-banner/auto-take-profit.svg',
        backgroundColor: bannerGradientPresets.autoTakeProfit[0],
        backgroundColorEnd: bannerGradientPresets.autoTakeProfit[1],
      }}
      button={{
        action: () => {
          buttonClicked()
        },
        text: 'Set up Auto Take Profit',
      }}
    />
  )
}
