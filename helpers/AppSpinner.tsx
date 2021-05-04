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

// By specifing P you may also omit other types in tuple
// TO DO solve issue with storybook workflow failing and use that
// type OmitInTuple<T, P = undefined> = T extends [infer U, ...(infer Y)]
//   ? [...(Exclude<U, P> extends never ? [] : [Exclude<U, undefined>]), ...OmitInTuple<Y>]
//   : T

type OmitInTuple<T> = T extends readonly [any, ...any[]]
  ? { [entry in keyof T]: Exclude<T[entry], undefined> }
  : T

interface WithLoadingIndicatorProps<T> {
  value: T | undefined
  error: any
  children: (loadable: OmitInTuple<T>) => ReactElement
  variant?: string
  customError?: ReactElement
  customLoader?: ReactElement
}

export function WithLoadingIndicator<T extends readonly [any, ...any[]] | object>(
  props: WithLoadingIndicatorProps<T>,
) {
  const { value, error, children, customError, customLoader } = props

  if (
    value === undefined &&
    (error || (Array.isArray(error) && error.some((el) => el !== undefined)))
  ) {
    console.info('Error:', error)

    return (
      customError || (
        <Box>
          {Array.isArray(error)
            ? error.map((el, i) => <Box key={i}>{el?.message || 'Error'}</Box>)
            : error?.message || 'Error'}
        </Box>
      )
    )
  }

  if (value === undefined || (Array.isArray(value) && value.some((el) => el === undefined))) {
    return customLoader || <AppSpinnerWholePage />
  }

  if (Array.isArray(children)) {
    return children[0](value)
  }

  return children(value as OmitInTuple<T>)
}
