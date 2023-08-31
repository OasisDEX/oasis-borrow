import dynamic from 'next/dynamic'

export const TermsOfServiceReferralDynamic = dynamic(() => import('./TermsOfServiceReferral'), {
  ssr: false,
})
