import type BigNumber from 'bignumber.js'
import { mainnetContracts } from 'blockchain/contracts/mainnet'
import { amountToWad } from 'blockchain/utils'
import { ethers } from 'ethers'
import { SkyDaiUsds__factory, SkyMkrSky__factory, SkySusds__factory } from 'types/ethers-contracts'

export const skyDaiUsdsSwap = async ({
  token,
  amount,
  signer,
}: {
  token: string
  amount: BigNumber
  signer: ethers.Signer
}) => {
  const address = mainnetContracts.sky.daiusds.address
  const contract = SkyDaiUsds__factory.connect(address, signer)
  const signerAddress = await signer.getAddress()
  const contractMethod = token === 'DAI' ? contract.daiToUsds : contract.usdsToDai
  return contractMethod(signerAddress, ethers.BigNumber.from(amountToWad(amount).toString()))
}

export const skyMkrSkySwap = async ({
  token,
  amount,
  signer,
}: {
  token: string
  amount: BigNumber
  signer: ethers.Signer
}) => {
  const address = mainnetContracts.sky.mkrsky.address
  const contract = SkyMkrSky__factory.connect(address, signer)
  const signerAddress = await signer.getAddress()
  const contractMethod = token === 'MKR' ? contract.mkrToSky : contract.skyToMkr
  return contractMethod(signerAddress, ethers.BigNumber.from(amountToWad(amount).toString()))
}

export const skyUsdsSusdsVault = async ({
  token,
  amount,
  signer,
}: {
  token: string
  amount: BigNumber
  signer: ethers.Signer
}) => {
  const signerAddress = await signer.getAddress()
  const susdsVaultContract = new ethers.Contract(
    mainnetContracts.tokens.SUSDS.address,
    SkySusds__factory.abi,
    signer,
  )
  if (token === 'USDS') {
    return susdsVaultContract['deposit(uint256,address,uint16)'](
      ethers.BigNumber.from(amountToWad(amount).toString()),
      signerAddress,
      ethers.BigNumber.from(1001),
    )
  }
  return susdsVaultContract['withdraw(uint256,address,address)'](
    ethers.BigNumber.from(amountToWad(amount).toString()),
    signerAddress,
    signerAddress,
  )
}
