import type { NetworkConfig, NetworkConfigHexId, NetworkNames } from 'blockchain/networks'
import { Icon } from 'components/Icon'
import type { SwapWidgetChangeAction, SwapWidgetState } from 'features/swapWidget/SwapWidgetChange'
import { SWAP_WIDGET_CHANGE_SUBJECT } from 'features/swapWidget/SwapWidgetChange'
import { useObservable } from 'helpers/observableHook'
import { uiChanges } from 'helpers/uiChanges'
import React, { useCallback } from 'react'
import { Box, Button, Image, Link } from 'theme-ui'
import { arrow_right_light, tick } from 'theme/icons'

export const NetworkButton = ({
  network,
  setChain,
  connecting,
  currentNetworkName,
  currentHoverNetworkName,
  setCurrentHoverNetworkName,
}: {
  network: NetworkConfig
  setChain: (chainId: NetworkConfigHexId) => void
  connecting: boolean
  currentNetworkName: NetworkNames | undefined
  currentHoverNetworkName: NetworkNames | undefined
  setCurrentHoverNetworkName: React.Dispatch<React.SetStateAction<NetworkNames | undefined>>
}) => {
  const [swapWidgetChange] = useObservable(
    uiChanges.subscribe<SwapWidgetState>(SWAP_WIDGET_CHANGE_SUBJECT),
  )
  const swapWidgetClose = useCallback(() => {
    !swapWidgetChange?.isOpen &&
      uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, { type: 'open' })
  }, [swapWidgetChange?.isOpen])

  const isCurrentNetwork = network.name === currentNetworkName
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '8px 12px',
      }}
    >
      <Button
        variant="networkPicker"
        sx={{
          p: 0,
          fontWeight: isCurrentNetwork ? '600' : '400',
          whiteSpace: 'pre',
          ':hover': {
            fontWeight: '600',
            ...(network.isCustomFork && {
              '::before': {
                top: '-5px',
                left: '-5px',
              },
            }),
          },
          ...(network.isCustomFork && {
            '::before': {
              content: '"👷‍♂️"',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '36px',
              height: '36px',
              display: 'block',
              zIndex: '1',
              transform: 'rotate(-40deg)',
              transition: '0.2s top, 0.2s left',
            },
          }),
        }}
        onClick={() => setChain(network.hexId)}
        disabled={connecting}
        key={network.hexId}
        onMouseOver={() => {
          setCurrentHoverNetworkName(network.name)
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Image
              src={network.icon}
              sx={{
                mr: 3,
                minWidth: 4,
                minHeight: 4,
                position: 'relative',
                zIndex: '2',
              }}
            />
            {network.label}
          </Box>
          <Box
            sx={{
              textAlign: 'right',
              position: 'relative',
              opacity: isCurrentNetwork ? 1 : 0,
              left: isCurrentNetwork ? 0 : 2,
              transition: '0.2s opacity, 0.2s left',
              mb: '-3px',
            }}
          >
            <Icon icon={tick} color="interactive100" />
          </Box>
        </Box>
      </Button>
      {(currentHoverNetworkName === network.name || currentNetworkName === network.name) &&
        network.links && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 8,
              backgroundColor: 'neutral30',
              color: 'interactive100',
              gap: '8px',
              padding: '12px',
            }}
          >
            {network.links.map((link) => (
              <Link
                key={`${link.label}:${link.url}`}
                href={link.url}
                onClick={(e) => {
                  e.stopPropagation()
                  if (link.openBridgeWidget) {
                    swapWidgetClose()
                  }
                }}
                target="_blank"
                sx={{
                  // cursor: 'pointer',
                  height: 22,
                  lineHeight: '22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  alignSelf: 'stretch',
                }}
              >
                {link.label}
                <Icon icon={arrow_right_light} />
              </Link>
            ))}
          </Box>
        )}
    </Box>
  )
}
