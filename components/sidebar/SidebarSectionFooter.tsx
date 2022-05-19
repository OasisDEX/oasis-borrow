import { TxStatusCardProgress, TxStatusCardProgressProps } from 'components/vault/TxStatusCard'
import React from 'react'
import { Grid } from 'theme-ui'

import {
  SidebarSectionFooterButton,
  SidebarSectionFooterButtonProps,
} from './SidebarSectionFooterButton'

export type SidebarSectionFooterButtonSettings = Omit<SidebarSectionFooterButtonProps, 'variant'>

export interface SidebarSectionFooterProps {
  primaryButton: SidebarSectionFooterButtonSettings
  secondaryButton?: SidebarSectionFooterButtonSettings
  textButton?: SidebarSectionFooterButtonSettings
  progress?: TxStatusCardProgressProps
}

export function SidebarSectionFooter({
  primaryButton,
  secondaryButton,
  textButton,
  progress,
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
      {progress && <TxStatusCardProgress {...progress} />}
    </Grid>
  )
}
