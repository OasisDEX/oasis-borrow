import { expect } from 'chai'
import { useFeatureToggle, FT_LOCAL_STORAGE_KEY, loadFeatureToggles } from './useFeatureToggle'

describe.only('useFeatureEnabled', () => {
  describe('loading feature toggles', () => {
    it('creates the features and sets to disabled in local storage on first load', () => {
      expect(localStorage.getItem(FT_LOCAL_STORAGE_KEY)).to.be.null
      loadFeatureToggles()
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).to.contain({
        TestFeature: false,
      })
    })

    it('creates a new feature on load when there are existing features', () => {
      localStorage.setItem(
        FT_LOCAL_STORAGE_KEY,
        JSON.stringify({
          TestFeature: false,
        }),
      )
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).not.to.contain({
        AnotherTestFeature: true,
      })
      loadFeatureToggles(['AnotherTestFeature'])
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).to.contain({
        AnotherTestFeature: true,
      })
    })

    it('does not overwrite existing enabled feature toggles on load', () => {
      localStorage.setItem(
        FT_LOCAL_STORAGE_KEY,
        JSON.stringify({
          TestFeature: true,
        }),
      )
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).to.contain({
        TestFeature: true,
      })
      loadFeatureToggles()
      expect(JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) as string)).to.contain({
        TestFeature: true,
      })
    })
  })

  describe('enabling & disabling features', () => {
    it('enables feature when enabled in local storage and disabled in code', () => {
      localStorage.setItem(
        FT_LOCAL_STORAGE_KEY,
        JSON.stringify({
          TestFeature: true,
        }),
      )
      loadFeatureToggles()
      expect(useFeatureToggle('TestFeature')).to.be.true
    })

    it('enables feature when enabled in code and disabled in local storage', () => {
      localStorage.setItem(
        FT_LOCAL_STORAGE_KEY,
        JSON.stringify({
          AnotherTestFeature: false,
        }),
      )
      loadFeatureToggles()
      expect(useFeatureToggle('AnotherTestFeature')).to.be.true
    })

    it('disables feature when disabled in code and localstorage', () => {
      localStorage.setItem(
        FT_LOCAL_STORAGE_KEY,
        JSON.stringify({
          TestFeature: false,
        }),
      )
      loadFeatureToggles()
      expect(useFeatureToggle('TestFeature')).to.be.false
    })
  })

  afterEach(() => {
    localStorage.clear()
  })
})
