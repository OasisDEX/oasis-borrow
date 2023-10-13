const dotenv = require('dotenv')
const { mkdir, readdir, writeFile } = require('fs/promises')
const fetch = require('node-fetch')
const { join } = require('path')

dotenv.config({
  path: '.env',
})
dotenv.config({
  path: '.env.local',
})

const getConfig = async () => {
  const response = await fetch(process.env.CONFIG_URL)
  return await response.json()
}

// Helpers
const getTokenInterfaceName = (tokenName) => {
  return `${tokenName.charAt(0).toUpperCase()}${tokenName.slice(1)}`
}

/**
 * Generates TypeScript domain types from a given configuration object.
 *
 * @param {Object} configObject - The configuration object to generate types from.
 * @returns {string} The generated TypeScript types.
 */
const getDomainTypes = (configObject) => {
  try {
    const getRootInterface = () => {
      return `export interface DomainConfigType {
              tokens: Tokens;
              tokensByNetwork: TokensByNetwork;
              lendingProtocols: LendingProtocol;
              networks: Networks;
            }`
    }

    const getTokenInterfaces = (tokens) => {
      return Object.keys(tokens)
        .map(
          (token) =>
            `interface ${getTokenInterfaceName(
              token,
            )} {\n  symbol: TokensEnum.${token};\n  precision: number;\n}`,
        )
        .join('\n\n')
    }

    const getTokensEnum = (tokens) => {
      return `export enum TokensEnum {\n${Object.keys(tokens)
        .map((token) => `  ${token} = '${token}',`)
        .join('\n')}\n}`
    }

    const getTokensInterface = (tokens) => {
      return `interface Tokens {\n  ${Object.entries(tokens)
        .map(([tokenName]) => `${tokenName}: ${getTokenInterfaceName(tokenName)};`)
        .join('\n  ')}\n}`
    }

    const getTokensByNetworkInterface = (tokensByNetwork) => {
      const replacements = Object.keys(tokensByNetwork).map((network) => {
        const tokensForNetwork = tokensByNetwork[network]
        const tokenNamesTypeUnion = tokensForNetwork
          .map((tokenObj) =>
            Object.keys(tokenObj)
              .map((token) => `{${token}: ${getTokenInterfaceName(token)}}`)
              .join('; '),
          )
          .join(' | ')
        return `${network}: ${tokenNamesTypeUnion}[];`
      })
      return `interface TokensByNetwork {\n  ${replacements.join('\n  ')}\n}`
    }

    const getLendingProtocolsEnums = (lendingProtocols) => {
      const protocolNames = Object.keys(lendingProtocols)
      const protocolEnum = `export enum LendingProtocol {\n${protocolNames
        .map((key) => `  ${key.charAt(0).toUpperCase() + key.slice(1)} = '${key}',`)
        .join('\n')}\n}`
      const labelEnum = `export enum LendingProtocolLabel {\n${protocolNames
        .map((key) => `  ${key} = '${lendingProtocols[key]}',`)
        .join('\n')}\n}`
      return `${protocolEnum}\n\n${labelEnum}`
    }

    const getNetworksEnum = (networks) => {
      const enumEntries = Object.keys(networks)
        .map((networkName) => `  ${networkName.toUpperCase()} = '${networkName.toLowerCase()}',`)
        .join('\n')
      return `export enum Networks {\n${enumEntries}\n}`
    }

    const getDenominationSymbols = (denominationSymbols) => {
      const enumEntries = Object.keys(denominationSymbols)
        .map(
          (denominationSymbol) =>
            `  ${denominationSymbol.toUpperCase()} = '${denominationSymbol.toUpperCase()}',`,
        )
        .join('\n')
      return `export enum DenominationSymbols {\n${enumEntries}\n}`
    }

    // Construct the types for each section
    const rootSection = getRootInterface()
    const tokensSection = `${getTokensInterface(configObject.tokens)}\n\n${getTokensEnum(
      configObject.tokens,
    )}\n\n${getTokenInterfaces(configObject.tokens)}`
    const tokensByNetworkSection = getTokensByNetworkInterface(configObject.tokensByNetwork)
    const lendingProtocolsSection = getLendingProtocolsEnums(configObject.lendingProtocols)
    const networksSection = getNetworksEnum(configObject.networks)
    const denominationSymbolsSection = getDenominationSymbols(configObject.denominationSymbols)

    // Assemble the final types
    const types = [
      rootSection,
      tokensSection,
      tokensByNetworkSection,
      lendingProtocolsSection,
      networksSection,
      denominationSymbolsSection,
    ].join('\n\n')

    return types
  } catch (error) {
    console.error(`Error generating config types: ${error}`)
    return ''
  }
}

const main = async () => {
  if (!process.env.CONFIG_URL) {
    console.error('CONFIG_URL environment variable not set')
    return
  }
  const config = await getConfig()
  const types = getDomainTypes(config)
  const configPath = join(__dirname, 'types')
  const configPathExists = await readdir(configPath).catch(() => false)

  if (!configPathExists) {
    await mkdir(configPath)
      .catch(() => {
        console.error('Error creating types/config directory')
      })
      .then(() => {
        console.info(`${configPath} directory created`)
      })
  }

  if (types !== '') {
    writeFile(join(configPath, 'index.ts'), types)
      .then(() => {
        console.info('Config types generated')
      })
      .catch((error) => {
        console.error(`Error generating config types: ${error}`)
      })
  }
}

module.export = { generateDomainConfigTypes: main }
