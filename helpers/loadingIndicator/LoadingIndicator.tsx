import * as React from 'react'
import { Box, Spinner, SxStyleProp } from 'theme-ui'

type LoadingIndicatorPropsChildren<T> =
  | ((loadable: T) => React.ReactElement<any>)
  | [(loadable: T) => React.ReactElement<any>, (error: any) => React.ReactElement<any>]

interface LoadingIndicatorProps<T> {
  value: T | undefined
  error: any
  children: LoadingIndicatorPropsChildren<T>
  variant?: string
}

export function WithLoadingIndicator2<T>(props: LoadingIndicatorProps<T>) {
  const { value, error, children, variant } = props

  if (!value && error) {
    console.log('Error', error)
    if (Array.isArray(children)) {
      return children[1](value)
    }
    return <div>Error!</div>
  }

  if (!value) {
    return <LoadingIndicator {...{ variant }} />
  }

  if (Array.isArray(children)) {
    return children[0](value)
  }

  return children(value)
}

export const LoadingIndicator = ({ variant }: { variant?: string }) => {
  return (
    // fontSize: 0px used to hide empty space created below Spinner SVG
    <Box sx={{ textAlign: 'center', fontSize: '0px' }}>
      <AppSpinner {...{ variant }} />
    </Box>
  )
}

// wrapper for <Spinner /> component from theme-ui implemented because <Spinner /> is not mapped to any default variant
// eg: styles from `styles.spinner.default` in theme definition are not applied.
export function AppSpinner({
  variant,
  sx,
  size,
}: {
  variant?: string
  sx?: SxStyleProp
  size?: number
}) {
  return (
    <Spinner
      variant={variant || 'styles.spinner.default'}
      sx={{
        ...sx,
        ...(size && {
          width: size,
          height: size,
        }),
      }}
    />
  )
}
