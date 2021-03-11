import BigNumber from 'bignumber.js'
import { OpenVaultContainer } from 'features/openVault/OpenVaultView'
import { zero } from 'helpers/zero'
import React from 'react'
import { Container, Text, Grid, Card } from 'theme-ui'
import { OpenVaultState } from './openVault'

const account = '0x0000000000000000000000000000000000000DA1'

const now = new Date(Date.now())
const nowPlusOneHour = new Date(Date.now() + 60 * 60 * 1000)

const defaultOpenVaultState: OpenVaultState = {
  stage: 'editing',
  ilk: 'WBTC-A',
  account,
  token: 'WBTC',
  errorMessages: [],
  warningMessages: ['noProxyAddress', 'depositAmountEmpty', 'generateAmountEmpty'],
  afterLiquidationPrice: zero,
  afterCollateralizationRatio: zero,
  maxDepositAmount: zero,
  maxGenerateAmount: zero,
  depositAmountUSD: zero,
  generateAmountUSD: zero,
  maxDepositAmountUSD: zero,
  maxDebtPerUnitCollateral: new BigNumber('1208.78442762666666666667'),
  ilkDebtAvailable: new BigNumber('76334060.2018728290793634'),
  debtFloor: new BigNumber('2000'),
  liquidationRatio: new BigNumber('1.5'),
  isIlkValidationStage: false,
  isEditingStage: true,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
  collateralBalance: new BigNumber('0'),
  ethBalance: new BigNumber('0'),
  daiBalance: new BigNumber('0'),
  currentCollateralPrice: new BigNumber('1831.55'),
  currentEthPrice: new BigNumber('1831.55'),
  nextCollateralPrice: new BigNumber('1835.55'),
  nextEthPrice: new BigNumber('1835.55'),
  dateLastCollateralPrice: now,
  dateNextCollateralPrice: now,
  dateLastEthPrice: nowPlusOneHour,
  dateNextEthPrice: nowPlusOneHour,
  isStaticCollateralPrice: false,
  isStaticEthPrice: false,
  safeConfirmations: 6,
}

function OpenVaultStory({ newState, doc }: { newState?: Partial<OpenVaultState>; doc: string }) {
  return (
    <Container variant={'appContainer'}>
      <Grid>
        <Card>{doc}</Card>
        <OpenVaultContainer {...{ ...defaultOpenVaultState, ...(newState || {}) }} />
      </Grid>
    </Container>
  )
}

export const Basic = () =>
  OpenVaultStory({
    doc:
      'New user view, they have no proxy and zero balances of ETH, DAI and the WBTC (collateral) in question',
  })

export default {
  title: 'OpenVault',
  component: OpenVaultContainer,
}
