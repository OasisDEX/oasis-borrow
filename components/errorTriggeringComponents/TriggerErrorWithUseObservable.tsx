import React from 'react'
import { throwError } from 'rxjs'

import { useObservable } from '../../helpers/observableHook'

const streamThatErrors$ = throwError(() => {
  return new Error('Try me!')
})

export function TriggerErrorWithUseObservable() {
  const value = useObservable(streamThatErrors$)
  return <>TriggerErrorWithUseObservable {JSON.stringify(value)}</>
}
