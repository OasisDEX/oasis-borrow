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
    if (Array.isArray(error) ? error.some((el) => el !== undefined) : error !== undefined) {
      openModal(ErrorModal, { error: error.toString() })
    }
  }, [error])

  if (Array.isArray(error) ? error.some((el) => el !== undefined) : error !== undefined) {
    return null
  } else {
    return <>{children}</>
  }
}
