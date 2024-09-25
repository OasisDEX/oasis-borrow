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
    imgSrc: staticFilesRuntimeUrl('/static/img/homepage/slider/sky.svg'),
    imgAlt: 'Sky',
    url: '',
    width: '110px',
    height: '38px',
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
