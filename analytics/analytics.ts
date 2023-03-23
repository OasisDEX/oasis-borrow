import { ProductType } from 'analytics/common'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import browserDetect from 'browser-detect'
import { getDiscoverMixpanelPage } from 'features/discover/helpers'
import { DiscoverPages } from 'features/discover/types'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { ConnectionKind } from 'features/web3Context'
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

export function logMixpanelEventInDevelopmentMode(eventType: string, payload: any) {
  const env = getConfig()?.publicRuntimeConfig.mixpanelEnv || process.env.MIXPANEL_ENV

  if (env !== 'production' && env !== 'staging') {
    console.info('Mixpanel Event: ', eventType, payload)
  }
}

type MixpanelType = MixpanelDevelopmentType | typeof mixpanelBrowser
let mixpanel: MixpanelType = mixpanelBrowser

mixpanel = enableMixpanelDevelopmentMode<MixpanelType>(mixpanel)

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
  DiscoverHighestRiskPositions = 'DiscoverHighestRiskPositions',
  DiscoverHighestMultiplyPnl = 'DiscoverHighestMultiplyPnl',
  DiscoverMostYieldEarned = 'DiscoverMostYieldEarned',
  DiscoverLargestDebt = 'DiscoverLargestDebt',
  ProtectionTab = 'ProtectionTab',
  OptimizationTab = 'OptimizationTab',
  OpenVault = 'OpenVault',
  StopLoss = 'StopLoss',
  AutoBuy = 'AutoBuy',
  AutoSell = 'AutoSell',
  ConstantMultiple = 'ConstantMultiple',
  TakeProfit = 'TakeProfit',
}

export enum AutomationEventIds {
  SelectProtection = 'SelectProtection',
  SelectOptimization = 'SelectOptimization',

  SelectStopLoss = 'SelectStopLoss',
  SelectAutoSell = 'SelectAutoSell',
  SelectAutoBuy = 'SelectAutoBuy',
  SelectConstantMultiple = 'SelectConstantMultiple',
  SelectTakeProfit = 'SelectTakeProfit',

  AddStopLoss = 'AddStopLoss',
  EditStopLoss = 'EditStopLoss',
  RemoveStopLoss = 'RemoveStopLoss',

  AddAutoBuy = 'AddAutoBuy',
  EditAutoBuy = 'EditAutoBuy',
  RemoveAutoBuy = 'RemoveAutoBuy',

  AddAutoSell = 'AddAutoSell',
  EditAutoSell = 'EditAutoSell',
  RemoveAutoSell = 'RemoveAutoSell',

  AddConstantMultiple = 'AddConstantMultiple',
  EditConstantMultiple = 'EditConstantMultiple',
  RemoveConstantMultiple = 'RemoveConstantMultiple',

  AddTakeProfit = 'AddTakeProfit',
  EditTakeProfit = 'EditTakeProfit',
  RemoveTakeProfit = 'RemoveAutoTakeProfit',

  CloseToX = 'CloseToX',
  MoveSlider = 'MoveSlider',
  MinSellPrice = 'MinSellPrice',
  MaxBuyPrice = 'MaxBuyPrice',
  MaxGasFee = 'MaxGasFee',
  TargetMultiplier = 'TargetMultiplier',
}

export interface AutomationEventsAdditionalParams {
  vaultId: string
  ilk: string
  collateralRatio?: string
  triggerValue?: string
  triggerBuyValue?: string
  triggerSellValue?: string
  targetValue?: string
  minSellPrice?: string
  maxBuyPrice?: string
  maxGasFee?: string
  targetMultiple?: string
  closeTo?: CloseVaultTo
}

export enum NotificationsEventIds {
  OpenNotificationCenter = 'OpenNotificationCenter',
  ScrollNotificationCenter = 'ScrollNotificationCenter',
  MarkAsRead = 'MarkAsRead',
  GoToVault = 'GoToVault',
  NotificationPreferences = 'NotificationPreferences',
  VaultActionNotificationSwitch = 'VaultActionNotificationSwitch',
  VaultInfoNotificationSwitch = 'VaultInfoNotificationSwitch',
}

export interface NotificationsEventAdditionalParams {
  walletAddress: string
  walletType: string
  browserType: string
  notificationSwitch?: 'on' | 'off'
}

export enum CommonAnalyticsSections {
  HeaderTabs = 'HeaderTabs',
  Banner = 'Banner',
  Form = 'Form',
  NotificationCenter = 'NotificationCenter',
  NotificationPreferences = 'NotificationPreferences',
}

export enum EventTypes {
  Pageview = 'Pageview',
  AccountChange = 'account-change',
  InputChange = 'input-change',
  ButtonClick = 'btn-click',
  OnScroll = 'on-scroll',
}

