import { MarketingLayout } from 'components/Layouts'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function ServerError() {
  return (
    <ul>
      <li>
        <button
          type="button"
          onClick={() => {
            throw new Error('Sentry Frontend Error')
          }}
        >
          Trigger error on client
        </button>
      </li>
      <li>
        <a href="/errors/server-error">trigger error on page on server</a>
      </li>
      <li>
        <a href="/api/deliberateError">trigger error on API endpoint</a>
      </li>
    </ul>
  )
}

ServerError.layout = MarketingLayout
ServerError.theme = 'Landing'
