import { Icon } from '@makerdao/dai-ui-icons'
import { NetworkConfigHexId, NetworkNames } from 'blockchain/networks'
import { NetworkConfig } from 'blockchain/networks'
import { ConnectorInformation } from 'features/web3OnBoard'
import React from 'react'
import { Box, Button, Image, Link } from 'theme-ui'

export const NetworkButton = ({
  network,
  connect,
  connecting,
  currentNetworkName,
  currentHoverNetworkName,
  setCurrentHoverNetworkName,
}: {
  network: NetworkConfig
  connect: (
    chainId?: NetworkConfigHexId,
    options?: {
      forced?: boolean
      onConnect?: (info: ConnectorInformation) => void
    },
  ) => Promise<void>
  connecting: boolean
  currentNetworkName: NetworkNames | undefined
  currentHoverNetworkName: NetworkNames | undefined
  setCurrentHoverNetworkName: React.Dispatch<React.SetStateAction<NetworkNames | undefined>>
}) => {
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
        onClick={() => connect(network.hexId)}
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
            <Icon name="tick" color="interactive100" />
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
                href={link.url}
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
                <Icon name="arrow_right_light" />
              </Link>
            ))}
          </Box>
        )}
    </Box>
  )
}
