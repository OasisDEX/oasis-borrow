import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { Box, Button, Flex, Link, Text } from 'theme-ui'
import { InjectTokenIconsDefs } from 'theme/tokenIcons'

import { EarnTable, EarnTablesContainer } from './EarnTable'

export const MissingHeaders = () => (
  <EarnTablesContainer columnCount={3}>
    <EarnTable
      sx={{ maxWidth: '600px' }}
      headerData={[{ label: 'Tokens', tooltip: 'These are tokens' }]}
      rows={[
        [<Text>ETH</Text>, <Text>Ethereum</Text>],
        [<Text>BTC</Text>, <Text>Bitcoin</Text>, <Text>Is the first coin</Text>],
      ]}
    />
  </EarnTablesContainer>
)

export const Positions = () => {
  const data = [
    {
      icon: 'ether_circle_color',
      ilk: 'ETH-A',
      vaultID: '#3290',
      colRatio: '155.20%',
      inDanger: true,
      debt: '1.32m',
      locked: '754.33 ETH',
      variable: '1.1%',
    },
    {
      icon: 'uni_circle_color',
      ilk: 'GUNIV3DAIUSDC2-A',
      vaultID: '#3290',
      colRatio: '223.55%',
      inDanger: false,
      debt: '1.32m',
      locked: '754.33 GUI...',
      variable: '1.1%',
    },
  ]

  const table = <EarnTable
    headerData={[
      {
        label: 'Asset',
        tooltip: 'The asset',
      },
      {
        label: 'Vault ID',
        tooltip: 'A number',
      },
      {
        label: 'Collateral Ratio',
        tooltip: (
          <Box>
            More info on collateral <Link href="#">here</Link>
          </Box>
        ),
      },
      { label: 'Dai Debt', tooltip: 'The Dai Debt' },
      { label: 'Collateral Locked' },
      {
        label: 'Variable %',
        tooltip: 'The variable',
      },
      {
        label: 'Automation',
        tooltip: 'We have all sorts of robots at our base.',
      },
    ]}
    rows={data.map((position) => [
      <Flex sx={{ alignItems: 'center', minWidth: '180px' }}>
        <Icon name={position.icon} size="36px" sx={{ mr: 2 }} /> {position.ilk}
      </Flex>,
      position.vaultID,
      <Text sx={{ color: position.inDanger ? '#D94A1E' : 'onSuccess' }}>
        {position.colRatio}
      </Text>,
      position.debt,
      position.locked,
      position.variable,
      <Button variant="outline">Activate</Button>,
      <Button variant="outline">Edit Vault</Button>,
    ])}
  />

  return (
    <>
      <InjectTokenIconsDefs />
      <Box sx={{ width: '1200px', px: 4 }}>
        <EarnTablesContainer columnCount={8}>
          {table}
          {table}
        </EarnTablesContainer>
      </Box>
    </>
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'EarnTable',
  component: EarnTable,
}
