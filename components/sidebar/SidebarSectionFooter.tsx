import React from 'react'
import { Grid } from 'theme-ui'

import {
  SidebarSectionFooterButton,
  SidebarSectionFooterButtonProps,
} from './SidebarSectionFooterButton'
import { SidebarSectionStatus, SidebarSectionStatusProps } from './SidebarSectionStatus'

export type SidebarSectionFooterButtonSettings = Omit<SidebarSectionFooterButtonProps, 'variant'>

export interface SidebarSectionFooterProps {
  primaryButton: SidebarSectionFooterButtonSettings
  secondaryButton?: SidebarSectionFooterButtonSettings
  textButton?: SidebarSectionFooterButtonSettings
  status?: SidebarSectionStatusProps[]
}

export function SidebarSectionFooter({
  primaryButton,
  secondaryButton,
  textButton,
  status,
}: SidebarSectionFooterProps) {
  const isPrimaryButtonVisible = !primaryButton.hidden
  const isSecondaryButtonVisible = secondaryButton !== undefined && !secondaryButton.hidden
  const isTextButtonVisible = textButton !== undefined && !textButton.hidden
  const isStatusVisible = status !== undefined && status.length > 0
  const isFooterVisible =
    isPrimaryButtonVisible || isSecondaryButtonVisible || isTextButtonVisible || isStatusVisible

  return isFooterVisible ? (
    <Grid
      sx={{
        p: '24px',
        borderTop: 'lightMuted',
      }}
    >
      <SidebarSectionFooterButton {...primaryButton} />
      {secondaryButton && <SidebarSectionFooterButton variant="secondary" {...secondaryButton} />}
      {textButton && <SidebarSectionFooterButton variant="textual" {...textButton} />}
      {!!status?.length && status.map((item, idx) => <SidebarSectionStatus {...item} key={idx} />)}
    </Grid>
  ) : null
}
