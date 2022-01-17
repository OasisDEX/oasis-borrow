import { expect } from 'chai'

import {
  configureLocalStorageForTests,
  FT_LOCAL_STORAGE_KEY,
  loadFeatureToggles,
  useFeatureToggle,
} from './useFeatureToggle'

describe('useFeatureEnabled', () => {
  describe('loading feature toggles', () => {
    it('creates the features and sets to disabled in local storage on first load', () => {
      expect(localStorage.getItem(FT_LOCAL_STORAGE_KEY)).to.be.null
      loadFeatureToggles()
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).to.contain({
        TestFeature: false,
      })
    })

    it('creates a new feature on load when there are existing features', () => {
      configureLocalStorageForTests({
        TestFeature: false,
      })
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).not.to.contain({
        AnotherTestFeature: true,
      })
      loadFeatureToggles(['AnotherTestFeature'])
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).to.contain({
        AnotherTestFeature: true,
      })
    })

    it('does not overwrite existing enabled feature toggles on load', () => {
      configureLocalStorageForTests({
        TestFeature: true,
      })
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).to.contain({
        TestFeature: true,
      })
      loadFeatureToggles()
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).to.contain({
        TestFeature: true,
      })
    })

    it('does not overwrite existing disabled feature toggles when features are enabled in code', () => {
      configureLocalStorageForTests({
        TestFeature: false,
      })
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).to.contain({
        TestFeature: false,
      })
      loadFeatureToggles(['TestFeature'])
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).to.contain({
        TestFeature: false,
      })
    })

    it('sets new enabled features as disabled in local storage, but the feature is enabled', () => {
      loadFeatureToggles()
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).to.contain({
        AnotherTestFeature: false,
      })
      expect(useFeatureToggle('AnotherTestFeature')).to.be.true
    })
  })

  describe('enabling & disabling features', () => {
    it('enables feature when enabled in local storage and disabled in code', () => {
      configureLocalStorageForTests({
        TestFeature: true,
      })
      loadFeatureToggles()
      expect(useFeatureToggle('TestFeature')).to.be.true
    })

    it('enables feature when enabled in code and disabled in local storage', () => {
      configureLocalStorageForTests({
        AnotherTestFeature: false,
      })
      loadFeatureToggles()
      expect(useFeatureToggle('AnotherTestFeature')).to.be.true
    })

    it('disables feature when disabled in code and localstorage', () => {
      configureLocalStorageForTests({
        TestFeature: false,
      })
      loadFeatureToggles()
      expect(useFeatureToggle('TestFeature')).to.be.false
    })
  })

  afterEach(() => {
    localStorage.clear()
  })
})
