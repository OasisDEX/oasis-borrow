import dynamic from 'next/dynamic'

export const TopBannerDynamic = dynamic(() => import('./TopBanner'), {
  ssr: false,
})
