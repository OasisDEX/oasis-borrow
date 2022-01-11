import { assign } from 'lodash'

export const FT_LOCAL_STORAGE_KEY = 'features'

type ConfiguredFeatures = Record<Features, boolean>

type Features = 'TestFeature' | 'AnotherTestFeature' | 'AssetLandingPages'
const configuredFeatures: Record<Features, boolean> = {
  TestFeature: false, // used in unit tests
  AnotherTestFeature: true, // used in unit tests
  AssetLandingPages: false,
  // your feature here....
}

export function configureLocalStorageForTests(data: { [feature in Features]?: boolean }) {
  localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(data))
}

export function loadFeatureToggles(features: Array<Features> = []) {
  // update local toggles
  if (typeof localStorage !== 'undefined') {
    const _releaseSelectedFeatures = assign(
      {},
      features.reduce(
        (acc, feature) => ({
          ...acc,
          [feature]: true,
        }),
        configuredFeatures,
      ),
    )
    const rawFeatures = localStorage.getItem(FT_LOCAL_STORAGE_KEY)
    if (!rawFeatures) {
      localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(_releaseSelectedFeatures))
    } else {
      const userSelectedFeatures: ConfiguredFeatures = JSON.parse(rawFeatures) as ConfiguredFeatures
      const merged = assign({}, _releaseSelectedFeatures, userSelectedFeatures)
      localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(merged))
    }
  }
}

export function useFeatureToggle(feature: Features): boolean {
  const userEnabledFeatures = localStorage.getItem(FT_LOCAL_STORAGE_KEY)
  return JSON.parse(userEnabledFeatures || '{}')[feature] || configuredFeatures[feature]
}
