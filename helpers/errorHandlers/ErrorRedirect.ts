import { useRedirect } from 'helpers/useRedirect'
import { useEffect } from 'react'
import { useAppContext } from 'components/AppContextProvider'


export function ErrorRedirect({error}: {error: any}) {
    const { push } = useRedirect()
    const { errorState$ } = useAppContext()
    useEffect(() => {
      errorState$.next(error.toString())
      push('/error')
     }, [error])
    return null
  }