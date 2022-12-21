import { useAppContext } from 'components/AppContextProvider'
import { MobileSidePanelPortal, ModalCloseIcon } from 'components/Modal'
import { useSharedUI } from 'components/SharedUIProvider'
import { UserSettings, UserSettingsButtonContents } from 'features/userSettings/UserSettingsView'
import { getShouldHideHeaderSettings } from 'helpers/functions'
import { useObservable } from 'helpers/observableHook'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import React, { useState } from 'react'
import { Box, Button, Card, Flex } from 'theme-ui'

export function WalletPanelMobile() {
  const { accountData$, context$, web3Context$ } = useAppContext()
  const { vaultFormToggleTitle, setVaultFormOpened } = useSharedUI()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [context] = useObservable(context$)
  const [accountData] = useObservable(accountData$)
  const [web3Context] = useObservable(web3Context$)
  const componentRef = useOutsideElementClickHandler(() => setIsOpen(false))

  const shouldHideSettings = getShouldHideHeaderSettings(context, accountData, web3Context)

  if (shouldHideSettings) return null

  return (
    <>
      <Flex
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bg: 'rgba(255,255,255,0.9)',
          p: 3,
          justifyContent: 'space-between',
          gap: 2,
          zIndex: 3,
        }}
      >
        <Button
          variant="menuButton"
          onClick={() => setIsOpen(true)}
          sx={{ p: 1, width: vaultFormToggleTitle ? undefined : '100%', color: 'neutral80' }}
        >
          <UserSettingsButtonContents {...{ context, accountData, web3Context }} />
        </Button>
        {vaultFormToggleTitle && (
          <Button variant="menuButton" sx={{ px: 3 }} onClick={() => setVaultFormOpened(true)}>
            <Box>{vaultFormToggleTitle}</Box>
          </Button>
        )}
      </Flex>
      <MobileSidePanelPortal>
        <Box
          sx={{
            display: 'block',
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            transition: '0.3s transform ease-in-out',
            transform: `translateY(${isOpen ? '0' : '100'}%)`,
            bg: 'neutral10',
            p: 3,
            pt: 0,
            zIndex: 'modal',
            boxShadow: 'bottomSheet',
            borderTopLeftRadius: 'large',
            borderTopRightRadius: 'large',
          }}
          ref={componentRef}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              pt: 2,
            }}
          >
            <ModalCloseIcon
              close={() => setIsOpen(false)}
              sx={{ top: 0, right: 0, color: 'primary100', position: 'relative' }}
              size={3}
            />
          </Box>
          <Card variant="vaultFormContainer" sx={{ p: 2 }}>
            <UserSettings />
          </Card>
        </Box>
      </MobileSidePanelPortal>
    </>
  )
}
