import { FeatureFlag } from '@prisma/client'
import axios from 'axios'
import { mapValues } from 'lodash'
export const FT_LOCAL_STORAGE_KEY = 'features'

type ConfiguredFeatures = Record<Feature, boolean>

export type Feature =
  | 'TestFeature'
  | 'AnotherTestFeature'
  | 'Automation'
  | 'StopLossRead'
  | 'StopLossWrite'
  | 'StopLossOpenFlow'
  | 'BasicBS'
  | 'BatchCache'
  | 'ReadOnlyBasicBS'
  | 'Notifications'
  | 'Referrals'
  | 'ConstantMultiple'
  | 'ConstantMultipleReadOnly'
  | 'DisableSidebarScroll'
  | 'ProxyCreationDisabled'
  | 'AutoTakeProfit'
  | 'UpdatedPnL'
  | 'ReadOnlyAutoTakeProfit'
  | 'DiscoverOasis'
  | 'ShowAaveStETHETHProductCard'

const configuredFeatures: Record<Feature, boolean> = {
  TestFeature: false, // used in unit tests
  AnotherTestFeature: true, // used in unit tests
  Automation: true,
  StopLossRead: true,
  StopLossWrite: true,
  BatchCache: false,
  StopLossOpenFlow: false,
  BasicBS: true,
  ReadOnlyBasicBS: false,
  Notifications: true,
  Referrals: true,
  ConstantMultiple: true,
  ConstantMultipleReadOnly: false,
  DisableSidebarScroll: false,
  ProxyCreationDisabled: false,
  AutoTakeProfit: true,
  UpdatedPnL: false,
  ReadOnlyAutoTakeProfit: false,
  DiscoverOasis: false,
  ShowAaveStETHETHProductCard: true,
  // your feature here, don't forget to add it to the databse(feature_flags table)....
}

export function configureLocalStorageForTests(data: { [feature in Feature]?: boolean }) {
  localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(data))
}

function normalizeFirstLetter(string: string) {
  return `${string.charAt(0).toLowerCase()}${string.slice(1)}`
}

function mapFeatureToggles(
  dbFeatureToggles: FeatureFlag[],
  localFeatureToggles: Record<Feature, boolean>,
) {
  const mappedFeatureFlags = {} as any

  for (const key of Object.keys(localFeatureToggles)) {
    const featureToggleKey = normalizeFirstLetter(key) as keyof FeatureFlag
    const dbToggle = dbFeatureToggles.find(t => t.feature === featureToggleKey)

    if (dbToggle) {
      mappedFeatureFlags[key] = dbToggle.enabled
    }
  }

  return mappedFeatureFlags
}

function setLocalStorageFeatureFlags(testFeaturesFlaggedEnabled: Array<Feature> = []) {
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
// Features in code are added to localstorage on app start, where they do not exist.
// They are also disabled in local storage, even if they are enabled in the code.
// Because a feature is enabled if it's enabled either in code or local storage, the
// feature ends up enabled.

export function loadFeatureToggles(testFeaturesFlaggedEnabled: Array<Feature> = []) {
  // fetch toggles from the database
  axios
    .get('/api/features')
    .then((res) => {
      // Store values in localstorage becasue if there is a lost connection, features will be able to read from there.
      if (res.data && process.env.NODE_ENV === 'production') {
        // use DB in production only as a fallback
        const featureToggles = res.data as FeatureFlag[]
        const toggles = mapFeatureToggles(featureToggles, configuredFeatures)

        if (toggles) localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(toggles))
      } else {
        // Use this for dev experience, allows us to toggle features much quicker using chrome extension. Also, if the request fails, localstorage provides a fallback.
        // No-yet-loaded features are always set to false in local storage even if true in code.
        setLocalStorageFeatureFlags(testFeaturesFlaggedEnabled)
      }
    })
    .catch(() => {
      setLocalStorageFeatureFlags(testFeaturesFlaggedEnabled)
    })
}

export function useFeatureToggle(feature: Feature): boolean {
  const userEnabledFeatures = localStorage.getItem(FT_LOCAL_STORAGE_KEY)
  return JSON.parse(userEnabledFeatures || '{}')[feature] || configuredFeatures[feature]
}
