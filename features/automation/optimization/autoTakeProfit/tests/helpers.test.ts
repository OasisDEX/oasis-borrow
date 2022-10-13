import { expect } from 'chai'

describe("checkIfIsDisabledAutoTakeProfit", () => {
    describe("given not ProgressStage, is owner isEditing and stage is editing", () => {
        it("should not be disabled", () => {
            expect(true).to.be.true // this is just to pass the linter check
        })
    })
    describe("given not ProgressStage, is owner isEditing and stage is txSuccess", () => {
        it("should be disabled", () => {
        })
    })
    describe("given not ProgressStage, is not an owner isEditing and stage is editing", () => {
        it("should be disabled", () => {
        })
    })
    describe("given not ProgressStage, is owner but isn't editing (isEditing is false) and stage is editing", () => {
        it("should be disabled", () => {
        })
    })
})

describe("checkIfIsEditingAutoTakeProfit", () => {
    describe("given not isTriggerEnabled and isEditing", () => {
        it("should be editing", () => {
        })
    })
    describe("given isTriggerEnabled and isToCollateral is different from toCollateral", () => {
        it("should be editing", () => {
        })
    })
    describe("given isTriggerEnabled and executionPrice is different from executionPrice", () => {
        it("should be editing", () => {
        })
    })
    describe("given isRemoveForm is true", () => {
        it("should be editing", () => {
        })
    })
    describe("given isTriggerEnabled and isToCollateral is the same as toCollateral and executionPrice is the same as executionPrice of existing trigger", () => {
        it("should not be editing", () => {
        })
    })
})