// https://help.mixpanel.com/hc/en-us/articles/115004613766-Default-Properties-Collected-by-Mixpanel
export function mixpanelInternalAPI(eventName: string, eventBody: { [key: string]: any }) {
  let win: Window

  if (typeof window === 'undefined') {
    var loc = { hostname: '' }

    win = {
      navigator: { userAgent: '' },
      document: { location: loc, referrer: '' },
      screen: { width: 0, height: 0 },
      location: loc,
    } as Window
  } else {
    win = window
  }

  logMixpanelEventInDevelopmentMode(eventName, eventBody)

  const { name, mobile, os, versionNumber } = browserDetect()
  const initialReferrer = mixpanel.get_property('$initial_referrer')
  const initialReferringDomain = initialReferrer
    ? initialReferrer === '$direct'
      ? '$direct'
      : new URL(initialReferrer).hostname
    : ''
  void fetch(`/api/t`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventBody,
      eventName,
      distinctId: mixpanel.get_distinct_id(),
      currentUrl: win.location.href,
      ...(!mixpanel.has_opted_out_tracking() && {
        browser: upperFirst(name),
        browserVersion: versionNumber,
        initialReferrer,
        initialReferringDomain,
        mobile,
        os,
        screenHeight: win.innerHeight,
        screenWidth: win.innerWidth,
        userId: mixpanel.get_property('$user_id'),
      }),
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
  landingPageView: (utm: { [key: string]: string | string[] | undefined }) => {
    const eventBody = {
      product: ProductType.BORROW,
      page: Pages.LandingPage,
      utm_source: utm.utmSource ? utm.utmSource : 'direct',
      utm_medium: utm.utmMedium ? utm.utmMedium : 'none',
      utm_campaign: utm.utmCampaign ? utm.utmCampaign : 'none',
    }

    mixpanelInternalAPI(EventTypes.Pageview, eventBody)
  },

  pageView: (location: string) => {
    const eventBody = {
      product: ProductType.BORROW,
      id: location,
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.Pageview, eventBody)
  },

  accountChange: (
    account: string,
    network: string,
    walletType: string,
    connectionMethod: string,
    walletLabel: string | undefined,
  ) => {
    const eventBody = {
      id: 'AccountChange',
      account,
      network,
      product: ProductType.BORROW,
      walletType,
      connectionMethod,
      walletLabel,
    }

    mixpanelInternalAPI(EventTypes.AccountChange, eventBody)
  },

  searchToken: (
    page: Pages.LandingPage | Pages.OpenVaultOverview | Pages.VaultsOverview,
    query: string,
  ) => {
    const eventBody = {
      id: 'SearchToken',
      product: ProductType.BORROW,
      page,
      query,
      section: 'SelectCollateral',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  openVault: (page: Pages.LandingPage | Pages.OpenVaultOverview, ilk: string) => {
    const eventBody = {
      id: 'OpenVault',
      product: ProductType.BORROW,
      ilk,
      page,
      section: 'SelectCollateral',
    }

    mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  createVaultDeposit: (firstCDP: boolean | undefined, amount: string) => {
    const eventBody = {
      id: 'Deposit',
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'ProxyDeploy',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  pickAllowance: (firstCDP: boolean | undefined, type: string, amount: string) => {
    const eventBody = {
      id: 'PickAllowance',
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'Configure',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  approveAllowance: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'ApproveAllowance',
      product: ProductType.BORROW,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  createVaultConfirm: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'ConfirmVault',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  overviewManage: (vaultId: string, ilk: string) => {
    const eventBody = {
      id: 'Manage',
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
      firstCDP,
      section: 'NavBar',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  yourVaults: () => {
    const eventBody = {
      id: 'YourVaults',
      product: ProductType.BORROW,
      section: 'NavBar',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  switchToDai: (ControllerIsConnected: boolean) => {
    const eventBody = {
      id: 'SwitchToDai',
      product: ProductType.BORROW,
      ControllerIsConnected,
      page: Pages.ManageCollateral,
      section: 'Dai',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  switchToCollateral: (ControllerIsConnected: boolean) => {
    const eventBody = {
      id: 'SwitchToCollateral',
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
  },

  manageVaultConfirmVaultEdit: () => {
    const eventBody = {
      id: 'EditVault',
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
      page: Pages.ManageCollateral,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  manageDaiPickAllowance: (type: string, amount: string) => {
    const eventBody = {
      id: 'PickAllowance',
      product: ProductType.BORROW,
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
      product: ProductType.BORROW,
      page: Pages.ManageDai,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  // First Confirm button when the user is on Collateral and type into Deposit
  manageCollateralDepositConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
      page: Pages.ManageCollateral,
      section: 'Deposit',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  // Confirm button when the user is on Collateral and type into Withdraw
  manageCollateralWithdrawConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
      page: Pages.ManageCollateral,
      section: 'Withdraw',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  // First Confirm button when the user is on Dai and type into Generate
  manageDaiGenerateConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
      page: Pages.ManageDai,
      section: 'Generate',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  // Confirm button when the user is on Dai and type into Payback
  manageDaiPaybackConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
      page: Pages.ManageDai,
      section: 'Payback',
    }

    !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
  },

  newsletterSubscribe: (section: 'Footer' | 'Homepage') => {
    const eventBody = {
      id: 'NewsletterSubscribe',
      product: ProductType.BORROW,
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
        product: ProductType.MULTIPLY,
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
      oasisFee: string,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.MULTIPLY,
        ilk,
        firstCDP,
        collAmount,
        multiply,
        txHash,
        network,
        walletType,
        page: Pages.OpenMultiply,
        oasisFee,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },

    adjustPositionConfirm: (ilk: string, multiply: string) => {
      const eventBody = {
        id: 'Confirm',
        product: ProductType.MULTIPLY,
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
      oasisFee: string,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.MULTIPLY,
        ilk,
        multiply,
        txHash,
        network,
        walletType,
        oasisFee,
        page: Pages.AdjustPosition,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },

    otherActionsConfirm: (ilk: string, collateralAmount: string, daiAmount: string) => {
      const eventBody = {
        id: 'Confirm',
        product: ProductType.MULTIPLY,
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
      oasisFee: string,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.MULTIPLY,
        ilk,
        collateralAmount,
        daiAmount,
        txHash,
        network,
        walletType,
        oasisFee,
        page: Pages.OtherActions,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },

    closeVaultConfirm: (ilk: string, debt: string, closeTo: CloseVaultTo) => {
      const eventBody = {
        id: 'Confirm',
        product: ProductType.BORROW,
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
      oasisFee: string,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.MULTIPLY,
        ilk,
        debt,
        closeTo,
        txHash,
        network,
        walletType,
        oasisFee,
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
        product: ProductType.EARN,
        depositAmount: depositAmount.toString(),
        page: Pages.OpenEarnSTETH,
        section: 'OpenPosition',
      }
      mixpanelInternalAPI(EventTypes.InputChange, eventBody)
    },
    stETHOpenPositionConfirmDeposit: (depositAmount: BigNumber) => {
      const eventBody = {
        id: 'ConfirmDeposit',
        product: ProductType.EARN,
        depositAmount: depositAmount.toString(),
        page: Pages.OpenEarnSTETH,
        section: 'OpenPosition',
      }
      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
    stETHOpenPositionMoveSlider: (depositAmount: BigNumber, riskRatio: BigNumber) => {
      const eventBody = {
        id: 'MoveSlider',
        product: ProductType.EARN,
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
        product: ProductType.EARN,
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
        product: ProductType.EARN,
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
        product: ProductType.EARN,
        riskRatio: formatPrecision(riskRatio, 4),
        page: Pages.ManageSTETH,
        section: 'AdjustRisk',
      }
      mixpanelInternalAPI(EventTypes.InputChange, eventBody)
    },
    stETHAdjustRiskConfirmRisk: (riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmRisk',
        product: ProductType.EARN,
        riskRatio: formatPrecision(riskRatio, 4),
        page: Pages.ManageSTETH,
        section: 'AdjustRisk',
      }
      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
    stETHAdjustRiskConfirmTransaction: (riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.EARN,
        riskRatio: formatPrecision(riskRatio, 4),
        page: Pages.ManageSTETH,
        section: 'AdjustRisk',
      }
      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
    stETHClosePositionConfirm: () => {
      const eventBody = {
        id: 'Confirm',
        product: ProductType.EARN,
        page: Pages.ManageSTETH,
        section: 'ClosePosition',
      }
      mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
    stETHClosePositionConfirmTransaction: () => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.EARN,
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
  automation: {
    inputChange: (
      id: AutomationEventIds,
      page: string,
      section: CommonAnalyticsSections.Form,
      additionalParams: AutomationEventsAdditionalParams,
    ) => {
      const eventBody = { id, page, section, product: 'Automation', ...additionalParams }

      !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.InputChange, eventBody)
    },
    buttonClick: (
      id: AutomationEventIds,
      page: string,
      section: CommonAnalyticsSections,
      additionalParams: AutomationEventsAdditionalParams,
    ) => {
      const eventBody = { id, page, section, product: 'Automation', ...additionalParams }

      !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
  },
  notifications: {
    scroll: (
      id: NotificationsEventIds,
      section: CommonAnalyticsSections.NotificationCenter,
      additionalParams: NotificationsEventAdditionalParams,
    ) => {
      const eventBody = { id, section, product: 'Notifications', ...additionalParams }

      !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.OnScroll, eventBody)
    },
    buttonClick: (
      id: NotificationsEventIds,
      section:
        | CommonAnalyticsSections.HeaderTabs
        | CommonAnalyticsSections.NotificationCenter
        | CommonAnalyticsSections.NotificationPreferences,
      additionalParams: NotificationsEventAdditionalParams,
    ) => {
      const eventBody = { id, section, product: 'Notifications', ...additionalParams }

      !mixpanel.has_opted_out_tracking() && mixpanelInternalAPI(EventTypes.ButtonClick, eventBody)
    },
  },
}

export type Tracker = typeof trackingEvents
