import { MobileSidePanelClose, MobileSidePanelPortal } from 'components/Modal'
import { useSharedUI } from 'components/SharedUIProvider'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Box, Card } from 'theme-ui'

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
  const { t } = useTranslation()
  const { vaultFormOpened, setVaultFormOpened, setVaultFormToggleTitle } = useSharedUI()
  const [activePanel, setActivePanel] = useState<string>(
    Array.isArray(content) ? content[0].panel : '',
  )

  useEffect(() => {
    setVaultFormToggleTitle(t('edit-vault'))

    return () => {
      setVaultFormToggleTitle(undefined)
      setVaultFormOpened(false)
    }
  }, [])

  const onClose = () => setVaultFormOpened(false)

  return (
    <MobileSidePanelPortal>
      <Box
        sx={{
          display: 'block',
          position: ['fixed', 'relative'],
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transition: ['0.3s transform ease-in-out', '0s'],
          transform: [`translateX(${vaultFormOpened ? '0' : '100'}%)`, 'translateX(0)'],
          bg: ['background', 'transparent'],
          p: [3, 0],
          pt: [0, 0],
          overflowX: ['hidden', 'visible'],
          zIndex: ['modal', 0],
        }}
      >
        <MobileSidePanelClose opened={vaultFormOpened} onClose={onClose} />
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
      </Box>
    </MobileSidePanelPortal>
  )
}
