import { Network, Token } from 'shared/domain-types'
import { Address } from 'viem'

const tokenByAddress: Record<Address, Token> = {
  '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357': {
    address: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
    decimals: 18n,
    symbol: 'DAI',
  },
  '0x29f2D40B0605204364af54EC677bD022dA425d03': {
    address: '0x29f2D40B0605204364af54EC677bD022dA425d03',
    decimals: 8n,
    symbol: 'WBTC',
  },
  '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0': {
    address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
    decimals: 6n,
    symbol: 'USDT',
  },
  '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8': {
    address: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
    decimals: 6n,
    symbol: 'USDC',
  },
  '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a': {
    address: '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a',
    decimals: 18n,
    symbol: 'AAVE',
  },
  '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c': {
    address: '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c',
    decimals: 18n,
    symbol: 'WETH',
  },
  '0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5': {
    address: '0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5',
    decimals: 18n,
    symbol: 'LINK',
  },
}

export const createtokenService = (network: Network) => {
  const getTokenByAddress = (address: Address): Token => {
    const token = tokenByAddress[address]
    if (token == null) {
      throw Error(`Unknown token address on network: ${address}/${network}`)
    }
    return token
  }

  return {
    getTokenByAddress,
  }
}
