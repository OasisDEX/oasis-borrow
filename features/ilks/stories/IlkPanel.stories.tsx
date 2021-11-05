import BigNumber from 'bignumber.js'
import { InfoBadge } from 'components/InfoBadge'
import { mockIlkData } from 'helpers/mocks/ilks.mock'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { VaultType } from '../../generalManageVault/generalManageVault'
import { IlkPanel } from '../IlkPanel'

export function SingleIlkPanel({ ilk, vaultType }: { ilk: string; vaultType: VaultType }) {
  const mockedIlk = mockIlkData({
    ilk: ilk,
    debtCeiling: new BigNumber(200),
    ilkDebt: new BigNumber(100),
  })()
  const { t } = useTranslation()

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
      infoBadge={
        ilk === 'ETH-B' ? (
          <InfoBadge sx={{ bg: 'titanWhite', color: 'link' }}>
            {t('asset-page.ilk-panel.best-for-exposure', { token: mockedIlk.token })}
          </InfoBadge>
        ) : (
          <InfoBadge sx={{ bg: 'success', color: 'onSuccess' }}>
            {t('asset-page.ilk-panel.cheapest-borrowing')}
          </InfoBadge>
        )
      }
    />
  )
}

export function WithoutBadge({ ilk, vaultType }: { ilk: string; vaultType: VaultType }) {
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
