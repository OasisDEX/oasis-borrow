import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { useRedirect } from 'helpers/useRedirect'
import { useEffect, useState } from 'react'

export function useReadonlyAccount(withRedirect?: boolean) {
  const { context$ } = useAppContext()
  const context = useObservable(context$)
  const [readonlyAccount, setReadonlyAccount] = useState(false)
  const [account, setAccount] = useState('')
  const { push } = useRedirect()

  useEffect(() => {
    if (withRedirect && readonlyAccount) {
      push(`/owner/${readonlyAccount}`)
    }
  }, [readonlyAccount])

  useEffect(() => {
    setReadonlyAccount(context?.status === 'connected' && context?.readonly)
    setAccount(context?.status === 'connected' ? context?.account : '')
  }, [context])

  return { readonlyAccount, account }
}
