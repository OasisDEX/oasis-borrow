import { MarketingLayout } from 'components/Layouts'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useState } from 'react'

import { TriggerErrorWithUseObservable } from '../../components/errorTriggeringComponents/TriggerErrorWithUseObservable'
import { TriggerErrorWithUseObservableWithError } from '../../components/errorTriggeringComponents/TriggerErrorWithUseObservableWithError'

export default function ServerError() {
  const [
    showComponentThatErrorsWithUnhandledError,
    setShowComponentThatErrorsWithUnhandledError,
  ] = useState(false)

  const [
    showComponentThatErrorsWithHandledError,
    setShowComponentThatErrorsWithHandledError,
  ] = useState(false)
  return (
    <ul>
      <li>
        <button
          type="button"
          onClick={() => {
            throw new Error('Sentry Frontend Error')
          }}
        >
          Trigger error on client in this component
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => {
            setShowComponentThatErrorsWithUnhandledError(
              (showComponentThatTriggersUnhandledError) => !showComponentThatTriggersUnhandledError,
            )
          }}
        >
          Trigger handled error in observable with useObservable
        </button>
        {showComponentThatErrorsWithUnhandledError && <TriggerErrorWithUseObservable />}
      </li>
      <li>
        <button
          type="button"
          onClick={() => {
            setShowComponentThatErrorsWithHandledError(
              (showComponentThatErrors) => !showComponentThatErrors,
            )
          }}
        >
          Trigger handled error in observable with useObservableWithError
        </button>
        {showComponentThatErrorsWithHandledError && <TriggerErrorWithUseObservableWithError />}
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

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (process.env.NEXT_PUBLIC_SENTRY_ENV === 'production') {
    return {
      notFound: true,
    }
  }
  return { props: await serverSideTranslations(ctx.locale!, ['common']) }
}
