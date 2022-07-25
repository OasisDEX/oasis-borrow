import React from 'react'
import { InjectTokenIconsDefs } from 'theme/tokenIcons'

import { PositionList } from './PositionList'

export const Positions = () => {
  const positions = [
    {
      type: 'borrow' as const,
      isOwnerView: true,
      icon: 'ether_circle_color',
      ilk: 'ETH-A',
      positionId: '#3290',
      collateralRatio: '155.20%',
      inDanger: true,
      daiDebt: '1.32m',
      collateralLocked: '754.33 ETH',
      variable: '1.1%',
      automationEnabled: true,
      protectionAmount: '155%',
      editLinkProps: {
        href: '',
        onClick: () => alert('Editing vault 3290'),
      },
      automationLinkProps: {
        href: '',
        onClick: () => alert('Disabling automation for vault 3290'),
      },
    },
    {
      type: 'borrow' as const,
      isOwnerView: true,
      icon: 'uni_circle_color',
      ilk: 'GUNIV3DAIUSDC2-A',
      positionId: '#3291',
      collateralRatio: '223.55%',
      inDanger: false,
      daiDebt: '1.32m',
      collateralLocked: '754.33 GUI...',
      variable: '1.1%',
      automationEnabled: false,
      editLinkProps: {
        href: '',
        onClick: () => alert('Editing vault 3291'),
      },
      automationLinkProps: {
        href: '',
        onClick: () => alert('Enabling automation for vault 3291'),
      },
    },
    {
      type: 'multiply' as const,
      isOwnerView: true,
      icon: 'ether_circle_color',
      ilk: 'ETH-A',
      positionId: '#3292',
      netValue: '1.23m',
      multiple: '2.2x',
      liquidationPrice: '1888.29 ETH',
      fundingCost: '1.1%',
      automationEnabled: true,
      editLinkProps: {
        href: '',
        onClick: () => alert('Editing vault 3292'),
      },
      automationLinkProps: {
        href: '',
        onClick: () => alert('Enabling automation for vault 3292'),
      },
    },
    {
      type: 'earn' as const,
      isOwnerView: true,
      icon: 'ether_circle_color',
      ilk: 'ETH-A',
      positionId: '#3293',
      netValue: '1.23m',
      pnl: '+ $100k',
      sevenDayYield: '11.29%',
      liquidity: '11.2m DAI',
      editLinkProps: {
        href: '',
        onClick: () => alert('Editing vault 3293'),
      },
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
