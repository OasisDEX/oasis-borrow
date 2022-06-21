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
  return (
    <Grid
      sx={{
        p: '24px',
        borderTop: 'lightMuted',
      }}
    >
      <SidebarSectionFooterButton {...primaryButton} />
      {secondaryButton && <SidebarSectionFooterButton variant="secondary" {...secondaryButton} />}
      {textButton && <SidebarSectionFooterButton variant="textual" {...textButton} />}
      {!!status?.length &&
        status.map((item) => <SidebarSectionStatus {...item} key={item.txHash} />)}
    </Grid>
  )
}
