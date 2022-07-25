import { Icon } from '@makerdao/dai-ui-icons'
import { MobileSidePanel } from 'components/Modal'
import React, { useState } from 'react'
import { Card } from 'theme-ui'

import { SidebarSectionContent, SidebarSectionContentProps } from './SidebarSectionContent'
import { SidebarSectionFooter, SidebarSectionFooterProps } from './SidebarSectionFooter'
import { SidebarSectionHeader, SidebarSectionHeaderProps } from './SidebarSectionHeader'

export interface SidebarSectionProps
  extends Omit<SidebarSectionHeaderProps, 'onSelect'>,
    Omit<SidebarSectionContentProps, 'activePanel'>,
    SidebarSectionFooterProps {}

export function SidebarSection({
  title,
  dropdown,
  headerButton,
  content,
  primaryButton,
  secondaryButton,
  textButton,
  status,
}: SidebarSectionProps) {
  const [activePanel, setActivePanel] = useState<string>(
    Array.isArray(content) ? content[0].panel : '',
  )

  return (
    <MobileSidePanel toggleTitle={<Icon name="edit" color="success100" />}>
      <Card
        sx={{
          position: 'relative',
          p: 0,
          border: 'lightMuted',
        }}
      >
        <SidebarSectionHeader
          title={title}
          dropdown={dropdown}
          headerButton={headerButton}
          onSelect={(panel) => {
            setActivePanel(panel)
          }}
        />
        <SidebarSectionContent content={content} activePanel={activePanel} />
        <SidebarSectionFooter
          primaryButton={primaryButton}
          secondaryButton={secondaryButton}
          textButton={textButton}
          status={status}
        />
      </Card>
    </MobileSidePanel>
  )
}
