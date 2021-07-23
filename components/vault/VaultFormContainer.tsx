import { ModalCloseIcon, ModalHTMLOverflow } from 'components/Modal'
import { useSharedUI } from 'components/SharedUIProvider'
import { WithChildren } from 'helpers/types'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Box, Card, Divider, Grid } from 'theme-ui'
import { useBreakpointIndex } from 'theme/useBreakpointIndex'

function VaultFormPortal({ children, mobile }: WithChildren & { mobile: boolean }) {
  return mobile ? ReactDOM.createPortal(children, document.body) : children
}

export function VaultFormContainer({
  children,
  toggleTitle,
}: WithChildren & { toggleTitle: string }) {
  const { vaultFormOpened, setVaultFormOpened, setVaultFormToggleTitle } = useSharedUI()
  const breakpoint = useBreakpointIndex()

  useEffect(() => {
    setVaultFormToggleTitle(toggleTitle)

    return () => setVaultFormToggleTitle(undefined)
  }, [])

  return (
    <VaultFormPortal mobile={breakpoint === 0}>
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
        {breakpoint === 0 && (
          <Box>
            {vaultFormOpened && <ModalHTMLOverflow />}
            <Box
              sx={{
                display: ['flex', 'none'],
                alignItems: 'center',
                justifyContent: 'flex-end',
                py: 3,
                my: 2,
              }}
            >
              <ModalCloseIcon
                close={() => setVaultFormOpened(false)}
                sx={{ top: 0, right: 0, color: 'primary', position: 'relative' }}
                size={3}
              />
            </Box>
            <Divider variant="styles.hrVaultFormTop" sx={{ mt: 0, pt: 0 }} />
          </Box>
        )}
        <Card variant="vaultFormContainer">
          <Grid gap={4} p={[0, 2]}>
            {children}
          </Grid>
        </Card>
      </Box>
    </VaultFormPortal>
  )
}
