import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import {
  OmniContentCard,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import {
  useAjnaCardDataAvailableToWithdrawEarn,
  useAjnaCardDataProjectedAnnualRewards,
  useAjnaCardDataTotalAjnaRewards,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import { isPoolWithRewards } from 'features/omni-kit/protocols/ajna/helpers'
import React from 'react'

interface AjnaContentFooterEarnManageProps {
  afterAvailableToWithdraw?: BigNumber
  availableToWithdraw: BigNumber
  changeVariant?: ChangeVariantType
  collateralToken: string
  isOracless: boolean
  isSimulationLoading?: boolean
  networkId: NetworkIds
  owner: string
  position: AjnaEarnPosition
  projectedAnnualReward: BigNumber
  quoteToken: string
}

export function AjnaContentFooterEarnManage({
  afterAvailableToWithdraw,
  availableToWithdraw,
  changeVariant,
  collateralToken,
  isOracless,
  isSimulationLoading,
  networkId,
  owner,
  quoteToken,
}: AjnaContentFooterEarnManageProps) {
  const commonContentCardData = {
    asFooter: true,
    changeVariant,
    isLoading: isSimulationLoading,
  }

  const availableToWithdrawContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: afterAvailableToWithdraw,
    tokensAmount: availableToWithdraw,
    tokensSymbol: quoteToken,
    translationCardName: 'available-to-withdraw',
  })
  const availableToWithdrawContentCardAjnaData = useAjnaCardDataAvailableToWithdrawEarn({
    availableToWithdraw,
    quoteToken,
  })

  const projectedAnnualRewardsContentCardAjnaData = useAjnaCardDataProjectedAnnualRewards()

  const totalAjnaRewardsContentCardAjnaData = useAjnaCardDataTotalAjnaRewards({
    owner,
  })

  return (
    <>
      <OmniContentCard
        {...commonContentCardData}
        {...availableToWithdrawContentCardCommonData}
        {...availableToWithdrawContentCardAjnaData}
      />
      {isPoolWithRewards({ collateralToken, networkId, quoteToken }) && !isOracless && (
        <>
          <OmniContentCard asFooter {...projectedAnnualRewardsContentCardAjnaData} />
          <OmniContentCard asFooter {...totalAjnaRewardsContentCardAjnaData} />
        </>
      )}
    </>
  )
}
