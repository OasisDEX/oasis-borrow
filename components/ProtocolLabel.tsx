import { NetworkNames, networksByName } from 'blockchain/networks'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import React from 'react'
import { Box, Flex, Image } from 'theme-ui'

export interface ProtocolLabelProps {
  network: NetworkNames
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
        src={lendingProtocolsByName[protocol].logo}
        alt={lendingProtocolsByName[protocol].label}
        sx={{ height: `${10 * lendingProtocolsByName[protocol].logoScale}px` }}
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
