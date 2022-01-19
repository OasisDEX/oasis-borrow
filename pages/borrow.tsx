import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'

import { useFeatureToggle } from '../helpers/useFeatureToggle'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function Borrow() {
  const assetLandingPagesEnabled = useFeatureToggle('AssetLandingPages')
  if (!assetLandingPagesEnabled) {
    const router = useRouter()
    if (typeof window !== 'undefined') {
      void router.push('/')
    }
  }
  return 'hello from borrow page'
}
