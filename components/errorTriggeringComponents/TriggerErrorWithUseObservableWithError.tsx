import React from 'react'
import { throwError } from 'rxjs'

import { useObservable } from '../../helpers/observableHook'

const streamThatErrors$ = throwError(() => {
  return new Error('Try me!')
})

export function TriggerErrorWithUseObservableWithError() {
  const { value, error } = useObservable(streamThatErrors$)
  return (
    <>
      TriggerErrorWithUseObservableWithError. value: {JSON.stringify(value)} <br /> error:{' '}
      {JSON.stringify(error)}
    </>
  )
}
