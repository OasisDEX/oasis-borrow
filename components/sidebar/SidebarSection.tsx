import React, { useState } from 'react'
import { Icon } from '@makerdao/dai-ui-icons'
import { MobileSidePanel } from 'components/Modal'
import { SidebarSectionContent, SidebarSectionContentProps } from 'components/sidebar/SidebarSectionContent'
import { SidebarSectionFooter, SidebarSectionFooterProps } from 'components/sidebar/SidebarSectionFooter'
import { SidebarSectionHeader, SidebarSectionHeaderProps } from 'components/sidebar/SidebarSectionHeader'
import { Card } from 'theme-ui'

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
  requiredChainHexId,
  requireConnection,
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
          requireConnection={requireConnection}
          requiredChainHexId={requiredChainHexId}
        />
      </Card>
    </MobileSidePanel>
  )
}
