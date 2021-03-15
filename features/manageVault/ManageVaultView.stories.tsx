import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { protoETHAIlkData, protoWBTCAIlkData } from 'blockchain/ilks'
import { ContextConnected, protoContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { AppContext, protoTxHelpers } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import {
  protoUserETHTokenInfo,
  protoUserUSDCTokenInfo,
  protoUserWBTCTokenInfo,
  UserTokenInfo,
} from 'features/shared/userTokenInfo'
import { WithChildren } from 'helpers/types'
import { one } from 'helpers/zero'
import { memoize } from 'lodash'
import React from 'react'
import { of } from 'rxjs'
import { Card, Container, Grid } from 'theme-ui'

import { createManageVault$, defaultManageVaultState, ManageVaultState } from './manageVault'
import { ManageVaultView } from './ManageVaultView'

interface OpenVaultContextProviderProps extends WithChildren {
  title?: string
  context?: ContextConnected
  proxyAddress?: string
  allowance?: BigNumber
  vault?: Partial<Vault>
  userTokenInfo?: Partial<UserTokenInfo>
  newState?: Partial<ManageVaultState>
}

const VAULT_ID = one

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ManageVaultStory({
  title,
  children,
  context,
  proxyAddress,
  allowance,
  userTokenInfo,
  newState,
}: OpenVaultContextProviderProps) {
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
  const ilkData$ = (ilk: string) =>
    of(
      // eslint-disable-next-line sonarjs/no-all-duplicated-branches
      ilk === 'ETH-A' ? protoETHAIlkData : ilk === 'WBTC-A' ? protoWBTCAIlkData : protoWBTCAIlkData,
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
      id,
    ),
  )

  const ctx = ({
    manageVault$,
  } as any) as AppContext

  return (
    <appContext.Provider value={ctx as any}>
      <ManageVaultStoryContainer title={title}>{children}</ManageVaultStoryContainer>
    </appContext.Provider>
  )
}

const ManageVaultStoryContainer = ({ title }: WithChildren & { title?: string }) => {
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
