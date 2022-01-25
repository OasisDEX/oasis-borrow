import { MobileSidePanelClose, MobileSidePanelPortal } from 'components/Modal'
import { useSharedUI } from 'components/SharedUIProvider'
import { WithChildren } from 'helpers/types'
import React, { useEffect } from 'react'
import { Box, Card, Grid } from 'theme-ui'

export function VaultFormContainer({
  children,
  toggleTitle,
}: WithChildren & { toggleTitle: string }) {
  const { vaultFormOpened, setVaultFormOpened, setVaultFormToggleTitle } = useSharedUI()

  useEffect(() => {
    setVaultFormToggleTitle(toggleTitle)

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
        <Card variant="vaultFormContainer">
          <Grid gap={4} p={[0, 2]}>
            {children}
          </Grid>
        </Card>
      </Box>
    </MobileSidePanelPortal>
  )
}
