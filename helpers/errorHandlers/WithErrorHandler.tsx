import React, { useEffect } from 'react'
import { ErrorModal } from 'helpers/errorHandlers/ErrorModal'
import { useModal } from 'helpers/modalHook'
import { env } from 'process'

export function WithErrorHandler({
  error,
  children,
}: {
  error: string | string[]
  children: React.ReactNode
}) {
  const openModal = useModal()

  useEffect(() => {
    if (isArrayOfErrorsWithoutUndefinedElements(error)) {
      if (env.NODE_ENV !== 'production') {
        console.warn('Error:')
        console.warn(JSON.stringify(error.toString(), null, 4))
      }
      openModal(ErrorModal, { error: error.toString() })
    }
  }, [error])

  if (isArrayOfErrorsWithoutUndefinedElements(error)) {
    return null
  } else {
    return <>{children}</>
  }

  function isArrayOfErrorsWithoutUndefinedElements(innerError: any) {
    return Array.isArray(innerError)
      ? innerError.some((el) => el !== undefined)
      : innerError !== undefined
  }
}
