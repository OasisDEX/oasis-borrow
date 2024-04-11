import { Global } from '@emotion/core'
import { useSharedUI } from 'components/SharedUIProvider'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { ModalProps } from 'helpers/modalHook'
import { Trans, useTranslation } from 'next-i18next'
import type { PropsWithChildren, ReactNode } from 'react'
import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { TRANSITIONS } from 'theme'
import { close_squared } from 'theme/icons'
import { useOnMobile } from 'theme/useBreakpointIndex'
import type { ThemeUIStyleObject } from 'theme-ui'
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  IconButton,
  Text,
} from 'theme-ui'

import { Icon } from './Icon'
import { AppLink } from './Links'
import curry from 'ramda/src/curry'

interface ModalCloseIconProps extends PropsWithChildren<ModalProps> {
  sx?: ThemeUIStyleObject
  size?: number
  color?: string
}

export function ModalCloseIcon({ close, sx, size = 3, color = 'neutral80' }: ModalCloseIconProps) {
  const handleEscClose = useCallback((event) => {
    const { keyCode } = event
    if (keyCode === 27) {
      close && close()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleEscClose)
    return () => {
      window.removeEventListener('keydown', handleEscClose)
    }
  }, [])

  return (
    <IconButton
      onClick={close}
      sx={{
        cursor: 'pointer',
        height: 4,
        width: 4,
        padding: 0,
        position: 'absolute',
        top: 3,
        right: 3,
        zIndex: 1,
        transition: TRANSITIONS.global,
        color,
        '&:hover': {
          color: 'primary100',
        },
        ...sx,
      }}
    >
      <Icon icon={close_squared} size={size} />
    </IconButton>
  )
}

// This will recursively look down to every single child of the target element.
function iterateAllNodes(target: Node, container: Node[] = [], id = 0) {
  let nodes = [...container, target]
  target.childNodes.forEach((node) => {
    if (node.childNodes.length) {
      nodes = [...iterateAllNodes(node, nodes, ++id)]
    } else {
      nodes.push(node)
    }
  })

  return nodes
}

// The logic is as follows:
// Whenever we click on an element, the event.target is the element where the event was fired on.
// If the modal container id is part of the children then that means we clicked outside of it.
// If the modal container is is not part of the chilren then that means we clicked inside of it.
function overflowClickHandler(onClick: () => void, event: MouseEvent) {
  event.stopPropagation()
  if (event.target) {
    const hasClickedOnOverlay = iterateAllNodes(event.target as Node).find(
      (node: any) => node.id === 'modalContainer',
    )
    if (hasClickedOnOverlay) {
      if (onClick) {
        onClick()
      }
    }
  }
}

// Helper component to compensate jumping of window upon opening Modal
export function ModalHTMLOverflow() {
  const [compensateWidth, setCompensateWidth] = useState(false)

  useEffect(() => {
    document.body.style.width = `${document.body.clientWidth}px`
    setCompensateWidth(true)

    return () => {
      document.body.removeAttribute('style')
    }
  }, [])

  return compensateWidth ? (
    <Global
      styles={{
        html: {
          overflow: 'hidden',
        },
      }}
    />
  ) : null
}

function ModalWrapper({
  children,
  id,
  close,
  sxWrapper,
  omitHTMLOverflow,
}: PropsWithChildren<{
  close: () => void
  id?: string
  sxWrapper?: ThemeUIStyleObject
  omitHTMLOverflow?: boolean
}>) {
  useEffect(() => {
    const curriedOverflowClickHandler = curry(overflowClickHandler)(close)

    document.body.addEventListener('click', curriedOverflowClickHandler)

    return () => {
      document.body.removeEventListener('click', curriedOverflowClickHandler)
    }
  }, [close])

  return (
    <Box
      id={id}
      sx={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        zIndex: 'modal',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'block',
        bg: '#00000080',
        overflow: 'auto',
        ...sxWrapper,
      }}
    >
      {!omitHTMLOverflow && <ModalHTMLOverflow />}
      {children}
    </Box>
  )
}

