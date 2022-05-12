import React from 'react'
import { InjectTokenIconsDefs } from 'theme/tokenIcons'

import { PositionList } from './PositionList'

export const Positions = () => {
  const positions = [
    {
      type: 'borrow' as const,
      icon: 'ether_circle_color',
      ilk: 'ETH-A',
      vaultID: '#3290',
      collateralRatio: '155.20%',
      inDanger: true,
      daiDebt: '1.32m',
      collateralLocked: '754.33 ETH',
      variable: '1.1%',
      automationEnabled: true,
      protectionAmount: '155%',
      onEditClick: () => alert('Editing vault 3290'),
      onAutomationClick: () => alert('Disabling automation for vault 3290'),
    },
    {
      type: 'borrow' as const,
      icon: 'uni_circle_color',
      ilk: 'GUNIV3DAIUSDC2-A',
      vaultID: '#3291',
      collateralRatio: '223.55%',
      inDanger: false,
      daiDebt: '1.32m',
      collateralLocked: '754.33 GUI...',
      variable: '1.1%',
      automationEnabled: false,
      onEditClick: () => alert('Editing vault 3291'),
      onAutomationClick: () => alert('Enabling automation for vault 3291'),
    },
    {
      type: 'multiply' as const,
      icon: 'ether_circle_color',
      ilk: 'ETH-A',
      vaultID: '#3292',
      netValue: '1.23m',
      multiple: '2.2x',
      liquidationPrice: '1888.29 ETH',
      fundingCost: '1.1%',
      automationEnabled: true,
      onEditClick: () => alert('Editing vault 3292'),
      onAutomationClick: () => alert('Disabling automation for vault 3292'),
    },
    {
      type: 'earn' as const,
      icon: 'ether_circle_color',
      ilk: 'ETH-A',
      vaultID: '#3293',
      netValue: '1.23m',
      pnl: '+ $100k',
      sevenDayYield: '11.29%',
      liquidity: '11.2m DAI',
      onEditClick: () => alert('Editing vault 3293'),
    },
  ]

  return (
    <>
      <InjectTokenIconsDefs />
      <PositionList positions={positions} />
    </>
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'PositionList',
  component: PositionList,
}
