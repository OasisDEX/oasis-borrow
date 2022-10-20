import { allDefined } from './allDefined'

describe('allDefined', () => {
  describe('basic cases', () => {
    it('returns true if all params are defined', () => {
      expect(allDefined(1, 2, 3)).toBe(true)
    })

    it('returns false if any param is undefined', () => {
      expect(allDefined(1, 2, undefined)).toBe(false)
    })

    it('returns false with one undefined param', () => {
      expect(allDefined(undefined)).toBe(false)
    })

    it('treats zero, string and null as defined', () => {
      expect(allDefined(0)).toBe(true)
      expect(allDefined('')).toBe(true)
      expect(allDefined(null)).toBe(true)
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
      expect(allDefined(fixture)).toBe(true)
    })

    it('should return true on exisitng object existing value', () => {
      expect(allDefined(fixture.nestedObject.value)).toBe(true)
    })

    it('should return false on existing object undefined value', () => {
      expect(allDefined(fixture.nestedObject.undef)).toBe(false)
    })

    it('should return false on existing object missing value', () => {
      expect(allDefined(fixture.nestedObject.missing)).toBe(false)
    })

    it('returns false on existing undefined object', () => {
      expect(allDefined(fixture.missingNestedObject)).toBe(false)
    })

    it("returns false on existing undefined object's prop", () => {
      expect(allDefined(fixture.missingNestedObject?.blah)).toBe(false)
    })

    it("returns false on existing undefined object's prop's prop", () => {
      expect(allDefined(fixture.missingNestedObject?.blah?.blah)).toBe(false)
    })
  })
})
