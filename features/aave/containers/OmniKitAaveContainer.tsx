import dynamic from 'next/dynamic'

export const OmniKitAaveContainer = dynamic(() => import('./OmniKitAaveContainerComponent'), {
  ssr: false,
})
