describe('autoTakeProfitFormChangeReducer', () => {
  it('should modify toCollateral state property on close-type event', () => {})//TODO: this is in more than one file, should be extracted
  it('should not change unrelated properties on close-type event', () => {})//TODO: this is in more than one file, should be extracted
  it('should modify executionPrice & executionCollRatio state properties on execution-price event', () => {})
  it('should not change unrelated properties on execution-price event', () => {})
  it('should modify currentForm state property on current-form event', () => {})//TODO: this is in more than one file, should be extracted
  it('should not change unrelated properties on current-form event', () => {})
  describe('form-defaults event', () => {
    it('should set defaultExecutionPrice', () => {})
    it('should set defaultExecutionCollRatio', () => {})
    it('should set executionPrice', () => {})
    it('should set executionCollRatio', () => {})
    it('should set toCollateral', () => {})
    it('should not change unrelated properties on form-defaults event', () => {})
  });
  describe('reset event', () => {
    it('should set executionPrice', () => {})
    it('should set executionCollRatio', () => {})
    it('should set toCollateral', () => {})
    it('should set isEditing', () => {})
    it('should set txDetails', () => {})
    it('should not change unrelated properties on reset event', () => {})
  });
  it('should modify toCollateral state property on is-editing event', () => {})//TODO: this is in more than one file, should be extracted
  it('should not change unrelated properties on is-editing event', () => {})
  it('should modify txDetails state property on tx-details event', () => {})
  it('should not change unrelated properties on tx-details event', () => {})
  it('should not change any properties on invalid action type', () => {})
})
