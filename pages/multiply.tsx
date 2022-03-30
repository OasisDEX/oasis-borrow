import { Global } from '@emotion/core'
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

const typeformPopoverButton = '.tf-v1-popover .tf-v1-popover-button'

export function MultiplySurveyButtons() {
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
      {breakpoint <= 1 && !wasClosed && (
        <>
          {breakpoint === 0 && (
            <Global
              styles={() => ({
                [typeformPopoverButton]: {
                  bottom: '77px',
                  right: '14px',
                },
              })}
            />
          )}

          <Popover
            id="H52MeocX"
            buttonColor={btnColor}
            shareGaInstance={true}
            onClose={() => setWasOpenedAndClosed(true)}
          />
        </>
      )}
      {breakpoint > 1 && !wasClosed && (
        <Sidetab
          id="H52MeocX"
          buttonText={t('help-shape-the-future-of-multiply')}
          buttonColor={btnColor}
          shareGaInstance={true}
          onClose={() => setWasOpenedAndClosed(true)}
        >
          {t('help-shape-the-future-of-multiply')}
        </Sidetab>
      )}
    </>
  )
}

function MultiplyPage() {
  return (
    <WithConnection>
      <MultiplyView />
      <MultiplySurveyButtons />
    </WithConnection>
  )
}

MultiplyPage.layout = ProductPagesLayout
MultiplyPage.theme = 'Landing'

export default MultiplyPage
