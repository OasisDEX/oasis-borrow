import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
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
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import React from 'react'

interface AjnaContentFooterEarnManageProps {
  afterAvailableToWithdraw?: BigNumber
  availableToWithdraw: BigNumber
  changeVariant?: ChangeVariantType
  collateralToken: string
  isOracless: boolean
  isSimulationLoading?: boolean
  networkId: OmniSupportedNetworkIds
  owner: string
  position: AjnaEarnPosition
  quoteToken: string
  quotePrice: BigNumber
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
  position,
  quotePrice,
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

  const projectedAnnualRewardsContentCardAjnaData = useAjnaCardDataProjectedAnnualRewards({
    owner,
    netValueUsd: position.quoteTokenAmount.times(quotePrice),
    poolAddress: position.pool.poolAddress,
  })

  const totalAjnaRewardsContentCardAjnaData = useAjnaCardDataTotalAjnaRewards({
    owner,
    poolAddress: position.pool.poolAddress,
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
