import { expect } from 'chai'
import { useFeatureEnabled, FT_LOCAL_STORAGE_KEY, loadFeatureToggles } from './useFeatureEnabled'

describe.only('useFeatureEnabled', () => {
  describe('test setup', () => {
    it('passes the test', () => {
      expect(true).to.be.true
    })

    it('sets local storage', () => {
      localStorage.setItem('anthony', 'sennett')
      const val = localStorage.getItem('anthony')
      expect(val).to.equal('sennett')
    })

    it('clears local storage', () => {
      const val = localStorage.getItem('anthony')
      expect(val).to.equal(null)
    })
  })

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

  describe('enabled/disabled', () => {
    it('enables feature when enabled in local storage and disabled in code', () => {
      localStorage.setItem(
        FT_LOCAL_STORAGE_KEY,
        JSON.stringify({
          TestFeature: true,
        }),
      )
      loadFeatureToggles()
      expect(useFeatureEnabled('TestFeature')).to.be.true
    })

    it('enables feature when enabled in code and disabled in local storage', () => {
      localStorage.setItem(
        FT_LOCAL_STORAGE_KEY,
        JSON.stringify({
          AnotherTestFeature: false,
        }),
      )
      loadFeatureToggles()
      expect(useFeatureEnabled('AnotherTestFeature')).to.be.true
    })

    it('disables feature when disabled in code and localstorage', () => {
      localStorage.setItem(
        FT_LOCAL_STORAGE_KEY,
        JSON.stringify({
          TestFeature: false,
        }),
      )
      loadFeatureToggles()
      expect(useFeatureEnabled('TestFeature')).to.be.false
    })
  })

  afterEach(() => {
    localStorage.clear()
  })
})
