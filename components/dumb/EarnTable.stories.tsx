import React from 'react'
import { Box, Text, Link } from 'theme-ui'
import { EarnTable } from './EarnTable'

export const MissingHeaders = () => (
  <EarnTable 
    headerData={[{ label: 'Tokens', tooltip: 'These are tokens'}]}
    rows={[
      [<Text>ETH</Text>, <Text>Ethereum</Text>],
      [<Text>BTC</Text>, <Text>Bitcoin</Text>, <Text>Is the first coin</Text>]
    ]}
  />
)

export const Numbers = () => (
   <EarnTable 
    headerData={[
      { label: 'Collateral Ratio', tooltip: <Box>More info on collateral <Link href="#">here</Link></Box>},
      { label: 'Dai Debt', tooltip: 'The Dai Debt' },
      { label: 'Collateral Locked' }
    ]}
    rows={[
      [<Text sx={{ color: 'red' }}>155.20%</Text>, <Text>1.32m</Text>, <Text>754.33 ETH</Text>],
      [<Text sx={{ color: 'green'}}>223.55%</Text>, <Text>1.32m</Text>, <Text>754.33 GUI...</Text>]
    ]}
  />
)

// eslint-disable-next-line import/no-default-export
export default {
  title: 'EarnTable',
  component: EarnTable
}
