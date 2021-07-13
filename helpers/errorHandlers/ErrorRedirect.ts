import { useAppContext } from 'components/AppContextProvider'
import { useRedirect } from 'helpers/useRedirect'
import { useEffect } from 'react'

export function ErrorRedirect({ error }: { error: any }) {
  const { push } = useRedirect()
  const { errorState$ } = useAppContext()
  useEffect(() => {
    errorState$.next(error.toString())
    push('/error')
  }, [error])
  return null
}
