import React, { FC } from 'react'
import {
  DetailsSectionContentSimpleModal,
  DetailsSectionContentSimpleModalProps,
} from 'components/DetailsSectionContentSimpleModal'
import { ajnaExtensionTheme } from 'theme'
import { ThemeProvider } from 'theme-ui'

export const AjnaDetailsSectionContentSimpleModal: FC<DetailsSectionContentSimpleModalProps> = (
  props,
) => (
  <ThemeProvider theme={ajnaExtensionTheme}>
    <DetailsSectionContentSimpleModal {...props} />
  </ThemeProvider>
)
