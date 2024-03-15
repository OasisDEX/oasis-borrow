import { ChainFamilyMap, getChainInfoByChainId } from '@summerfi/sdk-client'
import { type PositionId, TokenAmount } from '@summerfi/sdk-common/dist/common'
import type { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault.types'
import type { PropsWithChildren } from 'react'
import React from 'react'

import { mapTokenToSdkToken } from './mapTokenToSdkToken'
import { type RefinanceContext, RefinanceContextProvider } from './RefinanceContext'

interface MakerRefinanceContextProps {
  generalManageVault: GeneralManageVaultState
}

export function MakerRefinanceContext({
  children,
  generalManageVault,
}: PropsWithChildren<MakerRefinanceContextProps>) {
  const { vault } = generalManageVault.state
  const slippage = generalManageVault.state.slippage.toNumber()
  const positionId: PositionId = {
    id: vault.id.toString(),
  }
  const chainInfo = getChainInfoByChainId(ChainFamilyMap.Ethereum)

  const collateralAmount = TokenAmount.createFrom({
    // TODO check backingCollateral
    amount: vault.backingCollateral.toString(),
    token: mapTokenToSdkToken(chainInfo, vault.token),
  })
  const debtAmount = TokenAmount.createFrom({
    amount: vault.debt.toString(),
    token: mapTokenToSdkToken(chainInfo, 'DAI'),
  })

  const ctx: RefinanceContext = {
    collateralAmount,
    debtAmount,
    positionId,
    slippage,
  }

  return <RefinanceContextProvider context={ctx}>{children}</RefinanceContextProvider>
}
