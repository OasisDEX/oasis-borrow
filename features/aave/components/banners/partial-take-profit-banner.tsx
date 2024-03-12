import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import React from 'react'

export function PartialTakeProfitBanner({ buttonClicked }: { buttonClicked: () => void }) {
  // TODO: add translations
  return (
    <Banner
      title={'Automate your exit with Take Profit'}
      description={
        <>
          Take a hands off approach to realizing profits. Set the price to start taking profit and
          our automation will gradually realize profits to collateral or debt for you.
        </>
      }
      image={{
        src: '/static/img/setup-banner/partial-take-profit.svg',
        backgroundColor: bannerGradientPresets.partialTakeProfit[0],
        backgroundColorEnd: bannerGradientPresets.partialTakeProfit[1],
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
