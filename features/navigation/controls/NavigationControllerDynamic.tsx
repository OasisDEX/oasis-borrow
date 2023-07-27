import dynamic from 'next/dynamic'

export const NavigationControllerDynamic = dynamic(() => import('./NavigationController'), {
  ssr: false,
})
