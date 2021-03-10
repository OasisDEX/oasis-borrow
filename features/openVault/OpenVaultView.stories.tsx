import BigNumber from 'bignumber.js'
import { OpenVaultContainer } from 'features/openVault/OpenVaultView'
import { zero } from 'helpers/zero'
import { OpenVaultStage, OpenVaultState } from './openVault'

const account = '0x0000000000000000000000000000000000000DA1'

const defaultOpenVaultState: OpenVaultState = {
  stage: 'editing',
  ilk: 'ETH-A',
  account,
  token: 'ETH',

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

  collateralBalance: new BigNumber('1'),
  ethBalance: new BigNumber('1'),
  daiBalance: new BigNumber('100'),
  currentCollateralPrice: new BigNumber('1831.55'),
  currentEthPrice: new BigNumber('1831.55'),

  nextCollateralPrice: new BigNumber('1835.55'),
  nextEthPrice: new BigNumber('1835.55'),

  isStaticCollateralPrice: false,
  isStaticEthPrice: false,

  safeConfirmations: 6,
}

interface MockOpenVaultStateProps {
  stage: OpenVaultStage
}

function mockOpenVaultState(newState?: MockOpenVaultStateProps): OpenVaultState {
  return {
    ...defaultOpenVaultState,
    ...(newState || {}),
  }
}

export const Basic = () => <OpenVaultContainer {...mockOpenVaultState()} />

export default {
  title: 'OpenVault',
  component: OpenVaultContainer,
}
