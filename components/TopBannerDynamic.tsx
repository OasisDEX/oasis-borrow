import dynamic from 'next/dynamic'

export const TopBannerDynamic = dynamic(() => import('./TopBanners'), {
  ssr: false,
})
