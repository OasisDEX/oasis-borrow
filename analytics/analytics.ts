import { ConnectionKind } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getDiscoverMixpanelPage } from 'features/discover/helpers'
import { DiscoverPages } from 'features/discover/types'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { formatPrecision } from 'helpers/formatters/format'
import { camelCase, upperFirst } from 'lodash'
import * as mixpanelBrowser from 'mixpanel-browser'
import getConfig from 'next/config'

type PropertyNameType = '$initial_referrer' | '$user_id'

export type MixpanelDevelopmentType = {
  track: (eventType: string, payload: any) => void
  get_distinct_id: () => string
  has_opted_out_tracking: () => boolean
  get_property: (propertyName: PropertyNameType) => string | null
}

export function enableMixpanelDevelopmentMode<T>(mixpanel: T): T | MixpanelDevelopmentType {
  const env = getConfig()?.publicRuntimeConfig.mixpanelEnv || process.env.MIXPANEL_ENV

  if (env !== 'production' && env !== 'staging') {
    return {
      track: function (eventType: string, payload: any) {
        console.info('\n✨ Mixpanel Event: ', eventType, payload, '\n')
      },
      get_distinct_id: () => 'test_id',
      has_opted_out_tracking: () => false,
      get_property: (propertyName: PropertyNameType) => {
        switch (propertyName) {
          case '$initial_referrer':
            return '$direct'
          case '$user_id':
            return 'test_user_id'
          default:
            return null
        }
      },
    }
  }

  return mixpanel
}

type MixpanelType = MixpanelDevelopmentType | typeof mixpanelBrowser
let mixpanel: MixpanelType = mixpanelBrowser

mixpanel = enableMixpanelDevelopmentMode<MixpanelType>(mixpanel)

const product = 'borrow'
export const INPUT_DEBOUNCE_TIME = 800

export enum Pages {
  VaultCreate = 'VaultCreate',
  IlksList = 'IlksList',
  LandingPage = 'LandingPage',
  OpenVaultOverview = 'OpenVaultOverview',
  VaultsOverview = 'VaultsOverview',
  ManageCollateral = 'ManageCollateral',
  ManageDai = 'ManageDai',
  OpenMultiply = 'OpenMultiply',
  AdjustPosition = 'AdjustPosition',
  OtherActions = 'OtherActions',
  CloseVault = 'CloseVault',
  OpenEarnSTETH = 'OpenEarnSTETH',
  ManageSTETH = 'ManageSTETH',
  DiscoverOasis = 'DiscoverOasis',
  DiscoverHighRiskPositions = 'DiscoverHighRiskPositions',
  DiscoverHighestMultiplyPnl = 'DiscoverHighestMultiplyPnl',
  DiscoverMostYieldEarned = 'DiscoverMostYieldEarned',
  DiscoverLargestDebt = 'DiscoverLargestDebt',
}

export enum EventTypes {
  Pageview = 'Pageview',
  AccountChange = 'account-change',
  InputChange = 'input-change',
  ButtonClick = 'btn-click',
}

// https://help.mixpanel.com/hc/en-us/articles/115004613766-Default-Properties-Collected-by-Mixpanel
export function mixpanelInternalAPI(eventName: string, eventBody: { [key: string]: any }) {
  let win: Window
  if (typeof window === 'undefined') {
    var loc = {
      hostname: '',
    }
    win = {
      navigator: { userAgent: '' },
      document: {
        location: loc,
        referrer: '',
      },
      screen: { width: 0, height: 0 },
      location: loc,
    } as Window
  } else {
    win = window
  }

  const distinctId = mixpanel.get_distinct_id()
  const currentUrl = win.location.href
  const initialReferrer = mixpanel.get_property('$initial_referrer')
  const initialReferrerHost = initialReferrer
    ? initialReferrer === '$direct'
      ? '$direct'
      : new URL(initialReferrer).hostname
    : ''
  const userId = mixpanel.get_property('$user_id')
  // eslint-disable-next-line
  fetch(`/api/t`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventName,
      eventBody,
      distinctId,
      currentUrl,
      initialReferrer,
      initialReferrerHost,
      userId,
    }),
  })
}

export interface MixpanelUserContext {
  walletAddres: string
  walletType: string
  browserLanguage: string
}
export function getMixpanelUserContext(language: string, context?: Context): MixpanelUserContext {
  return {
    walletAddres: context?.status === 'connected' ? context.account : 'not-connected',
    walletType: context?.status === 'connected' ? context.connectionKind : 'not-connected',
    browserLanguage: language,
  }
}

