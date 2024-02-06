import type { ImagesSliderProps } from 'components/ImagesSlider'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'

export const partnerLogosConfig: ImagesSliderProps['items'] = [
  {
    imgSrc: staticFilesRuntimeUrl('/static/img/homepage/slider/aave.svg'),
    imgAlt: 'Aave',
    url: '',
    width: '146px',
    height: '100px',
  },
  {
    imgSrc: staticFilesRuntimeUrl('/static/img/homepage/slider/ajna.svg'),
    imgAlt: 'Ajna',
    url: '',
    width: '163px',
    height: '30px',
  },
  {
    imgSrc: staticFilesRuntimeUrl('/static/img/homepage/slider/maker.svg'),
    imgAlt: 'Maker',
    url: '',
    width: '242px',
    height: '100px',
  },
  {
    imgSrc: staticFilesRuntimeUrl('/static/img/homepage/slider/spark.svg'),
    imgAlt: 'Spark',
    url: '',
    width: '151px',
    height: '48px',
  },
  {
    imgSrc: staticFilesRuntimeUrl('/static/img/homepage/slider/morpho.svg'),
    imgAlt: 'Morpho',
    url: '',
    width: '180px',
    height: '36px',
  },
]
