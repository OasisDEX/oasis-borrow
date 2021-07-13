import { ReactNode } from 'react'

export function WithErrorHandler({
  error,
  customError: CustomError,
  children,
}: {
  error: string
  customError: React.ComponentType<{ error: string }>
  children: ReactNode
}) {
  if (Array.isArray(error) ? error.some((el) => el !== undefined) : error !== undefined) {
    console.info('Error:', error)

    return <CustomError error={error}></CustomError>
  } else {
    return <>{children}</>
  }
}
