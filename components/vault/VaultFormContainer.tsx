import { Global } from '@emotion/core'
import { ModalCloseIcon } from 'components/Modal'
import { useSharedUI } from 'components/SharedUIProvider'
import { WithChildren } from 'helpers/types'
import React, { useEffect } from 'react'
import { Box, Card, Divider, Grid } from 'theme-ui'
import { useBreakpointIndex } from 'theme/useBreakpointIndex'

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
    <Box
      sx={{
        display: [vaultFormOpened ? 'block' : 'none', 'block'],
        position: ['fixed', 'relative'],
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: ['background', 'transparent'],
        p: [3, 0],
        pt: [0, 0],
        overflowX: ['hidden', 'visible'],
      }}
    >
      {breakpoint === 0 && vaultFormOpened && (
        <Box>
          <Global
            styles={{
              main: {
                zIndex: 5,
              },
              html: {
                overflow: 'hidden',
              },
            }}
          />
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
  )
}
