import dynamic from 'next/dynamic'

export const XStateContainer = dynamic(() => import('./xStateContainerComponent'), {
  ssr: false,
})
