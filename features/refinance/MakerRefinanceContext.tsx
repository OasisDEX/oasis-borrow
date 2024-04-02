import type { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault.types'
import { one } from 'helpers/zero'
import type { PropsWithChildren } from 'react'
import React from 'react'
import type { MakerPoolId, PositionId } from 'summerfi-sdk-common'
import { getChainInfoByChainId, ILKType, ProtocolName } from 'summerfi-sdk-common'

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
  const chainInfo = getChainInfoByChainId(chainId)
  if (!chainInfo) {
    throw new Error(`ChainId ${chainId} is not supported`)
  }
  const positionId: PositionId = {
    id: vault.id.toString(),
  }

  const poolId: MakerPoolId = {
    protocol: {
      name: ProtocolName.Maker,
      chainInfo,
    },
    vaultId: vault.id.toString(),
    // ilkType
    // TODO: hardcoded as endpoint is not supporting all ilks and failing
    ilkType: ILKType.ETH_A,
  }
  const collateralTokenSymbol = vault.token
  const debtTokenSymbol = 'DAI'

  const tokenPrices = {
    [collateralTokenSymbol]: priceInfo?.currentCollateralPrice.toString(),
    [debtTokenSymbol]: '1',
  }

  const liquidationPrice = generalManageVault.state.vault.liquidationPrice.toString()
  const borrowRate = generalManageVault.state.ilkData.stabilityFee.toString()
  const ltv = one.div(generalManageVault.state.vault.collateralizationRatio).toString()
  const maxLtv = one.div(generalManageVault.state.ilkData.liquidationRatio).toString()

  const ctx: RefinanceContextInput = {
    poolData: {
      poolId,
      collateralTokenSymbol,
      debtTokenSymbol,
      borrowRate,
      maxLtv,
    },
    environment: {
      address,
      chainId,
      slippage,
      tokenPrices,
    },
    position: {
      positionId,
      collateralAmount: vault.lockedCollateral.toString(),
      debtAmount: vault.debt.toString(),
      liquidationPrice,
      ltv,
    },
  }

  return <RefinanceContextProvider contextInput={ctx}>{children}</RefinanceContextProvider>
}
