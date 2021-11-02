import BigNumber from 'bignumber.js'
import { mockIlkData } from 'helpers/mocks/ilks.mock'
import React from 'react'

import { VaultType } from '../../generalManageVault/generalManageVault'
import { IlkPanel } from '../IlkPanel'

export function SingleIlkPanel({ ilk, vaultType }: { ilk: string; vaultType: VaultType }) {
  const mockedIlk = mockIlkData({
    ilk: ilk,
    debtCeiling: new BigNumber(200),
    ilkDebt: new BigNumber(100),
  })()
  return (
    <IlkPanel
      ilkData={mockedIlk}
      debt={10017}
      description="Generally best for getting multiply exposure to ETH."
      vaultType={vaultType}
      vaultEstimations={{
        sliderEstimatedValue: 10000,
        sliderValue: 5000,
        daiDebt: 30000,
      }}
      isCheapestBorrowing={ilk === 'ETH-A'}
      isBestForExposure={ilk === 'ETH-B'}
    />
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'Ilk panels',
  argTypes: {
    ilk: {
      description: 'Select ilk',
      options: ['ETH-A', 'ETH-B', 'ETH-C'],
      control: { type: 'radio' },
      defaultValue: 'ETH-A',
    },
    vaultType: {
      description: 'Select vault type',
      options: ['borrow', 'multiply'],
      control: { type: 'radio' },
      defaultValue: 'borrow',
    },
  },
}
