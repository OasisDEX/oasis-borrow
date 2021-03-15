import { nullAddress } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { protoETHAIlkData, protoUSDCAIlkData, protoWBTCAIlkData } from 'blockchain/ilks'
import { ContextConnected, protoContextConnected } from 'blockchain/network'
import { createVault$, Vault } from 'blockchain/vaults'
import { AppContext, bigNumberTostring, protoTxHelpers } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import {
  protoUserETHTokenInfo,
  protoUserUSDCTokenInfo,
  protoUserWBTCTokenInfo,
  UserTokenInfo,
} from 'features/shared/userTokenInfo'
import { one, zero } from 'helpers/zero'
import { memoize } from 'lodash'
import React from 'react'
import { of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

import { createManageVault$, defaultManageVaultState, ManageVaultState } from './manageVault'
import { ManageVaultView } from './ManageVaultView'

interface Story {
  title?: string
  context?: ContextConnected
  proxyAddress?: string
  allowance?: BigNumber
  vault?: Partial<Vault>
  userTokenInfo?: Partial<UserTokenInfo>
  urnAddress?: string
  owner?: string
  collateral: BigNumber
  debt: BigNumber
  unlockedCollateral?: BigNumber
  controller?: string
  newState?: Partial<ManageVaultState>
  ilk: 'ETH-A' | 'WBTC-A' | 'USDC-A'
}

const VAULT_ID = one

const protoUrnAddress = '0xEe0b6175705CDFEb824e5092d6547C011EbB46A8'

function createStory({
  title,
  context,
  proxyAddress,
  allowance,
  userTokenInfo,
  urnAddress,
  owner,
  ilk,
  collateral,
  debt,
  unlockedCollateral,
  controller,
  newState,
}: Story) {
  return () => {
    const defaultState$ = of({ ...defaultManageVaultState, ...(newState || {}) })
    const context$ = of(context || protoContextConnected)
    const txHelpers$ = of(protoTxHelpers)
    const proxyAddress$ = () => of(proxyAddress)
    const allowance$ = () => of(allowance || maxUint256)

    const userTokenInfo$ = (token: string) =>
      of({
        ...(token === 'ETH'
          ? protoUserETHTokenInfo
          : token === 'WBTC'
          ? protoUserWBTCTokenInfo
          : protoUserUSDCTokenInfo),
        ...(userTokenInfo || {}),
      })

    const oraclePriceData$ = (token: string) =>
      of({
        ...(token === 'ETH'
          ? protoUserETHTokenInfo
          : token === 'WBTC'
          ? protoUserWBTCTokenInfo
          : protoUserUSDCTokenInfo),
        ...(userTokenInfo || {}),
      }).pipe(
        switchMap(({ currentCollateralPrice }) =>
          of({ currentPrice: currentCollateralPrice, isStaticPrice: true }),
        ),
      )

    const ilkData$ = (ilk: string) =>
      of(
        ilk === 'ETH-A'
          ? protoETHAIlkData
          : ilk === 'WBTC-A'
          ? protoWBTCAIlkData
          : protoUSDCAIlkData,
      )

    const normalizedDebt = debt.div(
      (ilk === 'ETH-A'
        ? protoETHAIlkData
        : ilk === 'WBTC-A'
        ? protoWBTCAIlkData
        : protoUSDCAIlkData)['debtScalingFactor'],
    )

    const cdpManagerUrns$ = () => of(urnAddress || protoUrnAddress)
    const cdpManagerIlks$ = () => of(ilk || 'ETH-A')
    const cdpManagerOwner$ = () => of(owner || proxyAddress || nullAddress)

    const vatUrns$ = () => of({ collateral, normalizedDebt })
    const vatGem$ = () => of(unlockedCollateral || zero)

    const controller$ = () => of(controller || context?.account)
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

    const manageVault$ = memoize((id: BigNumber) =>
      createManageVault$(
        defaultState$,
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        userTokenInfo$,
        ilkData$,
        vault$,
        id,
      ),
    )

    const ctx = ({
      manageVault$,
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

export const SimpleVault = createStory({
  ilk: 'ETH-A',
  collateral: new BigNumber('50'),
  debt: new BigNumber('5000'),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault',
  component: ManageVaultView,
}
