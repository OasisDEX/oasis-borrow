import { decodeBitmapToAssetsAddresses } from './decodeBitmapToAssetsAddresses'

describe('decodeBitmapToAssetsAddresses', () => {
  it('should decode the bitmap to asset addresses correctly', () => {
    const userConfigData = 8346n
    const reservesList = [
      '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
      '0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5',
      '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
      '0x29f2D40B0605204364af54EC677bD022dA425d03',
      '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c',
      '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
      '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a',
      '0x6d906e526a4e2Ca02097BA9d0caA3c382F52278E',
    ] as const

    const result = decodeBitmapToAssetsAddresses(userConfigData, reservesList)

    expect(result).toEqual({
      collAssetsAddresses: [
        '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
        '0x29f2D40B0605204364af54EC677bD022dA425d03',
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a',
      ],
      debtAssetsAddresses: ['0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c'],
    })
  })
})
