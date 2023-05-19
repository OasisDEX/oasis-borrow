import {
  DetailsSectionContentSimpleModal,
  DetailsSectionContentSimpleModalProps,
} from 'components/DetailsSectionContentSimpleModal'
import React, { PropsWithChildren } from 'react'
import { ajnaExtensionTheme } from 'theme'
import { ThemeProvider } from 'theme-ui'

export const AjnaDetailsSectionContentSimpleModal = (
  props: PropsWithChildren<DetailsSectionContentSimpleModalProps>,
) => (
  <ThemeProvider theme={ajnaExtensionTheme}>
    <DetailsSectionContentSimpleModal {...props} />
  </ThemeProvider>
)
