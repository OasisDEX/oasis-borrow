import type { ImagesSliderProps } from 'components/ImagesSlider'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'

export const partnerLogosConfig: ImagesSliderProps['items'] = [
  {
    imgSrc: staticFilesRuntimeUrl('/static/img/homepage/slider/arbitrum.svg'),
    imgAlt: 'Arbitrum',
    url: '',
  },
  {
    imgSrc: staticFilesRuntimeUrl('/static/img/homepage/slider/aave.svg'),
    imgAlt: 'Aave',
    url: '',
  },
  {
    imgSrc: staticFilesRuntimeUrl('/static/img/homepage/slider/ajna.svg'),
    imgAlt: 'Ajna',
    url: '',
  },
  {
    imgSrc: staticFilesRuntimeUrl('/static/img/homepage/slider/maker.svg'),
    imgAlt: 'Maker',
    url: '',
  },
  {
    imgSrc: staticFilesRuntimeUrl('/static/img/homepage/slider/optimism.svg'),
    imgAlt: 'Optimism',
    url: '',
  },
]
