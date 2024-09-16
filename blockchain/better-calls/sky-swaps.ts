import type BigNumber from 'bignumber.js'
import { amountToWad } from 'blockchain/utils'
import { ethers } from 'ethers'
import { SkyDaiUsds__factory } from 'types/ethers-contracts'

export const skyDaiUsdsSwap = async ({
  token,
  amount,
  signer,
}: {
  token: 'DAI' | 'USDS'
  amount: BigNumber
  signer: ethers.Signer
}) => {
  const contract = SkyDaiUsds__factory.connect('0x3225737a9Bbb6473CB4a45b7244ACa2BeFdB276A', signer)
  const signerAddress = await signer.getAddress()
  const contractMethod = token === 'DAI' ? contract.daiToUsds : contract.usdsToDai
  return contractMethod(signerAddress, ethers.BigNumber.from(amountToWad(amount).toString()))
}
