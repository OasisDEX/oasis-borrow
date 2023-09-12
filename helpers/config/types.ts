export enum Feature {
  TestFeature = 'TestFeature',
  AnotherTestFeature = 'AnotherTestFeature',
  AaveV3Arbitrum = 'AaveV3Arbitrum',
  AaveV3Borrow = 'AaveV3Borrow',
  AaveV3EarncbETHeth = 'AaveV3EarncbETHeth',
  AaveV3EarnrETHeth = 'AaveV3EarnrETHeth',
  AaveV3Multiply = 'AaveV3Multiply',
  AaveV3History = 'AaveV3History',
  AaveV3Protection = 'AaveV3Protection',
  AaveV3ProtectionWrite = 'AaveV3ProtectionWrite',
  AjnaPoolFinder = 'AjnaPoolFinder',
  AjnaReusableDPM = 'AjnaReusableDPM',
  AjnaSafetySwitch = 'AjnaSafetySwitch',
  AjnaSuppressValidation = 'AjnaSuppressValidation',
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
  UseNetworkSwitcher = 'UseNetworkSwitcher',
  UseNetworkSwitcherArbitrum = 'UseNetworkSwitcherArbitrum',
  UseNetworkSwitcherForks = 'UseNetworkSwitcherForks',
  UseNetworkSwitcherOptimism = 'UseNetworkSwitcherOptimism',
  UseNetworkSwitcherTestnets = 'UseNetworkSwitcherTestnets',
  SparkProtocol = 'SparkProtocol',
  SparkProtocolEarn = 'SparkProtocolEarn',
  SparkProtocolBorrow = 'SparkProtocolBorrow',
  SparkProtocolMultiply = 'SparkProtocolMultiply',
  SparkProtocolSDAIETH = 'SparkProtocolSDAIETH',
}
export type ConfiguredFeatures = Record<Feature, boolean>

export type ConfigResponseType = {
  features: ConfiguredFeatures
}

export type ConfigResponseTypeKey = keyof ConfigResponseType

export type ConfigContext = {
  config: ConfigResponseType
}
