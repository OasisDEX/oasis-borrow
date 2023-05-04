import React from 'react'
import { Box, Flex } from 'theme-ui'

const assetsTableDataCellProtocolBackgrounds = {
  'Aave v2': 'linear-gradient(229.92deg, #B6509E 15.42%, #2EBAC6 84.42%)',
  'Aave v3': 'linear-gradient(229.92deg, #B6509E 15.42%, #2EBAC6 84.42%)',
  Ajna: 'linear-gradient(90deg, #F154DB 0%, #974EEA 100%)',
  Maker: 'linear-gradient(152.36deg, #218F6F 17.19%, #66C5A9 95.07%)',
}

export type AssetsTableDataCellProtocols = keyof typeof assetsTableDataCellProtocolBackgrounds

interface AssetsTableDataCellProtocolProps {
  protocol: AssetsTableDataCellProtocols
}

export function AssetsTableDataCellProtocol({ protocol }: AssetsTableDataCellProtocolProps) {
  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      <Box
        sx={{
          width: '10px',
          height: '10px',
          mr: 2,
          borderRadius: 'ellipse',
          background: assetsTableDataCellProtocolBackgrounds[protocol],
        }}
      />
      {protocol}
    </Flex>
  )
}
