import React from 'react'
import { of } from 'rxjs'
import { flatMap } from 'rxjs/operators'

import { useObservableWithError } from '../../helpers/observableHook'
const streamThatErrors$ = of(1).pipe(flatMap(() => fetch('https://fetch-handled-url')))
export function TriggerErrorWithUseObservableWithError() {
  const { value, error } = useObservableWithError(streamThatErrors$)
  return (
    <>
      TriggerErrorWithUseObservableWithError. value: {JSON.stringify(value)} <br /> error:{' '}
      {JSON.stringify(error)}
    </>
  )
}
