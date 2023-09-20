import type { DetailsSectionContentSimpleModalProps } from 'components/DetailsSectionContentSimpleModal'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { FC } from 'react'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { ThemeProvider } from 'theme-ui'

export const AjnaDetailsSectionContentSimpleModal: FC<DetailsSectionContentSimpleModalProps> = (
  props,
) => (
  <ThemeProvider theme={ajnaExtensionTheme}>
    <DetailsSectionContentSimpleModal {...props} />
  </ThemeProvider>
)
