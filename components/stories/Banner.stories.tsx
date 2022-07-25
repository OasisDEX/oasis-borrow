import { Banner, bannerGradientPresets } from 'components/Banner'
import React from 'react'

const bannerProps = {
  title: 'Test Banner',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  button: {
    text: 'Press me',
    action: () => console.log('clicked'),
  },
}

export const Default = () => {
  return <Banner sx={{ width: '687px' }} {...bannerProps} />
}

export const WithImage = () => {
  return (
    <Banner
      sx={{ width: '687px' }}
      {...bannerProps}
      image={{
        src: '/static/img/setup-banner/auto-sell.svg',
        backgroundColor: bannerGradientPresets.autoSell[0],
        backgroundColorEnd: bannerGradientPresets.autoSell[1],
      }}
    />
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'Banner',
}