export function Modal({
  children,
  variant,
  sx,
  sxWrapper,
  close,
  id,
  omitHTMLOverflow,
}: ModalProps) {
  return (
    <ModalWrapper {...{ close, id, sxWrapper, omitHTMLOverflow }}>
      <Flex
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          ...sx,
        }}
      >
        <Container id="modalContainer" variant={variant || 'modalHalf'} m="auto" py={2}>
          <Card id="modalCard" p={0} sx={{ position: 'relative' }}>
            {children}
          </Card>
        </Container>
      </Flex>
    </ModalWrapper>
  )
}

export function ModalErrorMessage({ message }: { message: string }) {
  const { t } = useTranslation()

  return (
    <Box my={4}>
      <Flex
        sx={{
          width: '98px',
          height: '98px',
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'critical100',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mt: 3,
          mb: 2,
        }}
      >
        <Icon icon={close_squared} color="critical100" size={30} />
      </Flex>
      <Text sx={{ fontSize: 5, textAlign: 'center', mt: 3 }}>{t(message)}</Text>
    </Box>
  )
}

export function MobileSidePanelPortal({ children }: PropsWithChildren<{}>) {
  const onMobile = useOnMobile()

  return onMobile && document.body ? createPortal(children, document.body) : <>{children}</>
}

export function MobileSidePanel({
  toggleTitle,
  children,
}: PropsWithChildren<{ toggleTitle: ReactNode }>) {
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
          bg: ['neutral10', 'transparent'],
          p: [3, 0],
          pt: [0, 0],
          overflowX: ['hidden', 'visible'],
          zIndex: ['modal', 0],
        }}
      >
        <MobileSidePanelClose opened={vaultFormOpened} onClose={onClose} />
        {children}
      </Box>
    </MobileSidePanelPortal>
  )
}

export function MobileSidePanelClose({
  opened,
  onClose,
}: {
  opened: boolean
  onClose: () => void
}) {
  const onMobile = useOnMobile()

  return onMobile ? (
    <Box>
      {opened && <ModalHTMLOverflow />}
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
          close={onClose}
          sx={{ top: 0, right: 0, color: 'primary100', position: 'relative' }}
          size={3}
        />
      </Box>
      <Divider variant="hrVaultFormTop" sx={{ mt: 0, pt: 0 }} />
    </Box>
  ) : null
}

export const MODAL_CONTAINER_TREZOR_METAMASK_EIP1559 = 'trezor-metamask-eip1559'

export function ModalTrezorMetamaskEIP1559() {
  const { disconnect } = useWalletManagement()

  function close() {
    const modal = document.getElementById(MODAL_CONTAINER_TREZOR_METAMASK_EIP1559)

    if (modal) {
      modal.style.display = 'none'
      document.documentElement.style.overflow = 'auto'
    }
  }

  const disconnectHandler = async () => {
    disconnect()
    close()
  }

  return (
    <Modal
      id={MODAL_CONTAINER_TREZOR_METAMASK_EIP1559}
      close={close}
      sx={{ maxWidth: '450px', mx: 'auto' }}
      sxWrapper={{ display: 'none', zIndex: 'modalOnMobilePanel' }}
      omitHTMLOverflow
    >
      <Grid sx={{ p: 4, fontSize: 2 }}>
        <Heading>
          <Trans i18nKey="modal-trezor-eip1559-title" />
        </Heading>
        <ModalCloseIcon close={close} />
        <Box>
          <Trans
            i18nKey="modal-trezor-eip1559-paragraph1"
            components={[
              <AppLink sx={{ fontSize: 'inherit' }} href={EXTERNAL_LINKS.METAMASK_12130_ISSUE} />,
            ]}
          />
        </Box>
        <Box>
          <Trans
            i18nKey="modal-trezor-eip1559-paragraph2"
            components={[<AppLink sx={{ fontSize: 'inherit' }} href={EXTERNAL_LINKS.LEGACY_APP} />]}
          />
        </Box>
        <Box>
          <Trans
            i18nKey="modal-trezor-eip1559-paragraph3"
            components={[
              <Button
                variant="textual"
                sx={{
                  textAlign: 'left',
                  p: 0,
                  verticalAlign: 'baseline',
                  fontSize: 'inherit',
                }}
                onClick={disconnectHandler}
              />,
            ]}
          />
        </Box>
      </Grid>
    </Modal>
  )
}
