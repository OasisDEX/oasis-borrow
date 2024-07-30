import type { Route } from '@lifi/sdk'
import type { RouteExecutionUpdate } from '@lifi/widget'
import type {
  MixpanelMigrationsButtonClickParams,
  MixpanelTxEventsIds,
} from 'analytics/events-types'
import { MixpanelMigrationsEventIds } from 'analytics/events-types'
import { TrackingFeatureType } from 'analytics/TrackingFeatureType'
import type BigNumber from 'bignumber.js'
import type { CloseVaultTo } from 'features/multiply/manage/pipes/CloseVaultTo.types'
import type { ConnectionKind } from 'features/web3Context'
import { formatPrecision } from 'helpers/formatters/format'
import { match, P } from 'ts-pattern'

import { mixpanel, mixpanelInternalAPI } from './analytics'
import { TrackingProductType } from './TrackingProductType'
import type {
  MixpanelAutomationEventIds,
  MixpanelAutomationEventsAdditionalParams,
  MixpanelProductHubChangeFilter,
  MixpanelSwapWidgetEvents,
  MixpanelTopBannerEvents,
} from './types'
import { MixpanelCommonAnalyticsSections, MixpanelEventTypes, MixpanelPages } from './types'

export const trackingEvents = {
  landingPageView: (utm: { [key: string]: string | string[] | undefined }) => {
    const eventBody = {
      product: TrackingProductType.BORROW,
      page: MixpanelPages.LandingPage,
      utm_source: utm.utmSource ? utm.utmSource : 'direct',
      utm_medium: utm.utmMedium ? utm.utmMedium : 'none',
      utm_campaign: utm.utmCampaign ? utm.utmCampaign : 'none',
    }

    mixpanelInternalAPI(MixpanelEventTypes.Pageview, eventBody)
  },

  pageView: (location: string) => {
    const eventBody = {
      product: TrackingProductType.BORROW,
      id: location,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.Pageview, eventBody)
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
      product: TrackingProductType.BORROW,
      walletType,
      connectionMethod,
      walletLabel,
    }

    mixpanelInternalAPI(MixpanelEventTypes.AccountChange, eventBody)
  },

  searchToken: (
    page:
      | MixpanelPages.LandingPage
      | MixpanelPages.OpenVaultOverview
      | MixpanelPages.VaultsOverview,
    query: string,
  ) => {
    const eventBody = {
      id: 'SearchToken',
      product: TrackingProductType.BORROW,
      page,
      query,
      section: MixpanelCommonAnalyticsSections.SelectCollateral,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  openVault: (page: MixpanelPages.LandingPage | MixpanelPages.OpenVaultOverview, ilk: string) => {
    const eventBody = {
      id: 'OpenVault',
      product: TrackingProductType.BORROW,
      ilk,
      page,
      section: MixpanelCommonAnalyticsSections.SelectCollateral,
    }

    mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  createVaultDeposit: (firstCDP: boolean | undefined, amount: string) => {
    const eventBody = {
      id: 'Deposit',
      product: TrackingProductType.BORROW,
      firstCDP,
      amount,
      page: MixpanelPages.VaultCreate,
      section: MixpanelCommonAnalyticsSections.CreateVault,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  createVaultGenerate: (firstCDP: boolean | undefined, amount: string) => {
    const eventBody = {
      id: 'Generate',
      product: TrackingProductType.BORROW,
      firstCDP,
      amount,
      page: MixpanelPages.VaultCreate,
      section: MixpanelCommonAnalyticsSections.CreateVault,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  createVaultSetupProxy: (
    firstCDP: boolean | undefined,
    depositAmount: string,
    generateAmount: string,
  ) => {
    const eventBody = {
      id: 'SetupProxy',
      product: TrackingProductType.BORROW,
      firstCDP,
      depositAmount,
      generateAmount,
      page: MixpanelPages.VaultCreate,
      section: MixpanelCommonAnalyticsSections.Configure,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  createProxy: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'CreateProxy',
      product: TrackingProductType.BORROW,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: MixpanelCommonAnalyticsSections.ProxyDeploy,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  pickAllowance: (firstCDP: boolean | undefined, type: string, amount: string) => {
    const eventBody = {
      id: 'PickAllowance',
      product: TrackingProductType.BORROW,
      firstCDP,
      type,
      amount,
      page: MixpanelPages.VaultCreate,
      section: MixpanelCommonAnalyticsSections.Allowance,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  setTokenAllowance: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'SetAllowance',
      product: TrackingProductType.BORROW,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: MixpanelCommonAnalyticsSections.Configure,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  approveAllowance: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'ApproveAllowance',
      product: TrackingProductType.BORROW,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: MixpanelCommonAnalyticsSections.Allowance,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  createVaultConfirm: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'Confirm',
      product: TrackingProductType.BORROW,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: MixpanelCommonAnalyticsSections.CreateVault,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  confirmVaultConfirm: (
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    firstCDP: boolean | undefined,
  ) => {
    const eventBody = {
      id: 'Confirm',
      product: TrackingProductType.BORROW,
      ilk,
      collateralAmount,
      daiAmount,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: MixpanelCommonAnalyticsSections.ConfirmVault,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
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
      product: TrackingProductType.BORROW,
      ilk,
      collateralAmount,
      daiAmount,
      firstCDP,
      txHash,
      network,
      walletType,
      page: MixpanelPages.VaultCreate,
      section: MixpanelCommonAnalyticsSections.ConfirmVault,
    }

    mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  confirmVaultEdit: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'EditVault',
      product: TrackingProductType.BORROW,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: MixpanelCommonAnalyticsSections.ConfirmVault,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  overviewManage: (vaultId: string, ilk: string) => {
    const eventBody = {
      id: 'Manage',
      product: TrackingProductType.BORROW,
      vaultId,
      ilk,
      page: MixpanelPages.VaultsOverview,
      section: MixpanelCommonAnalyticsSections.Table,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  createNewVault: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'createNewVault',
      product: TrackingProductType.BORROW,
      firstCDP,
      section: MixpanelCommonAnalyticsSections.NavBar,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  yourVaults: () => {
    const eventBody = {
      id: 'YourVaults',
      product: TrackingProductType.BORROW,
      section: MixpanelCommonAnalyticsSections.NavBar,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  switchToDai: (ControllerIsConnected: boolean) => {
    const eventBody = {
      id: 'SwitchToDai',
      product: TrackingProductType.BORROW,
      ControllerIsConnected,
      page: MixpanelPages.ManageCollateral,
      section: MixpanelCommonAnalyticsSections.Dai,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  switchToCollateral: (ControllerIsConnected: boolean) => {
    const eventBody = {
      id: 'SwitchToCollateral',
      product: TrackingProductType.BORROW,
      ControllerIsConnected,
      page: MixpanelPages.ManageDai,
      section: MixpanelCommonAnalyticsSections.Collateral,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  manageVaultDepositAmount: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'DepositAmount',
      product: TrackingProductType.BORROW,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageVaultGenerateAmount: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'GenerateAmount',
      product: TrackingProductType.BORROW,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageVaultWithdrawAmount: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'WithdrawAmount',
      product: TrackingProductType.BORROW,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageVaultPaybackAmount: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'PaybackAmount',
      product: TrackingProductType.BORROW,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageVaultConfirmVaultEdit: () => {
    const eventBody = {
      id: 'EditVault',
      product: TrackingProductType.BORROW,
      section: MixpanelCommonAnalyticsSections.ConfirmVault,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  // Can we distinguish if went through collateral/daiEditing?
  manageVaultConfirm: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
  ) => {
    const eventBody = {
      id: 'Confirm',
      product: TrackingProductType.BORROW,
      ilk,
      collateralAmount,
      daiAmount,
      page,
      section: MixpanelCommonAnalyticsSections.ConfirmVault,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  manageVaultConfirmTransaction: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    txHash: string,
    network: string,
    walletType: ConnectionKind,
  ) => {
    const eventBody = {
      id: 'ConfirmTransaction',
      product: TrackingProductType.BORROW,
      ilk,
      collateralAmount,
      daiAmount,
      txHash,
      network,
      walletType,
      page,
      section: MixpanelCommonAnalyticsSections.ConfirmVault,
    }

    mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  manageCollateralPickAllowance: (type: string, amount: string) => {
    const eventBody = {
      id: 'PickAllowance',
      product: TrackingProductType.BORROW,
      type,
      amount,
      page: MixpanelPages.ManageCollateral,
      section: MixpanelCommonAnalyticsSections.Allowance,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageCollateralApproveAllowance: () => {
    const eventBody = {
      id: 'ApproveAllowance',
      product: TrackingProductType.BORROW,
      page: MixpanelPages.ManageCollateral,
      section: MixpanelCommonAnalyticsSections.Allowance,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  manageDaiPickAllowance: (type: string, amount: string) => {
    const eventBody = {
      id: 'PickAllowance',
      product: TrackingProductType.BORROW,
      type,
      amount,
      page: MixpanelPages.ManageDai,
      section: MixpanelCommonAnalyticsSections.Allowance,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageDaiApproveAllowance: () => {
    const eventBody = {
      id: 'ApproveAllowance',
      product: TrackingProductType.BORROW,
      page: MixpanelPages.ManageDai,
      section: MixpanelCommonAnalyticsSections.Allowance,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  // First Confirm button when the user is on Collateral and type into Deposit
  manageCollateralDepositConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: TrackingProductType.BORROW,
      page: MixpanelPages.ManageCollateral,
      section: MixpanelCommonAnalyticsSections.Deposit,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  // Confirm button when the user is on Collateral and type into Withdraw
  manageCollateralWithdrawConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: TrackingProductType.BORROW,
      page: MixpanelPages.ManageCollateral,
      section: MixpanelCommonAnalyticsSections.Withdraw,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  // First Confirm button when the user is on Dai and type into Generate
  manageDaiGenerateConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: TrackingProductType.BORROW,
      page: MixpanelPages.ManageDai,
      section: MixpanelCommonAnalyticsSections.Generate,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  // Confirm button when the user is on Dai and type into Payback
  manageDaiPaybackConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: TrackingProductType.BORROW,
      page: MixpanelPages.ManageDai,
      section: MixpanelCommonAnalyticsSections.Payback,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  newsletterSubscribe: (
    section:
      | MixpanelCommonAnalyticsSections.NewsletterHomepage
      | MixpanelCommonAnalyticsSections.NewsletterFooter,
  ) => {
    const eventBody = {
      id: 'NewsletterSubscribe',
      product: TrackingProductType.BORROW,
      section,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
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
        product: TrackingProductType.MULTIPLY,
        ilk,
        firstCDP,
        collAmount,
        multiply,
        page: MixpanelPages.OpenMultiply,
        section: MixpanelCommonAnalyticsSections.ConfirmVault,
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
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
        product: TrackingProductType.MULTIPLY,
        ilk,
        firstCDP,
        collAmount,
        multiply,
        txHash,
        network,
        walletType,
        page: MixpanelPages.OpenMultiply,
        oasisFee,
        section: MixpanelCommonAnalyticsSections.ConfirmVault,
      }

      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },

    adjustPositionConfirm: (ilk: string, multiply: string) => {
      const eventBody = {
        id: 'Confirm',
        product: TrackingProductType.MULTIPLY,
        ilk,
        multiply,
        page: MixpanelPages.AdjustPosition,
        section: MixpanelCommonAnalyticsSections.ConfirmVault,
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
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
        product: TrackingProductType.MULTIPLY,
        ilk,
        multiply,
        txHash,
        network,
        walletType,
        oasisFee,
        page: MixpanelPages.AdjustPosition,
        section: MixpanelCommonAnalyticsSections.ConfirmVault,
      }

      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },

    otherActionsConfirm: (ilk: string, collateralAmount: string, daiAmount: string) => {
      const eventBody = {
        id: 'Confirm',
        product: TrackingProductType.MULTIPLY,
        ilk,
        collateralAmount,
        daiAmount,
        page: MixpanelPages.OtherActions,
        section: MixpanelCommonAnalyticsSections.ConfirmVault,
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
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
        product: TrackingProductType.MULTIPLY,
        ilk,
        collateralAmount,
        daiAmount,
        txHash,
        network,
        walletType,
        oasisFee,
        page: MixpanelPages.OtherActions,
        section: MixpanelCommonAnalyticsSections.ConfirmVault,
      }

      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },

    closeVaultConfirm: (ilk: string, debt: string, closeTo: CloseVaultTo) => {
      const eventBody = {
        id: 'Confirm',
        product: TrackingProductType.BORROW,
        ilk,
        debt,
        closeTo,
        page: MixpanelPages.CloseVault,
        section: MixpanelCommonAnalyticsSections.ConfirmVault,
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
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
        product: TrackingProductType.MULTIPLY,
        ilk,
        debt,
        closeTo,
        txHash,
        network,
        walletType,
        oasisFee,
        page: MixpanelPages.CloseVault,
        section: MixpanelCommonAnalyticsSections.ConfirmVault,
      }

      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
  },
  earn: {
    stETHOpenPositionDepositAmount: (depositAmount: BigNumber) => {
      const eventBody = {
        id: 'DepositAmount',
        product: TrackingProductType.EARN,
        depositAmount: depositAmount.toString(),
        page: MixpanelPages.OpenEarnSTETH,
        section: MixpanelCommonAnalyticsSections.OpenPosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
    },
    stETHOpenPositionConfirmDeposit: (depositAmount: BigNumber) => {
      const eventBody = {
        id: 'ConfirmDeposit',
        product: TrackingProductType.EARN,
        depositAmount: depositAmount.toString(),
        page: MixpanelPages.OpenEarnSTETH,
        section: MixpanelCommonAnalyticsSections.OpenPosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
    stETHOpenPositionMoveSlider: (depositAmount: BigNumber, riskRatio: BigNumber) => {
      const eventBody = {
        id: 'MoveSlider',
        product: TrackingProductType.EARN,
        depositAmount: depositAmount.toString(),
        riskRatio: formatPrecision(riskRatio, 4),
        page: MixpanelPages.OpenEarnSTETH,
        section: MixpanelCommonAnalyticsSections.OpenPosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
    },
    stETHOpenPositionConfirmRisk: (depositAmount: BigNumber, riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmRisk',
        product: TrackingProductType.EARN,
        depositAmount: depositAmount.toString(),
        riskRatio: formatPrecision(riskRatio, 4),
        page: MixpanelPages.OpenEarnSTETH,
        section: MixpanelCommonAnalyticsSections.OpenPosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
    stETHOpenPositionConfirmTransaction: (depositAmount: BigNumber, riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: TrackingProductType.EARN,
        depositAmount: depositAmount.toString(),
        riskRatio: formatPrecision(riskRatio, 4),
        page: MixpanelPages.OpenEarnSTETH,
        section: MixpanelCommonAnalyticsSections.OpenPosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
    aaveAdjustRiskSliderAction: (
      action: 'ConfirmRisk' | 'MoveSlider',
      riskRatio: BigNumber,
      productType: TrackingProductType,
    ) => {
      const eventBody = {
        id: action,
        product: productType.toLocaleLowerCase(),
        riskRatio: formatPrecision(riskRatio, 4),
        page: {
          [TrackingProductType.MULTIPLY]: MixpanelPages.AdjustPosition,
          [TrackingProductType.EARN]: MixpanelPages.ManageSTETH,
          [TrackingProductType.BORROW]: '',
        }[productType.toLocaleLowerCase()],
        section: MixpanelCommonAnalyticsSections.AdjustRisk,
      }
      mixpanelInternalAPI(
        action === 'MoveSlider' ? MixpanelEventTypes.InputChange : MixpanelEventTypes.ButtonClick,
        eventBody,
      )
    },
    stETHAdjustRiskConfirmTransaction: (riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: TrackingProductType.EARN,
        riskRatio: formatPrecision(riskRatio, 4),
        page: MixpanelPages.ManageSTETH,
        section: MixpanelCommonAnalyticsSections.AdjustRisk,
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
    stETHClosePositionConfirm: () => {
      const eventBody = {
        id: 'Confirm',
        product: TrackingProductType.EARN,
        page: MixpanelPages.ManageSTETH,
        section: MixpanelCommonAnalyticsSections.ClosePosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
    stETHClosePositionConfirmTransaction: () => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: TrackingProductType.EARN,
        page: MixpanelPages.ManageSTETH,
        section: MixpanelCommonAnalyticsSections.ClosePosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
  },

  automation: {
    inputChange: (
      id: MixpanelAutomationEventIds,
      page: string,
      section: MixpanelCommonAnalyticsSections.Form,
      additionalParams: MixpanelAutomationEventsAdditionalParams,
    ) => {
      const eventBody = {
        id,
        page,
        section,
        product: TrackingProductType.Automation,
        ...additionalParams,
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
    },
    buttonClick: (
      id: MixpanelAutomationEventIds,
      page: string,
      section: MixpanelCommonAnalyticsSections,
      additionalParams: MixpanelAutomationEventsAdditionalParams,
    ) => {
      const eventBody = {
        id,
        page,
        section,
        product: TrackingProductType.Automation,
        ...additionalParams,
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
  },
  swapWidgetEvent: (id: MixpanelSwapWidgetEvents, eventData: Route | RouteExecutionUpdate) => {
    const eventBody = {
      id,
      section: MixpanelCommonAnalyticsSections.SwapWidget,
      product: TrackingProductType.SwapWidget,
      eventData,
    }
    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.SwapWidgetEvent, eventBody)
  },
  topBannerEvent: (id: MixpanelTopBannerEvents, topBannerName: string) => {
    const eventBody = {
      id,
      section: MixpanelCommonAnalyticsSections.TopBanner,
      product: TrackingProductType.TopBanner,
      topBannerName,
    }
    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.TopBannerEvent, eventBody)
  },
  daiSavingsRate: (
    event: MixpanelEventTypes.InputChange | MixpanelEventTypes.ButtonClick,
    eventData: {
      depositAmount: number
      operation?: 'deposit' | 'withdraw' | 'convert'
      txHash?: string
      network?: string
      walletType?: string
    },
  ) => {
    const { txHash, ...eventDataRest } = eventData
    const eventCommons = {
      section: MixpanelCommonAnalyticsSections.Form,
      page: MixpanelPages.DAISavingsRate,
      product: TrackingProductType.EARN,
      txHash,
    }
    if (event === MixpanelEventTypes.InputChange) {
      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(event, {
          ...eventCommons,
          id: {
            [MixpanelEventTypes.InputChange]: 'DepositAmount',
          },
          eventData: { txHash, ...eventDataRest },
        })
    }

    const eventId = match(eventDataRest.operation)
      .with('deposit', () => 'ConfirmDeposit')
      .with('withdraw', () => 'ConfirmWithdraw')
      .with('convert', () => 'ConfirmConvert')
      .with(P._, () => 'Undefiend')
      .run()

    if (event === MixpanelEventTypes.ButtonClick) {
      mixpanelInternalAPI(event, {
        ...eventCommons,
        id: {
          [MixpanelEventTypes.ButtonClick]: eventId,
        },
        eventData: mixpanel.has_opted_out_tracking() ? { txHash } : { txHash, ...eventDataRest },
      })
    }
  },
  migrations: {
    buttonClick: (data: MixpanelMigrationsButtonClickParams) => {
      const { id, section, page, ...additionalParams } = data
      const eventBody = {
        id,
        section,
        page,
        feature: TrackingFeatureType.Migrations,
        ...additionalParams,
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
    displayed: (page: MixpanelPages.Portfolio | MixpanelPages.ProductHub) => {
      const eventBody = {
        id: MixpanelMigrationsEventIds.PromptDisplayed,
        feature: TrackingFeatureType.Migrations,
        page,
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.Displayed, eventBody)
    },
  },
  txStatus: (
    id: MixpanelTxEventsIds,
    page: MixpanelPages,
    feature: TrackingFeatureType,
    txHash: string,
    totalCost?: string,
  ) => {
    const eventBody = { id, page, feature, txHash, totalCost }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.TxStatus, eventBody)
  },
  productHub: {
    filterChange: (filter: MixpanelProductHubChangeFilter, value: string) => {
      mixpanelInternalAPI(MixpanelEventTypes.ProductHubChange, {
        filter,
        value,
      })
    },
  },
  raysDailyRewards: {
    claim: ({
      allBonusRays,
      streaks,
      currentStreak,
    }: {
      allBonusRays: number
      streaks: number
      currentStreak: number
    }) => {
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, {
        id: 'ClaimDailyRaysBonus',
        allBonusRays,
        streaks,
        currentStreak,
      })
    },
  },
}

export type Tracker = typeof trackingEvents
