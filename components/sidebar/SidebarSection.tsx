import { Icon } from 'components/Icon'
import { MobileSidePanel } from 'components/Modal'
import React, { useState } from 'react'
import { edit } from 'theme/icons'
import { Card, type ThemeUIStyleObject } from 'theme-ui'

import type { SidebarSectionContentProps } from './SidebarSectionContent'
import { SidebarSectionContent } from './SidebarSectionContent'
import type { SidebarSectionFooterProps } from './SidebarSectionFooter'
import { SidebarSectionFooter } from './SidebarSectionFooter'
import type { SidebarSectionHeaderProps } from './SidebarSectionHeader'
import { SidebarSectionHeader } from './SidebarSectionHeader'

export interface SidebarSectionProps
  extends Omit<SidebarSectionHeaderProps, 'onSelect'>,
    Omit<SidebarSectionContentProps, 'activePanel'>,
    SidebarSectionFooterProps {
  withMobilePanel?: boolean
  cardSx?: ThemeUIStyleObject
}

export function SidebarSection({
  title,
  dropdown,
  headerButton,
  content,
  aboveButton,
  primaryButton,
  secondaryButton,
  textButton,
  status,
  requiredChainHexId,
  requireConnection,
  disableMaxHeight,
  withMobilePanel = true,
  cardSx,
  headerBackButton,
  step,
}: SidebarSectionProps) {
  const [activePanel, setActivePanel] = useState<string>(
    Array.isArray(content) ? content[0].panel : '',
  )

  const components = (
    <Card
      sx={{
        position: 'relative',
        p: 0,
        border: 'lightMuted',
        width: '100%',
        ...cardSx,
      }}
    >
      <SidebarSectionHeader
        title={title}
        dropdown={dropdown}
        headerButton={headerButton}
        onSelect={(panel) => {
          setActivePanel(panel)
        }}
        headerBackButton={headerBackButton}
        step={step}
      />
      <SidebarSectionContent
        content={content}
        activePanel={activePanel}
        disableMaxHeight={disableMaxHeight}
      />
      <SidebarSectionFooter
        aboveButton={aboveButton}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
        textButton={textButton}
        status={status}
        requireConnection={requireConnection}
        requiredChainHexId={requiredChainHexId}
      />
    </Card>
  )

  return withMobilePanel ? (
    <MobileSidePanel toggleTitle={<Icon icon={edit} color="success100" />}>
      {components}
    </MobileSidePanel>
  ) : (
    components
  )
}
