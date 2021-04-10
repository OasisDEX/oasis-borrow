import { nullAddress } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { IlkData, protoETHAIlkData, protoUSDCAIlkData, protoWBTCAIlkData } from 'blockchain/ilks'
import { ContextConnected, protoContextConnected } from 'blockchain/network'
import { createVault$, Vault } from 'blockchain/vaults'
import { AppContext, bigNumberTostring, protoTxHelpers } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { BalanceInfo } from 'features/shared/balanceInfo'
import {
  PriceInfo,
  protoETHPriceInfo,
  protoUSDCPriceInfo,
  protoWBTCPriceInfo,
} from 'features/shared/priceInfo'
import { one, zero } from 'helpers/zero'
import { memoize } from 'lodash'
import React from 'react'
import { useEffect } from 'react'
import { of } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

import { createManageVault$, ManageVaultStage, ManageVaultState } from './manageVault'
import { ManageVaultView } from './ManageVaultView'

const VAULT_ID = one

const protoUrnAddress = '0xEe0b6175705CDFEb824e5092d6547C011EbB46A8'

type ManageVaultStory = Partial<ManageVaultState> & {
  title?: string
  context?: ContextConnected
  allowance?: BigNumber
  vault?: Partial<Vault>
  ilkData?: Partial<IlkData>
  priceInfo?: Partial<PriceInfo>
  balanceInfo?: Partial<BalanceInfo>
  urnAddress?: string
  owner?: string
  unlockedCollateral?: BigNumber
  controller?: string
  depositAmount?: BigNumber
  withdrawAmount?: BigNumber
  generateAmount?: BigNumber
  paybackAmount?: BigNumber
  collateral?: BigNumber
  debt?: BigNumber
  stage?: ManageVaultStage
  ilk?: 'ETH-A' | 'WBTC-A' | 'USDC-A'
}

export function manageVaultStory({
  title,
  context,
  allowance,
  priceInfo,
  balanceInfo,
  ilkData,
  urnAddress,
  owner,
  unlockedCollateral,
  controller,
  depositAmount,
  withdrawAmount,
  generateAmount,
  paybackAmount,
  ilk = 'ETH-A',
  proxyAddress = '0xProxyAddress',
  stage = 'collateralEditing',
  collateral = zero,
  debt = zero,
  ...otherState
}: ManageVaultStory = {}) {
  return () => {
    const protoPriceInfo = {
      ...(ilk === 'ETH-A'
        ? protoETHPriceInfo
        : ilk === 'WBTC-A'
        ? protoWBTCPriceInfo
        : protoUSDCPriceInfo),
      ...(priceInfo || {}),
    }

    const protoIlkData = {
      ...(ilk === 'ETH-A'
        ? protoETHAIlkData
        : ilk === 'WBTC-A'
        ? protoWBTCAIlkData
        : protoUSDCAIlkData),
      ...ilkData,
    }

    const protoBalanceInfo: BalanceInfo = {
      collateralBalance: zero,
      ethBalance: zero,
      daiBalance: zero,
      ...balanceInfo,
    }

    const newState: Partial<ManageVaultState> = {
      ...otherState,
      stage,
      ...(depositAmount && {
        depositAmount,
        depositAmountUSD: depositAmount.times(protoPriceInfo.currentCollateralPrice),
      }),
      ...(withdrawAmount && {
        withdrawAmount,
        withdrawAmountUSD: withdrawAmount.times(protoPriceInfo.currentCollateralPrice),
      }),
      ...(generateAmount && {
        generateAmount,
      }),
      ...(paybackAmount && {
        paybackAmount,
      }),
    }

    const context$ = of(context || protoContextConnected)
    const txHelpers$ = of(protoTxHelpers)
    const proxyAddress$ = () => of(proxyAddress)
    const allowance$ = () => of(allowance || maxUint256)

    const oraclePriceData$ = () =>
      of(protoPriceInfo).pipe(
        switchMap(({ currentCollateralPrice }) =>
          of({ currentPrice: currentCollateralPrice, isStaticPrice: true }),
        ),
      )
    const priceInfo$ = () => of(protoPriceInfo)
    const balanceInfo$ = () => of(protoBalanceInfo)
    const ilkData$ = () => of(protoIlkData)

    const normalizedDebt = debt
      .div(protoIlkData.debtScalingFactor)
      .decimalPlaces(18, BigNumber.ROUND_DOWN)

    const cdpManagerUrns$ = () => of(urnAddress || protoUrnAddress)
    const cdpManagerIlks$ = () => of(ilk || 'ETH-A')
    const cdpManagerOwner$ = () => of(owner || proxyAddress || nullAddress)

    const vatUrns$ = () => of({ collateral, normalizedDebt })
    const vatGem$ = () => of(unlockedCollateral || zero)

    const controller$ = () => of(controller || context?.account || protoContextConnected.account)
    const ilkToToken$ = of((ilk: string) => ilk.split('-')[0])

    const vault$ = memoize(
      (id: BigNumber) =>
        createVault$(
          cdpManagerUrns$,
          cdpManagerIlks$,
          cdpManagerOwner$,
          vatUrns$,
          vatGem$,
          ilkData$,
          oraclePriceData$,
          controller$,
          ilkToToken$,
          id,
        ),
      bigNumberTostring,
    )

    const obs$ = createManageVault$(
      context$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilkData$,
      vault$,
      VAULT_ID,
    )

    useEffect(() => {
      const subscription = obs$.pipe(first()).subscribe(({ injectStateOverride }) => {
        injectStateOverride(newState || {})
      })
      return subscription.unsubscribe()
    }, [])

    const ctx = ({
      manageVault$: () => obs$,
    } as any) as AppContext

    return (
      <appContext.Provider value={ctx as any}>
        <ManageVaultStoryContainer title={title} />
      </appContext.Provider>
    )
  }
}

const ManageVaultStoryContainer = ({ title }: { title?: string }) => {
  if (!isAppContextAvailable()) return null
  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <ManageVaultView id={VAULT_ID} />
      </Grid>
    </Container>
  )
}
