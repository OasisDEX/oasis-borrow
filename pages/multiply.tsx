import { Popover, Sidetab } from '@typeform/embed-react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { WithConnection } from '../components/connectWallet/ConnectWallet'
import { ProductPagesLayout } from '../components/Layouts'
import { MultiplyView } from '../features/multiply/MultiplyView'
import { useLocalStorage } from '../helpers/useLocalStorage'
import { useBreakpointIndex } from '../theme/useBreakpointIndex'
import { useTheme } from '../theme/useThemeUI'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function MultiplySurveyButtons() {
  const breakpoint = useBreakpointIndex()
  const { theme } = useTheme()
  const btnColor = theme.colors.link
  const { t } = useTranslation()
  const [wasClosed, setWasOpenedAndClosed] = useLocalStorage(
    'multiply-survey-2022-03-23-was-closed',
    false,
  )
  return (
    <>
      {breakpoint === 0 && !wasClosed && (
        <Popover
          id="H52MeocX"
          buttonColor={btnColor}
          shareGaInstance={true}
          onClose={() => setWasOpenedAndClosed(true)}
        />
      )}
      {breakpoint > 0 && !wasClosed && (
        <Sidetab
          id="H52MeocX"
          buttonText={t('help-shape-the-future-of-multiply')}
          buttonColor={btnColor}
          shareGaInstance={true}
          onClose={() => setWasOpenedAndClosed(true)}
        >
          Help shape the future of Multiply
        </Sidetab>
      )}
    </>
  )
}

export default function MultiplyPage() {
  return (
    <WithConnection>
      <MultiplyView />
      <MultiplySurveyButtons />
    </WithConnection>
  )
}

MultiplyPage.layout = ProductPagesLayout
MultiplyPage.theme = 'Landing'
