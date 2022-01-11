import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function Multiply() {
  return 'hello from multiply page'
}
