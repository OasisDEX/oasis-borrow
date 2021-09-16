import { Global } from '@emotion/core'
// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { ModalProps } from 'helpers/modalHook'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import { curry } from 'ramda'
import React, { useCallback, useEffect, useState } from 'react'
import { TRANSITIONS } from 'theme'
import { Box, Card, Container, Flex, IconButton, SxStyleProp, Text } from 'theme-ui'

interface ModalCloseIconProps extends ModalProps<WithChildren> {
  sx?: SxStyleProp
  size?: number
  color?: string
}

export function ModalCloseIcon({ close, sx, size = 26, color = 'onSurface' }: ModalCloseIconProps) {
  const handleEscClose = useCallback((event) => {
    const { keyCode } = event
    if (keyCode === 27) {
      close()
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
          color: 'primary',
        },
        ...sx,
      }}
    >
      <Icon name="close_squared" size={size} />
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
export function ModalHTMLOverflow({ close }: { close: () => void }) {
  const [compensateWidth, setCompensateWidth] = useState(false)

  useEffect(() => {
    document.body.style.width = `${document.body.clientWidth}px`
    setCompensateWidth(true)

    const curriedOverflowClickHandler = curry(overflowClickHandler)(close)

    document.body.addEventListener('click', curriedOverflowClickHandler)

    return () => {
      document.body.removeAttribute('style')
      document.body.removeEventListener('click', curriedOverflowClickHandler)
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

function ModalWrapper({ children, close }: WithChildren & { close: () => void }) {
  return (
    <Box
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
      }}
    >
      <ModalHTMLOverflow close={close} />
      {children}
    </Box>
  )
}

export function Modal({ children, variant, sx, close }: ModalProps) {
  return (
    <ModalWrapper close={close}>
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
          borderColor: 'onError',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mt: 3,
          mb: 2,
        }}
      >
        <Icon name="close_squared" color="onError" size={30} />
      </Flex>
      <Text sx={{ fontSize: 5, textAlign: 'center', mt: 3 }}>{t(message)}</Text>
    </Box>
  )
}
