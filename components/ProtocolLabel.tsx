import { networksByName } from 'blockchain/networksConfig'
import { BaseNetworkNames } from 'helpers/networkNames'
import { LendingProtocol } from 'lendingProtocols'
import { protocolsByName } from 'lendingProtocols/protocolConfigs'
import React from 'react'
import { Box, Flex, Image } from 'theme-ui'

interface ProtocolLabelProps {
  network: BaseNetworkNames
  protocol: LendingProtocol
}

export function ProtocolLabel({ network, protocol }: ProtocolLabelProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        columnGap: 2,
        height: '30px',
        pr: 1,
        pl: '12px',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'large',
        bg: 'neutral10',
        verticalAlign: 'bottom',
      }}
    >
      <Image
        src={protocolsByName[protocol].icon}
        alt={protocolsByName[protocol].label}
        sx={{ height: `${10 * protocolsByName[protocol].scale}px` }}
      />
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          border: '1px solid',
          borderColor: 'neutral20',
          borderRadius: 'ellipse',
        }}
      >
        <Image
          src={networksByName[network].badge}
          alt={networksByName[network].label}
          sx={{ width: '12px', height: '12px' }}
        />
      </Flex>
    </Box>
  )
}
