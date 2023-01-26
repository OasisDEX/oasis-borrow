import { mapValues } from 'lodash'
export const FT_LOCAL_STORAGE_KEY = 'features'

type ConfiguredFeatures = Record<Feature, boolean>

export type Feature =
  | 'TestFeature'
  | 'AnotherTestFeature'
  | 'StopLossRead'
  | 'StopLossWrite'
  | 'StopLossOpenFlow'
  | 'BatchCache'
  | 'ReadOnlyBasicBS'
  | 'Notifications'
  | 'Referrals'
  | 'ConstantMultipleReadOnly'
  | 'DisableSidebarScroll'
  | 'ProxyCreationDisabled'
  | 'AutoTakeProfit'
  | 'UpdatedPnL'
  | 'ReadOnlyAutoTakeProfit'
  | 'DiscoverOasis'
  | 'AaveBorrow'
  | 'FollowVaults'
  | 'AaveProtection'
  | 'Ajna'
  | 'DaiSavingsRate'
  | 'FollowAave'

const configuredFeatures: Record<Feature, boolean> = {
  TestFeature: false, // used in unit tests
  AnotherTestFeature: true, // used in unit tests
  StopLossRead: true,
  StopLossWrite: true,
  BatchCache: false,
  StopLossOpenFlow: false,
  ReadOnlyBasicBS: false,
  Notifications: true,
  Referrals: true,
  ConstantMultipleReadOnly: false,
  DisableSidebarScroll: false,
  ProxyCreationDisabled: false,
  AutoTakeProfit: true,
  UpdatedPnL: false,
  ReadOnlyAutoTakeProfit: false,
  DiscoverOasis: true,
  AaveBorrow: false,
  FollowVaults: false,
  AaveProtection: false,
  Ajna: false,
  DaiSavingsRate: true,
  FollowAave: false,
}

export function configureLocalStorageForTests(data: { [feature in Feature]?: boolean }) {
  localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(data))
}

// Features in code are added to localstorage on app start, where they do not exist.
// They are also disabled in local storage, even if they are enabled in the code.
// Because a feature is enabled if it's enabled either in code or local storage, the
// feature ends up enabled.

export function loadFeatureToggles(testFeaturesFlaggedEnabled: Array<Feature> = []) {
  // update local toggles
  if (typeof localStorage !== 'undefined') {
    // No-yet-loaded features are always set to false in local storage even if true in code.
    const featuresToLoadInLocalStorage = mapValues(configuredFeatures, () => false)

    // Gather features enabled in unit tests.
    const featuresEnabledForUnitTesting = testFeaturesFlaggedEnabled.reduce(
      (acc, feature) => ({
        ...acc,
        [feature]: true,
      }),
      {},
    )

    const featuresSourcedFromCode = {
      ...featuresToLoadInLocalStorage,
      ...featuresEnabledForUnitTesting,
    }

    const featureFlagsInLocalStorage = localStorage.getItem(FT_LOCAL_STORAGE_KEY)
    if (!featureFlagsInLocalStorage) {
      localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(featuresSourcedFromCode))
    } else {
      const userSelectedFeatures: ConfiguredFeatures = JSON.parse(
        featureFlagsInLocalStorage,
      ) as ConfiguredFeatures
      const merged = { ...featuresSourcedFromCode, ...userSelectedFeatures }
      localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(merged))
    }
  }
}

export function getFeatureToggle(feature: Feature): boolean {
  if (typeof localStorage !== 'undefined') {
    const userEnabledFeatures = localStorage.getItem(FT_LOCAL_STORAGE_KEY)

    return JSON.parse(userEnabledFeatures || '{}')[feature] || configuredFeatures[feature]
  }
  return false
}

export function useFeatureToggle(feature: Feature): boolean {
  return getFeatureToggle(feature)
}
