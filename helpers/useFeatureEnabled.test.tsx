import { expect } from 'chai'
import { useFeatureEnabled } from './useFeatureEnabled'

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

  describe('adding/removing a feature toggle', () => {
    it('creates the features and sets to disabled in local storage on first load')

    it('creates a new feature on load when there are existing features')

    it('does not overwrite existing enabled feature toggles on load')

    it('removes toggles from local storage when they are removed from code')
  })

  describe('enabled/disabled', () => {
    it('enables feature when enabled in local storage')
    it('enables feature when enabled in code')
    it('disables feature when disabled in code and localstorage')
  })

  // old notes

  // returns true if the feature is enabled in local storage
  // returns false if the feature is disabled in local storage
  // returns true if a feature is disabled in local storage but enabled in code

  // does not update an existing feature in local storage if it has been set by user
  // creates new features in local storage
  // it marks feature as enabled if the feature has been released (flagged in code as enabled)

  afterEach(() => {
    localStorage.clear()
  })

  describe('local dev', () => {
    // add a new feature toggle - set as disabled
    //  - creates in local storage.  does not override existing feature toggles - merges in
    // enable using local storage
    // disable using local storage
    //
    // testing on staging - enable feature toggle in local storage
    // disable
    //
    // releasing
    // set feature as enabled in source code, and deploy.
    // 👉 feature enabled overwrites local storage state
    // 👉 feature disabled does not overwrite local storage state
    // therefore feature is enabled if one of local storage and code is set to true
  })
})
