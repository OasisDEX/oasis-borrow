import { Icon } from 'components/Icon'
import { MobileSidePanel } from 'components/Modal'
import React, { useState } from 'react'
import { edit } from 'theme/icons'
import { Card } from 'theme-ui'

import type { SidebarSectionContentProps } from './SidebarSectionContent'
import { SidebarSectionContent } from './SidebarSectionContent'
import type { SidebarSectionFooterProps } from './SidebarSectionFooter'
import { SidebarSectionFooter } from './SidebarSectionFooter'
import type { SidebarSectionHeaderProps } from './SidebarSectionHeader'
import { SidebarSectionHeader } from './SidebarSectionHeader'

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
  disableMaxHeight,
}: SidebarSectionProps) {
  const [activePanel, setActivePanel] = useState<string>(
    Array.isArray(content) ? content[0].panel : '',
  )

  return (
    <MobileSidePanel toggleTitle={<Icon icon={edit} color="success100" />}>
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
        <SidebarSectionContent
          content={content}
          activePanel={activePanel}
          disableMaxHeight={disableMaxHeight}
        />
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
