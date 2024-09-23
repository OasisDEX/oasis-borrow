import BigNumber from 'bignumber.js'
import { mainnetContracts } from 'blockchain/contracts/mainnet'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { amountToWad } from 'blockchain/utils'
import { SECONDS_PER_YEAR } from 'components/constants'
import { ethers } from 'ethers'
import {
  SkyDaiUsds__factory,
  SkyMkrSky__factory,
  SkyStaking__factory,
  SkySusds__factory,
} from 'types/ethers-contracts'

const mkrSkySwapValue = 24 * 1000 // 1 MKR = 24000 SKY

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

export const skyUsdsStake = async ({
  action,
  amount,
  signer,
}: {
  action: 'stake' | 'unstake' | 'claim'
  amount: BigNumber
  signer: ethers.Signer
}) => {
  const skyStakingContract = new ethers.Contract(
    mainnetContracts.sky.staking.address,
    SkyStaking__factory.abi,
    signer,
  )
  if (action === 'stake') {
    return skyStakingContract['stake(uint256,uint16)'](
      ethers.BigNumber.from(amountToWad(amount).toString()),
      ethers.BigNumber.from(1001),
    )
  }
  return skyStakingContract['withdraw(uint256)'](
    ethers.BigNumber.from(amountToWad(amount).toString()),
  )
}

export const skyUsdsStakeGetRewards = async ({ signer }: { signer: ethers.Signer }) => {
  const skyStakingContract = new ethers.Contract(
    mainnetContracts.sky.staking.address,
    SkyStaking__factory.abi,
    signer,
  )
  return skyStakingContract['getReward()']()
}

export const skyUsdsWalletStakeDetails = async ({ ownerAddress }: { ownerAddress?: string }) => {
  const rpcProvider = getRpcProvider(NetworkIds.MAINNET)
  if (!ownerAddress) {
    return undefined
  }
  const skyStakingContract = new ethers.Contract(
    mainnetContracts.sky.staking.address,
    SkyStaking__factory.abi,
    rpcProvider,
  )
  const [balance, earned] = await Promise.all([
    skyStakingContract['balanceOf(address)'](ownerAddress).then(
      (tokensStaked: ethers.BigNumber) => {
        return new BigNumber(ethers.utils.formatUnits(tokensStaked, 18))
      },
    ),
    skyStakingContract['earned(address)'](ownerAddress).then(
      (skyTokensEarned: ethers.BigNumber) => {
        return new BigNumber(ethers.utils.formatUnits(skyTokensEarned, 18))
      },
    ),
  ])
  return { balance, earned } as {
    balance: BigNumber
    earned: BigNumber
  }
}

export const skyUsdsStakeDetails = async ({ mkrPrice }: { mkrPrice?: BigNumber }) => {
  if (!mkrPrice) {
    return {
      apy: new BigNumber(0),
      totalUSDSLocked: new BigNumber(0),
    }
  }
  const rpcProvider = getRpcProvider(1)
  const skyStakingContract = new ethers.Contract(
    mainnetContracts.sky.staking.address,
    SkyStaking__factory.abi,
    rpcProvider,
  )
  const skyPrice = mkrPrice.div(mkrSkySwapValue)
  const [rewardRate, totalUSDSLocked] = await Promise.all([
    skyStakingContract['rewardRate']().then((rewardPercentage: ethers.BigNumber) => {
      return new BigNumber(ethers.utils.formatUnits(rewardPercentage, 18))
    }),
    skyStakingContract['totalSupply']().then(
      (USDSLocked: ethers.BigNumber) => new BigNumber(ethers.utils.formatUnits(USDSLocked, 18)),
    ),
  ])
  const rewardsPerYear = rewardRate.times(SECONDS_PER_YEAR)
  const rewardsPerYearPrice = rewardsPerYear.times(skyPrice)
  const apy = rewardsPerYearPrice.div(totalUSDSLocked)
  return { apy, totalUSDSLocked } as {
    apy: BigNumber
    totalUSDSLocked: BigNumber
  }
}
