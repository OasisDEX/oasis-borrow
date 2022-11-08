export enum VaultProtocol {
  Maker,
  Aave,
}

// TODO: decide what parameters are needed to check vault protocol and write function body
// is this going to be just based on url? or GeneralManageVaultState?

export function getVaultProtocol() {
  return VaultProtocol.Maker
}
