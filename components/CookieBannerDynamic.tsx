import dynamic from 'next/dynamic'

export const CookieBannerDynamic = dynamic(() => import('./CookieBanner'), {
  ssr: false,
})
