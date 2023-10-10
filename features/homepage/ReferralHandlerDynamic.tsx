import dynamic from 'next/dynamic'

export const ReferralHandlerDynamic = dynamic(() => import('./ReferralHandler'), {
  ssr: false,
})