export const trackingEvents = {
  pageView: (location: string) => {
    const eventBody = {
      product,
      id: location,
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.Pageview, eventBody)
  },

  accountChange: (account: string, network: string, walletType: string) => {
    const eventBody = {
      id: 'AccountChange',
      account,
      network,
      product,
      walletType,
    }

    mixpanelInternalAPI(EventTypes.AccountChange, eventBody)
  },

  searchToken: (
    page: Pages.LandingPage | Pages.OpenVaultOverview | Pages.VaultsOverview,
    query: string,
  ) => {
    const eventBody = {
      id: 'SearchToken',
      product,
      page,
      query,
      section: 'SelectCollateral',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  openVault: (page: Pages.LandingPage | Pages.OpenVaultOverview, ilk: string) => {
    const eventBody = {
      id: 'OpenVault',
      product,
      ilk,
      page,
      section: 'SelectCollateral',
    }

    mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  createVaultDeposit: (firstCDP: boolean | undefined, amount: string) => {
    const eventBody = {
      id: 'Deposit',
      product,
      firstCDP,
      amount,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  createVaultGenerate: (firstCDP: boolean | undefined, amount: string) => {
    const eventBody = {
      id: 'Generate',
      product,
      firstCDP,
      amount,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  createVaultSetupProxy: (
    firstCDP: boolean | undefined,
    depositAmount: string,
    generateAmount: string,
  ) => {
    const eventBody = {
      id: 'SetupProxy',
      product,
      firstCDP,
      depositAmount,
      generateAmount,
      page: Pages.VaultCreate,
      section: 'Configure',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  createProxy: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'CreateProxy',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'ProxyDeploy',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  pickAllowance: (firstCDP: boolean | undefined, type: string, amount: string) => {
    const eventBody = {
      id: 'PickAllowance',
      product,
      firstCDP,
      type,
      amount,
      page: Pages.VaultCreate,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  setTokenAllowance: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'SetAllowance',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'Configure',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  approveAllowance: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'ApproveAllowance',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  createVaultConfirm: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'Confirm',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  confirmVaultConfirm: (
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    firstCDP: boolean | undefined,
  ) => {
    const eventBody = {
      id: 'Confirm',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'ConfirmVault',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  confirmVaultConfirmTransaction: (
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    firstCDP: boolean | undefined,
    txHash: string,
    network: string,
    walletType: ConnectionKind,
  ) => {
    const eventBody = {
      id: 'ConfirmTransaction',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      firstCDP,
      txHash,
      network,
      walletType,
      page: Pages.VaultCreate,
      section: 'ConfirmVault',
    }

    mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  confirmVaultEdit: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'EditVault',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'ConfirmVault',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  overviewManage: (vaultId: string, ilk: string) => {
    const eventBody = {
      id: 'Manage',
      product,
      vaultId,
      ilk,
      page: Pages.VaultsOverview,
      section: 'Table',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  createNewVault: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'createNewVault',
      product,
      firstCDP,
      section: 'NavBar',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  yourVaults: () => {
    const eventBody = {
      id: 'YourVaults',
      product,
      section: 'NavBar',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  switchToDai: (ControllerIsConnected: boolean) => {
    const eventBody = {
      id: 'SwitchToDai',
      product,
      ControllerIsConnected,
      page: Pages.ManageCollateral,
      section: 'Dai',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  switchToCollateral: (ControllerIsConnected: boolean) => {
    const eventBody = {
      id: 'SwitchToCollateral',
      product,
      ControllerIsConnected,
      page: Pages.ManageDai,
      section: 'Collateral',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  manageVaultDepositAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'DepositAmount',
      product,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  manageVaultGenerateAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'GenerateAmount',
      product,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  manageVaultWithdrawAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'WithdrawAmount',
      product,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  manageVaultPaybackAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'PaybackAmount',
      product,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  manageVaultConfirmVaultEdit: () => {
    const eventBody = {
      id: 'EditVault',
      product,
      section: 'ConfirmVault',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  // Can we distinguish if went through collateral/daiEditing?
  manageVaultConfirm: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
  ) => {
    const eventBody = {
      id: 'Confirm',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      page,
      section: 'ConfirmVault',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  manageVaultConfirmTransaction: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    txHash: string,
    network: string,
    walletType: ConnectionKind,
  ) => {
    const eventBody = {
      id: 'ConfirmTransaction',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      txHash,
      network,
      walletType,
      page,
      section: 'ConfirmVault',
    }

    mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  manageCollateralPickAllowance: (type: string, amount: string) => {
    const eventBody = {
      id: 'PickAllowance',
      product,
      type,
      amount,
      page: Pages.ManageCollateral,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  manageCollateralApproveAllowance: () => {
    const eventBody = {
      id: 'ApproveAllowance',
      product,
      page: Pages.ManageCollateral,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  manageDaiPickAllowance: (type: string, amount: string) => {
    const eventBody = {
      id: 'PickAllowance',
      product,
      type,
      amount,
      page: Pages.ManageDai,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  manageDaiApproveAllowance: () => {
    const eventBody = {
      id: 'ApproveAllowance',
      product,
      page: Pages.ManageDai,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  // First Confirm button when the user is on Collateral and type into Deposit
  manageCollateralDepositConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product,
      page: Pages.ManageCollateral,
      section: 'Deposit',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  // Confirm button when the user is on Collateral and type into Withdraw
  manageCollateralWithdrawConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product,
      page: Pages.ManageCollateral,
      section: 'Withdraw',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  // First Confirm button when the user is on Dai and type into Generate
  manageDaiGenerateConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product,
      page: Pages.ManageDai,
      section: 'Generate',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  // Confirm button when the user is on Dai and type into Payback
  manageDaiPaybackConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product,
      page: Pages.ManageDai,
      section: 'Payback',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  newsletterSubscribe: (section: 'Footer' | 'Homepage') => {
    const eventBody = {
      id: 'NewsletterSubscribe',
      product,
      section,
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  multiply: {
    confirmOpenMultiplyConfirm: (
      ilk: string,
      firstCDP: boolean | undefined,
      collAmount: string,
      multiply: string,
    ) => {
      const eventBody = {
        id: 'Confirm',
        product,
        ilk,
        firstCDP,
        collAmount,
        multiply,
        page: Pages.OpenMultiply,
        section: 'ConfirmVault',
      }

      !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },

    confirmOpenMultiplyConfirmTransaction: (
      ilk: string,
      firstCDP: boolean | undefined,
      collAmount: string,
      multiply: string,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product,
        ilk,
        firstCDP,
        collAmount,
        multiply,
        txHash,
        network,
        walletType,
        page: Pages.OpenMultiply,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },

    adjustPositionConfirm: (ilk: string, multiply: string) => {
      const eventBody = {
        id: 'Confirm',
        product,
        ilk,
        multiply,
        page: Pages.AdjustPosition,
        section: 'ConfirmVault',
      }

      !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },

    adjustPositionConfirmTransaction: (
      ilk: string,
      multiply: string,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product,
        ilk,
        multiply,
        txHash,
        network,
        walletType,
        page: Pages.AdjustPosition,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },

    otherActionsConfirm: (ilk: string, collateralAmount: string, daiAmount: string) => {
      const eventBody = {
        id: 'Confirm',
        product,
        ilk,
        collateralAmount,
        daiAmount,
        page: Pages.OtherActions,
        section: 'ConfirmVault',
      }

      !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },

    otherActionsConfirmTransaction: (
      ilk: string,
      collateralAmount: string,
      daiAmount: string,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product,
        ilk,
        collateralAmount,
        daiAmount,
        txHash,
        network,
        walletType,
        page: Pages.OtherActions,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },

    closeVaultConfirm: (ilk: string, debt: string, closeTo: CloseVaultTo) => {
      const eventBody = {
        id: 'Confirm',
        product,
        ilk,
        debt,
        closeTo,
        page: Pages.CloseVault,
        section: 'ConfirmVault',
      }

      !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },

    closeVaultConfirmTransaction: (
      ilk: string,
      debt: string,
      closeTo: CloseVaultTo,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product,
        ilk,
        debt,
        closeTo,
        txHash,
        network,
        walletType,
        page: Pages.CloseVault,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
  },
  earn: {
    stETHOpenPositionDepositAmount: (depositAmount: BigNumber) => {
      const eventBody = {
        id: 'DepositAmount',
        depositAmount: depositAmount.toString(),
        page: Pages.OpenEarnSTETH,
        section: 'OpenPosition',
      }
      mixpanelInternalAPI(EventTypes.InputChange, eventBody)
    },
    stETHOpenPositionConfirmDeposit: (depositAmount: BigNumber) => {
      const eventBody = {
        id: 'ConfirmDeposit',
        depositAmount: depositAmount.toString(),
        page: Pages.OpenEarnSTETH,
        section: 'OpenPosition',
      }
      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
    stETHOpenPositionMoveSlider: (depositAmount: BigNumber, riskRatio: BigNumber) => {
      const eventBody = {
        id: 'MoveSlider',
        depositAmount: depositAmount.toString(),
        riskRatio: formatPrecision(riskRatio, 4),
        page: Pages.OpenEarnSTETH,
        section: 'OpenPosition',
      }
      mixpanelInternalAPI(EventTypes.InputChange, eventBody)
    },
    stETHOpenPositionConfirmRisk: (depositAmount: BigNumber, riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmRisk',
        depositAmount: depositAmount.toString(),
        riskRatio: formatPrecision(riskRatio, 4),
        page: Pages.OpenEarnSTETH,
        section: 'OpenPosition',
      }
      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
    stETHOpenPositionConfirmTransaction: (depositAmount: BigNumber, riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        depositAmount: depositAmount.toString(),
        riskRatio: formatPrecision(riskRatio, 4),
        page: Pages.OpenEarnSTETH,
        section: 'OpenPosition',
      }
      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
    stETHAdjustRiskMoveSlider: (riskRatio: BigNumber) => {
      const eventBody = {
        id: 'MoveSlider',
        riskRatio: formatPrecision(riskRatio, 4),
        page: Pages.ManageSTETH,
        section: 'AdjustRisk',
      }
      mixpanelInternalAPI(EventTypes.InputChange, eventBody)
    },
    stETHAdjustRiskConfirmRisk: (riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmRisk',
        riskRatio: formatPrecision(riskRatio, 4),
        page: Pages.ManageSTETH,
        section: 'AdjustRisk',
      }
      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
    stETHAdjustRiskConfirmTransaction: (riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        riskRatio: formatPrecision(riskRatio, 4),
        page: Pages.ManageSTETH,
        section: 'AdjustRisk',
      }
      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
    stETHClosePositionConfirm: () => {
      const eventBody = {
        id: 'Confirm',
        page: Pages.ManageSTETH,
        section: 'ClosePosition',
      }
      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
    stETHClosePositionConfirmTransaction: () => {
      const eventBody = {
        id: 'ConfirmTransaction',
        page: Pages.ManageSTETH,
        section: 'ClosePosition',
      }
      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
  },

  discover: {
    selectedInNavigation: (userContext: MixpanelUserContext) => {
      mixpanelInternalAPI(EventTypes.ButtonClick, {
        product: Pages.DiscoverOasis,
        page: Pages.LandingPage,
        section: 'Header/tabs',
        id: 'Discover',
        ...userContext,
      })
    },
    selectedCategory: (kind: DiscoverPages, userContext: MixpanelUserContext) => {
      mixpanelInternalAPI(EventTypes.ButtonClick, {
        product: Pages.DiscoverOasis,
        page: Pages.DiscoverOasis,
        section: 'Categories',
        id: upperFirst(camelCase(kind)),
        ...userContext,
      })
    },
    selectedFilter: (
      kind: DiscoverPages,
      label: string,
      value: string,
      userContext: MixpanelUserContext,
    ) => {
      mixpanelInternalAPI(EventTypes.InputChange, {
        product: Pages.DiscoverOasis,
        page: getDiscoverMixpanelPage(kind),
        section: 'Filters',
        id: `${upperFirst(camelCase(label))}Filter`,
        [label]: value,
        ...userContext,
      })
    },
    clickedTableBanner: (kind: DiscoverPages, link: string, userContext: MixpanelUserContext) => {
      mixpanelInternalAPI(EventTypes.ButtonClick, {
        product: Pages.DiscoverOasis,
        page: getDiscoverMixpanelPage(kind),
        section: 'Table',
        id: 'TableBanner',
        link,
        ...userContext,
      })
    },
    viewPosition: (kind: DiscoverPages, vaultId: string | number) => {
      mixpanelInternalAPI(EventTypes.ButtonClick, {
        product: Pages.DiscoverOasis,
        page: getDiscoverMixpanelPage(kind),
        section: 'Table',
        id: 'ViewPosition',
        vaultId,
      })
    },
  },
}

export type Tracker = typeof trackingEvents
