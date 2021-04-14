import { nullAddress } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { protoETHAIlkData, protoUSDCAIlkData, protoWBTCAIlkData } from 'blockchain/ilks'
import { ContextConnected, protoContextConnected } from 'blockchain/network'
import { createVault$, Vault } from 'blockchain/vaults'
import { AppContext, bigNumberTostring, protoTxHelpers } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { ManageVaultView } from 'features/manageVault/ManageVaultView'
import { BalanceInfo } from 'features/shared/balanceInfo'
import {
  PriceInfo,
  protoETHPriceInfo,
  protoUSDCPriceInfo,
  protoWBTCPriceInfo,
} from 'features/shared/priceInfo'
import { one, zero } from 'helpers/zero'
import { memoize } from 'lodash'
import React, { useEffect } from 'react'
import { of } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

import {
  createManageVault$,
  ManageVaultStage,
  ManageVaultState,
  PAYBACK_ALL_BOUND,
} from './manageVault'
interface Story {
  title?: string
  context?: ContextConnected
  proxyAddress?: string
  allowance?: BigNumber
  vault?: Partial<Vault>
  priceInfo?: Partial<PriceInfo>
  balanceInfo?: Partial<BalanceInfo>
  urnAddress?: string
  owner?: string
  collateral: BigNumber
  debt: BigNumber
  unlockedCollateral?: BigNumber
  controller?: string
  depositAmount?: BigNumber
  withdrawAmount?: BigNumber
  generateAmount?: BigNumber
  paybackAmount?: BigNumber
  stage: ManageVaultStage
  ilk: 'ETH-A' | 'WBTC-A' | 'USDC-A'
}

const VAULT_ID = one

const protoUrnAddress = '0xEe0b6175705CDFEb824e5092d6547C011EbB46A8'

function createStory({
  title,
  context,
  proxyAddress,
  allowance,
  priceInfo,
  balanceInfo,
  urnAddress,
  owner,
  ilk,
  collateral,
  debt,
  unlockedCollateral,
  controller,
  depositAmount,
  withdrawAmount,
  generateAmount,
  paybackAmount,
  stage,
}: Story) {
  return () => {
    const protoPriceInfo = {
      ...(ilk === 'ETH-A'
        ? protoETHPriceInfo
        : ilk === 'WBTC-A'
        ? protoWBTCPriceInfo
        : protoUSDCPriceInfo),
      ...(priceInfo || {}),
    }

    const protoIlkData =
      ilk === 'ETH-A' ? protoETHAIlkData : ilk === 'WBTC-A' ? protoWBTCAIlkData : protoUSDCAIlkData

    const protoBalanceInfo: BalanceInfo = {
      collateralBalance: zero,
      ethBalance: zero,
      daiBalance: zero,
      ...balanceInfo,
    }

    const newState: Partial<ManageVaultState> = {
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

export const CollateralEditingStage = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  balanceInfo: { collateralBalance: new BigNumber('2000') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralEditing',
})

export const DaiEditingStage = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiEditing',
})

export const ProxyWaitingForConfirmation = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxyWaitingForConfirmation',
})

export const ProxyWaitingForApproval = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxyWaitingForApproval',
})

export const ProxyFailure = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxyFailure',
})

export const ProxyInProgress = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxyInProgress',
})

export const ProxySuccess = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  stage: 'proxySuccess',
})

export const CollateralAllowanceWaitingForConfirmation = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceWaitingForConfirmation',
})

export const CollateralAllowanceWaitingForApproval = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceWaitingForApproval',
})

export const CollateralAllowanceFailure = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceFailure',
})

export const CollateralAllowanceInProgress = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceInProgress',
})

export const CollateralAllowanceSuccess = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralAllowanceSuccess',
})

export const DaiAllowanceWaitingForConfirmation = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiAllowanceWaitingForConfirmation',
})

export const DaiAllowanceWaitingForApproval = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiAllowanceWaitingForApproval',
})

export const DaiAllowanceFailure = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiAllowanceFailure',
})

export const DaiAllowanceInProgress = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiAllowanceInProgress',
})

export const DaiAllowanceSuccess = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'daiAllowanceSuccess',
})

export const ManageWaitingForConfirmation = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'manageWaitingForConfirmation',
})

export const ManageWaitingForApproval = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'manageWaitingForApproval',
})

export const ManageFailure = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'manageFailure',
})

export const ManageInProgress = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'manageInProgress',
})

export const ManageSuccess = createStory({
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'manageSuccess',
})

export const VaultAtRisk = createStory({
  ilk: 'ETH-A',
  collateral: one,
  debt: new BigNumber('4000'),
  withdrawAmount: new BigNumber('0.5'),
  paybackAmount: new BigNumber('300'),
  balanceInfo: { collateralBalance: new BigNumber('200'), daiBalance: new BigNumber('1000') },
  proxyAddress: '0xProxyAddress',
  stage: 'collateralEditing',
})

export const ShouldPaybackAll = createStory({
  title: `If the amount in the paybackAmount field is between ${PAYBACK_ALL_BOUND} DAI of the outstanding debt in a vault, the shouldPaybackAll flag should be indicated as true. A warning message should also show to indicate to the user that this action should leave their vault with a debt of 0`,
  ilk: 'WBTC-A',
  stage: 'daiEditing',
  collateral: one,
  debt: new BigNumber('3000'),
  paybackAmount: new BigNumber('2999'),
  balanceInfo: { collateralBalance: new BigNumber('2000'), daiBalance: new BigNumber('10000') },
  proxyAddress: '0xProxyAddress',
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault',
  component: ManageVaultView,
}
