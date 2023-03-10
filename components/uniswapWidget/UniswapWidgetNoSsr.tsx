import dynamic from 'next/dynamic'

export const UniswapWidgetNoSsr = dynamic(
  () => {
    return import('./UniswapWidget').then((component) => component.UniswapWidget)
  },
  { ssr: false },
)
