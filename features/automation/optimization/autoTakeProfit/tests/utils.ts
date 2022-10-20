import BigNumber from "bignumber.js";
import { Vault } from "blockchain/vaults";
import { v4 } from 'uuid';

export function generateRandomBigNumber() {
    return new BigNumber(Math.random())
}

export function generateRandomString(type: 'standard' | 'address') {
    switch (type) {
        case 'address':
            return `0x00${v4().replaceAll('-', '')}`
        default:
            return v4().replaceAll('-', '')
    }
}

interface MockVaultOptions {
    atRiskLevelWarning?: boolean
    atRiskLevelDanger?: boolean
    underCollateralized?: boolean
    atRiskLevelWarningAtNextPrice?: boolean
    atRiskLevelDangerAtNextPrice?: boolean
    underCollateralizedAtNextPrice?: boolean
}

export function createMockVault(options: MockVaultOptions): Vault {
    return {
        makerType: 'STANDARD',
        id: generateRandomBigNumber(),
        owner: generateRandomString('address'),
        controller: '',
        token: '',
        ilk: generateRandomString('standard'),
        address: generateRandomString('address'),
        lockedCollateral: generateRandomBigNumber(),
        unlockedCollateral: generateRandomBigNumber(),
        lockedCollateralUSD: generateRandomBigNumber(),
        lockedCollateralUSDAtNextPrice: generateRandomBigNumber(),
        backingCollateral: generateRandomBigNumber(),
        backingCollateralAtNextPrice: generateRandomBigNumber(),
        backingCollateralUSD: generateRandomBigNumber(),
        backingCollateralUSDAtNextPrice: generateRandomBigNumber(),
        freeCollateral: generateRandomBigNumber(),
        freeCollateralAtNextPrice: generateRandomBigNumber(),
        freeCollateralUSD: generateRandomBigNumber(),
        freeCollateralUSDAtNextPrice: generateRandomBigNumber(),
        debt: generateRandomBigNumber(),
        debtOffset: generateRandomBigNumber(),
        normalizedDebt: generateRandomBigNumber(),
        availableDebt: generateRandomBigNumber(),
        availableDebtAtNextPrice: generateRandomBigNumber(),
        collateralizationRatio: generateRandomBigNumber(),
        collateralizationRatioAtNextPrice: generateRandomBigNumber(),
        liquidationPrice: generateRandomBigNumber(),
        daiYieldFromLockedCollateral: generateRandomBigNumber(),

        atRiskLevelWarning: options.atRiskLevelWarning || false,
        atRiskLevelDanger: options.atRiskLevelDanger || false,
        underCollateralized: options.underCollateralized || false,
      
        atRiskLevelWarningAtNextPrice: options.atRiskLevelWarningAtNextPrice || false,
        atRiskLevelDangerAtNextPrice: options.atRiskLevelDangerAtNextPrice || false,
        underCollateralizedAtNextPrice: options.underCollateralizedAtNextPrice || false,
        chainId: 5
    } as Vault
}