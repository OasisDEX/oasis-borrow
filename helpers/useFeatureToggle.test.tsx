import { expect } from 'chai'

import {
  configureLocalStorageForTests,
  FT_LOCAL_STORAGE_KEY,
  loadFeatureToggles,
  useFeatureToggle,
} from './useFeatureToggle'

describe('useFeatureEnabled', () => {
  describe('loading feature toggles', () => {
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
