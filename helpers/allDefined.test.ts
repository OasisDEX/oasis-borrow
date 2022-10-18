import { expect } from 'chai'

import { allDefined } from './allDefined'

describe('allDefined', () => {
  describe('basic cases', () => {
    it('returns true if all params are defined', () => {
      expect(allDefined(1, 2, 3)).eq(true)
    })

    it('returns false if any param is undefined', () => {
      expect(allDefined(1, 2, undefined)).eq(false)
    })

    it('returns false with one undefined param', () => {
      expect(allDefined(undefined)).eq(false)
    })

    it('treats zero, string and null as defined', () => {
      expect(allDefined(0)).eq(true)
      expect(allDefined('')).eq(true)
      expect(allDefined(null)).eq(true)
    })
  })

  describe('chaining + objects', () => {
    let fixture: any
    beforeEach(() => {
      fixture = {
        nestedObject: {
          value: 'yes',
          undef: undefined,
        },
        missingNestedObject: undefined,
      }
    })

    it('returns true on object', () => {
      expect(allDefined(fixture)).eq(true)
    })

    it('should return true on exisitng object existing value', () => {
      expect(allDefined(fixture.nestedObject.value)).eq(true)
    })

    it('should return false on existing object undefined value', () => {
      expect(allDefined(fixture.nestedObject.undef)).eq(false)
    })

    it('should return false on existing object missing value', () => {
      expect(allDefined(fixture.nestedObject.missing)).eq(false)
    })

    it('returns false on existing undefined object', () => {
      expect(allDefined(fixture.missingNestedObject)).eq(false)
    })

    it("returns false on existing undefined object's prop", () => {
      expect(allDefined(fixture.missingNestedObject?.blah)).eq(false)
    })

    it("returns false on existing undefined object's prop's prop", () => {
      expect(allDefined(fixture.missingNestedObject?.blah?.blah)).eq(false)
    })
  })
})
