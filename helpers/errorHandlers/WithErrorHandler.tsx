import { useModal } from 'helpers/modalHook'
import React from 'react'
import { useEffect } from 'react'

import { ErrorModal } from './ErrorModal'

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
      openModal(ErrorModal, { error: error.toString() })
    }
  }, [error])

  if (isArrayOfErrorsWithoutUndefinedElements(error)) {
    return null
  } else {
    return <>{children}</>
  }

  function isArrayOfErrorsWithoutUndefinedElements(error: any) {
    return Array.isArray(error) ? error.some((el) => el !== undefined) : error !== undefined
  }
}
