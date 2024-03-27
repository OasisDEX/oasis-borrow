import type { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault.types'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { type PositionId } from 'summerfi-sdk-common'

import { type RefinanceContextInput, RefinanceContextProvider } from './RefinanceContext'

interface MakerRefinanceContextProps {
  generalManageVault: GeneralManageVaultState
  chainId: number
  address?: string
}

export function MakerRefinanceContext({
  children,
  generalManageVault,
  chainId,
  address,
}: PropsWithChildren<MakerRefinanceContextProps>) {
  // return children
  const { vault, priceInfo } = generalManageVault.state
  const slippage = generalManageVault.state.slippage.toNumber()
  const positionId: PositionId = {
    id: vault.id.toString(),
  }
  const collateralTokenSymbol = vault.token
  const debtTokenSymbol = 'DAI'

  const tokenPrices = {
    [collateralTokenSymbol]: priceInfo?.currentCollateralPrice.toString(),
    [debtTokenSymbol]: '1',
  }

  const liquidationPrice = generalManageVault.state.vault.liquidationPrice.toString()

  const ctx: RefinanceContextInput = {
    positionId,
    address,
    chainId,
    slippage,
    collateralTokenSymbol,
    debtTokenSymbol,
    collateralAmount: vault.lockedCollateral.toString(),
    debtAmount: vault.debt.toString(),
    tokenPrices,
    liquidationPrice,
  }

  return <RefinanceContextProvider contextInput={ctx}>{children}</RefinanceContextProvider>
}
