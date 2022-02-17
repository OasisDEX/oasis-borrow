import React from 'react'
import { of } from 'rxjs'
import { flatMap } from 'rxjs/operators'

import { useObservable } from '../../helpers/observableHook'

const streamThatErrors$ = of(1).pipe(flatMap(() => fetch('https://fetch-unhandled-url')))

export function TriggerErrorWithUseObservable() {
  const value = useObservable(streamThatErrors$)
  return <>TriggerErrorWithUseObservable {JSON.stringify(value)}</>
}
