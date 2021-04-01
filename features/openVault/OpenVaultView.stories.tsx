import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { protoETHAIlkData, protoUSDCAIlkData, protoWBTCAIlkData } from 'blockchain/ilks'
import { ContextConnected, protoContextConnected } from 'blockchain/network'
import { AppContext, protoTxHelpers } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { OpenVaultView } from 'features/openVault/OpenVaultView'
import {
  protoUserETHTokenInfo,
  protoUserUSDCTokenInfo,
  protoUserWBTCTokenInfo,
  UserTokenInfo,
} from 'features/shared/userTokenInfo'
import { zero } from 'helpers/zero'
import React, { useEffect } from 'react'
import { EMPTY, Observable, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

import { createOpenVault$, OpenVaultState } from './openVault'

type StoryProps = Partial<OpenVaultState> & {
  title?: string
  context?: ContextConnected
  proxyAddress?: string
  allowance?: BigNumber
  ilks$?: Observable<string[]>
  userTokenInfo?: Partial<UserTokenInfo>
  ilk: string
}

function createStory({
  title,
  context,
  proxyAddress,
  allowance,
  ilks$,
  userTokenInfo,
  ilk,
  ...otherState
}: StoryProps) {
  return () => {
    const context$ = of(context || protoContextConnected)
    const txHelpers$ = of(protoTxHelpers)
    const proxyAddress$ = () => of(proxyAddress)
    const allowance$ = () => of(allowance || maxUint256)

    const protoUserTokenInfo = {
      ...(ilk === 'ETH-A'
        ? protoUserETHTokenInfo
        : ilk === 'WBTC-A'
        ? protoUserWBTCTokenInfo
        : protoUserUSDCTokenInfo),
      ...(userTokenInfo || {}),
    }

    const protoIlkData =
      ilk === 'ETH-A' ? protoETHAIlkData : ilk === 'WBTC-A' ? protoWBTCAIlkData : protoUSDCAIlkData

    const userTokenInfo$ = () => of(protoUserTokenInfo)
    const ilkData$ = () => of(protoIlkData)

    const ilkToToken$ = of(() => ilk.split('-')[0])
    const obs$ = createOpenVault$(
      context$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      userTokenInfo$,
      ilkData$,
      ilks$ || of(['ETH-A', 'WBTC-A', 'USDC-A']),
      ilkToToken$,
      ilk,
    )

    const { stage, depositAmount, generateAmount } = otherState
    const newState: Partial<OpenVaultState> = {
      ...otherState,
      ...(stage && { stage }),
      ...(depositAmount && {
        depositAmount,
        depositAmountUSD: depositAmount.times(protoUserTokenInfo.currentCollateralPrice),
      }),
      ...(generateAmount && {
        generateAmount,
      }),
    }

    useEffect(() => {
      const subscription = obs$.pipe(first()).subscribe((state: any) => {
        if (state.injectStateOverride) {
          state.injectStateOverride(newState || {})
        }
      })
      return subscription.unsubscribe()
    }, [])

    const openVault$ = () => obs$
    const ctx = ({
      openVault$,
    } as any) as AppContext

    return (
      <appContext.Provider value={ctx as any}>
        <OpenVaultStoryContainer ilk={ilk} title={title} />
      </appContext.Provider>
    )
  }
}

const OpenVaultStoryContainer = ({ title, ilk }: { title?: string; ilk: string }) => {
  if (!isAppContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <OpenVaultView ilk={ilk} />
      </Grid>
    </Container>
  )
}

export const IlkValidationLoadingStage = createStory({ ilks$: EMPTY, ilk: 'ETH-A' })

export const IlkValidationFailureStage = createStory({ ilk: 'ETH-Z' })

export const EditingStage = createStory({
  proxyAddress: '0xProxyAddress',
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
  depositAmount: new BigNumber('5'),
  generateAmount: new BigNumber('2500'),
})

export const EditingStageWarningGenerateAmountEmpty = createStory({
  proxyAddress: '0xProxyAddress',
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  depositAmount: new BigNumber('5'),
  ilk: 'WBTC-A',
})

export const EditingStageWarningDepositAndGenerateAmountEmpty = createStory({
  proxyAddress: '0xProxyAddress',
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
})

export const EditingStageNoProxyAddress = createStory({
  title: 'Both warnings are shown as because no proxyAddress exists, no allowance can exist either',
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  depositAmount: new BigNumber('5'),
  generateAmount: new BigNumber('2500'),
  ilk: 'WBTC-A',
})

export const EditingStageNoAllowance = createStory({
  proxyAddress: '0xProxyAddress',
  allowance: zero,
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
})

export const EditingStageNoProxyAndNoAllowance = createStory({
  allowance: zero,
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  depositAmount: new BigNumber('5'),
  generateAmount: new BigNumber('2500'),
  ilk: 'WBTC-A',
})

export const EditingStageAllowanceLessThanDepositAmount = createStory({
  proxyAddress: '0xProxyAddress',
  allowance: new BigNumber('4'),
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  depositAmount: new BigNumber('5'),
  generateAmount: new BigNumber('2500'),
  ilk: 'WBTC-A',
})

export const EditingStagePotentialGenerateAmountLessThanDebtFloor = createStory({
  proxyAddress: '0xProxyAddress',
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  depositAmount: new BigNumber('0.001'),
  ilk: 'WBTC-A',
})

export const EditingStageDepositAmountGreaterThanMaxDepositAmount = createStory({
  proxyAddress: '0xProxyAddress',
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  depositAmount: new BigNumber('101'),
  generateAmount: new BigNumber('2000'),
  ilk: 'WBTC-A',
})

export const EditingStageGenerateAmountLessThanDebtFloor = createStory({
  proxyAddress: '0xProxyAddress',
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  depositAmount: new BigNumber('5'),
  generateAmount: new BigNumber('1999'),
  ilk: 'WBTC-A',
})

export const EditingStageGenerateAmountGreaterThanDebtCeiling = createStory({
  proxyAddress: '0xProxyAddress',
  userTokenInfo: { collateralBalance: new BigNumber('1000000000000') },
  depositAmount: new BigNumber('10000000000'),
  generateAmount: new BigNumber('100000000'),
  ilk: 'WBTC-A',
})

export const EditingStageVaultUnderCollateralized = createStory({
  proxyAddress: '0xProxyAddress',
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  depositAmount: new BigNumber('0.11'),
  generateAmount: new BigNumber('5000'),
  ilk: 'WBTC-A',
})

export const ProxyWaitingForConfirmation = createStory({
  stage: 'proxyWaitingForConfirmation',
  ilk: 'ETH-A',
})

export const ProxyWaitingForApproval = createStory({
  stage: 'proxyWaitingForApproval',
  ilk: 'ETH-A',
})

export const ProxyFailure = createStory({
  stage: 'proxyFailure',
  ilk: 'ETH-A',
})

export const ProxyInProgress = createStory({
  stage: 'proxyInProgress',
  proxyConfirmations: 2,
  ilk: 'ETH-A',
})

export const ProxySuccess = createStory({
  stage: 'proxySuccess',
  ilk: 'ETH-A',
})

export const AllowanceWaitingForConfirmation = createStory({
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'WBTC-A',
})

export const AllowanceWaitingForApproval = createStory({
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  stage: 'allowanceWaitingForApproval',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'WBTC-A',
})

export const AllowanceFailure = createStory({
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  stage: 'allowanceFailure',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'WBTC-A',
})

export const AllowanceInProgress = createStory({
  stage: 'allowanceInProgress',
  ilk: 'WBTC-A',
})

export const AllowanceSuccess = createStory({
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  stage: 'allowanceSuccess',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'WBTC-A',
})

export const OpenWaitingForConfirmation = createStory({
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  stage: 'openWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'ETH-A',
})

export const OpenWaitingForApproval = createStory({
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  stage: 'openWaitingForApproval',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'ETH-A',
})

export const OpenFailure = createStory({
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  stage: 'openFailure',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'ETH-A',
})

export const OpenInProgress = createStory({
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  stage: 'openInProgress',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'ETH-A',
})

export const OpenSuccess = createStory({
  userTokenInfo: { collateralBalance: new BigNumber('100') },
  stage: 'openSuccess',
  id: new BigNumber('122345'),
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'ETH-A',
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenVault',
  component: OpenVaultView,
}
