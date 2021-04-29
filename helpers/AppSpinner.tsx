import React, { ReactElement } from 'react'
import { Box, Flex, Spinner, SxStyleProp } from 'theme-ui'

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
    // fontSize: 0px used to hide empty space created below Spinner SVG
    <Box sx={{ fontSize: '0px', textAlign: 'center' }}>
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
    </Box>
  )
}

export function AppSpinnerWholePage() {
  return (
    <Flex
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box sx={{ transform: 'translateY(-50%)' }}>
        <AppSpinner variant="styles.spinner.extraLarge" />
      </Box>
    </Flex>
  )
}

type WithLoadingIndicatorChildren<T> = (loadable: T) => ReactElement<any>

interface WithLoadingIndicatorProps<T> {
  value: T | undefined
  error: any
  children: WithLoadingIndicatorChildren<T>
  variant?: string
  customError?: (error: any) => ReactElement<any>
}

export function WithLoadingIndicator<T>(props: WithLoadingIndicatorProps<T>) {
  const { value, error, children, customError } = props

  if (
    value === undefined &&
    (error || (Array.isArray(error) && error.some((el) => el !== undefined)))
  ) {
    console.info('Error:', error)

    return customError || <Box>Error</Box>
  }

  if (value === undefined || (Array.isArray(value) && value.some((el) => el === undefined))) {
    return <AppSpinnerWholePage />
  }

  if (Array.isArray(children)) {
    return children[0](value)
  }

  return children(value)
}
