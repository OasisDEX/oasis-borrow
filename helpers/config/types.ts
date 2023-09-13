export enum Feature {
  AaveV3ArbitrumBorrow = 'AaveV3ArbitrumBorrow',
  AaveV3ArbitrumEarn = 'AaveV3ArbitrumEarn',
  AaveV3EarncbETHeth = 'AaveV3EarncbETHeth',
  AaveV3EarnrETHeth = 'AaveV3EarnrETHeth',
  AaveV3History = 'AaveV3History',
  AaveV3OptimismBorrow = 'AaveV3OptimismBorrow',
  AaveV3OptimismEarn = 'AaveV3OptimismEarn',
  AaveV3Protection = 'AaveV3Protection',
  AaveV3ProtectionWrite = 'AaveV3ProtectionWrite',
  AjnaPoolFinder = 'AjnaPoolFinder',
  AjnaReusableDPM = 'AjnaReusableDPM',
  AjnaSafetySwitch = 'AjnaSafetySwitch',
  AjnaSuppressValidation = 'AjnaSuppressValidation',
  AnotherTestFeature = 'AnotherTestFeature',
  ConstantMultipleReadOnly = 'ConstantMultipleReadOnly',
  DaiSavingsRate = 'DaiSavingsRate',
  DisableSidebarScroll = 'DisableSidebarScroll',
  FollowAAVEVaults = 'FollowAAVEVaults',
  ProxyCreationDisabled = 'ProxyCreationDisabled',
  ProxyReveal = 'ProxyReveal',
  ReadOnlyAutoTakeProfit = 'ReadOnlyAutoTakeProfit',
  ReadOnlyBasicBS = 'ReadOnlyBasicBS',
  Referrals = 'Referrals',
  Sillyness = 'Sillyness',
  StopLossOpenFlow = 'StopLossOpenFlow',
  StopLossRead = 'StopLossRead',
  StopLossWrite = 'StopLossWrite',
  TestFeature = 'TestFeature',
  UseNetworkSwitcherForks = 'UseNetworkSwitcherForks',
  UseNetworkSwitcherTestnets = 'UseNetworkSwitcherTestnets',
}
export type ConfiguredFeatures = Record<Feature, boolean>

export type ConfigResponseType = {
  features: ConfiguredFeatures
}

export type ConfigResponseTypeKey = keyof ConfigResponseType

export type ConfigContext = {
  config: ConfigResponseType
}
