import type { DetailsSectionContentSimpleModalProps } from 'components/DetailsSectionContentSimpleModal'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { FC } from 'react'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { ThemeUIProvider } from 'theme-ui'

export const AjnaDetailsSectionContentSimpleModal: FC<DetailsSectionContentSimpleModalProps> = (
  props,
) => (
  <ThemeUIProvider theme={ajnaExtensionTheme}>
    <DetailsSectionContentSimpleModal {...props} />
  </ThemeUIProvider>
)
