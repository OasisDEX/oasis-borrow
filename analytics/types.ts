import type { CloseVaultTo } from 'features/multiply/manage/pipes/CloseVaultTo.types'
import type * as mixpanelBrowser from 'mixpanel-browser'

export type MixpanelPropertyNameType = '$initial_referrer' | '$user_id'

export type MixpanelDevelopmentType = {
  track: (eventType: string, payload: any) => void
  get_distinct_id: () => string
  has_opted_out_tracking: () => boolean
  get_property: (propertyName: MixpanelPropertyNameType) => string | null
}

export type MixpanelType = MixpanelDevelopmentType | typeof mixpanelBrowser

export enum MixpanelPages {
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
  DAISavingsRate = 'DAISavingsRate',
  ProductHub = 'ProductHub',
  Portfolio = 'Portfolio',
  Migrations = 'Migrations',
}

export enum MixpanelAutomationEventIds {
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

export interface MixpanelAutomationEventsAdditionalParams {
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

export enum MixpanelSwapWidgetEvents {
  ExecutionStarted = 'SwapWidgetExecutionStarted',
  ExecutionUpdated = 'SwapWidgetExecutionUpdated',
  ExecutionCompleted = 'SwapWidgetExecutionCompleted',
  ExecutionFailed = 'SwapWidgetExecutionFailed',
}
export enum MixpanelTopBannerEvents {
  TopBannerClosed = 'TopBannerClosed',
  TopBannerClicked = 'TopBannerClicked',
}

export enum MixpanelNotificationsEventIds {
  OpenNotificationCenter = 'OpenNotificationCenter',
  ScrollNotificationCenter = 'ScrollNotificationCenter',
  MarkAsRead = 'MarkAsRead',
  GoToVault = 'GoToVault',
  NotificationPreferences = 'NotificationPreferences',
  VaultActionNotificationSwitch = 'VaultActionNotificationSwitch',
  VaultInfoNotificationSwitch = 'VaultInfoNotificationSwitch',
}

export interface MixpanelNotificationsEventAdditionalParams {
  walletAddress: string
  walletType: string
  browserType: string
  notificationSwitch?: 'on' | 'off'
}

export enum MixpanelCommonAnalyticsSections {
  HeaderTabs = 'HeaderTabs',
  Banner = 'Banner',
  Form = 'Form',
  NotificationCenter = 'NotificationCenter',
  NotificationPreferences = 'NotificationPreferences',
  OpenPosition = 'OpenPosition',
}

export enum MixpanelEventTypes {
  Pageview = 'Pageview',
  AccountChange = 'account-change',
  InputChange = 'input-change',
  ButtonClick = 'btn-click',
  OnScroll = 'on-scroll',
  Displayed = 'displayed',
  TxStatus = 'tx-status',
  SwapWidgetEvent = 'swap-widget-event',
  TopBannerEvent = 'top-banner-event',
}
