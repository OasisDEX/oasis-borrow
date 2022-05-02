import React from 'react'
import { Text } from 'theme-ui'
import { EarnTable } from './EarnTable'

export const MissingHeader = () => {
  return <EarnTable 
    headerData={[{ label: 'Tokens', tooltip: 'These are tokens'}]}
    rows={[
      [<Text>ETH</Text>, <Text>Ethereum</Text>],
      [<Text>BTC</Text>, <Text>Bitcoin</Text>, <Text>Is the first coin</Text>]
    ]}
  />
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'EarnTable',
  component: EarnTable
}
