import { LendingProtocol } from 'lendingProtocols'

export const mapRaysProtocolToOmni = (raysProtocol: string) =>
  ({
    aave_v3: LendingProtocol.AaveV3,
    aave_v2: LendingProtocol.AaveV2,
    spark: LendingProtocol.SparkV3,
    morphoblue: LendingProtocol.MorphoBlue,
    erc4626: LendingProtocol.MorphoBlue,
    ajna: LendingProtocol.Ajna,
    maker: LendingProtocol.Maker,
  })[raysProtocol]
