import React, { useState } from 'react'
import { Card } from 'theme-ui'

import { SidebarSectionContent, SidebarSectionContentProps } from './SidebarSectionContent'
import { SidebarSectionFooter, SidebarSectionFooterProps } from './SidebarSectionFooter'
import { SidebarSectionHeader, SidebarSectionHeaderProps } from './SidebarSectionHeader'

interface SidebarSectionProps
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
  progress,
}: SidebarSectionProps) {
  const [activePanel, setActivePanel] = useState<string>(
    Array.isArray(content) ? content[0].panel : '',
  )

  return (
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
        progress={progress}
      />
    </Card>
  )
}
