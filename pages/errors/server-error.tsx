import { MarketingLayout } from 'components/Layouts'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function ServerError() {
  console.log('oasis-borrow@' + process.env.npm_package_version)
  throw new Error('test error from page')
}

ServerError.layout = MarketingLayout
ServerError.layoutProps = {
  variant: 'termsContainer',
}
ServerError.theme = 'Landing'
