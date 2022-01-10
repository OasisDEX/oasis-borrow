import { assign } from 'lodash'

const FT_LOCAL_STORAGE_KEY = 'features'

export enum Features {
  TestFeature = 'TestFeature', // used in unit tests
  AssetLandingPages = 'AssetLandingPages',
}

const releaseSelectedFeatures = Object.keys(Features).reduce((acc, feature) => {
  acc[feature as Features] = false
  return acc
}, {} as FeaturesData)

type FeaturesData = {
  [key in Features]: boolean
}

const enabledFeatures = [Features.AssetLandingPages]

// update local toggles
if (typeof window !== 'undefined' && window.localStorage) {
  const rawFeatures = localStorage.getItem(FT_LOCAL_STORAGE_KEY)
  if (!rawFeatures) {
    localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(releaseSelectedFeatures))
  } else {
    const userSelectedFeatures: FeaturesData = JSON.parse(rawFeatures) as FeaturesData
    const merged = assign({}, releaseSelectedFeatures, userSelectedFeatures)
    localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(merged))
  }
}

export function useFeatureEnabled(feature: Features): boolean {
  const userEnabledFeatures = localStorage.getItem(FT_LOCAL_STORAGE_KEY)
  if (userEnabledFeatures) {
    return JSON.parse(userEnabledFeatures)[feature] || enabledFeatures.includes(feature)
  } else {
    return false
  }
}
