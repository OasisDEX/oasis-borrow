import BigNumber from 'bignumber.js'
import dsProxyRegistryAbi from 'blockchain/abi/ds-proxy-registry.json'
import dsProxyAbi from 'blockchain/abi/ds-proxy.json'
import dssProxyActionsAbi from 'blockchain/abi/dss-proxy-actions.json'
import erc20Abi from 'blockchain/abi/erc20.json'
import getCdpsAbi from 'blockchain/abi/get-cdps.json'
import mcdCatAbi from 'blockchain/abi/mcd-cat.json'
import flipAbi from 'blockchain/abi/mcd-flip.json'
import joinDaiAbi from 'blockchain/abi/mcd-join-dai.json'
import osmAbi from 'blockchain/abi/mcd-osm.json'
import spotAbi from 'blockchain/abi/mcd-spot.json'
import vatAbi from 'blockchain/abi/vat.json'
import {
  CDP_MANAGER,
  GET_CDPS,
  MCD_CAT,
  MCD_DAI,
  MCD_JOIN_DAI,
  MCD_JOIN_ETH_A,
  MCD_JUG,
  MCD_SPOT,
  MCD_VAT,
  PIP_ETH,
  PROXY_ACTIONS,
  PROXY_REGISTRY,
} from 'blockchain/addresses/mainnet.json'
import { amountToWei } from 'blockchain/utils'
import { ethers } from 'ethers'
import _ from 'lodash'
import { assert } from 'ts-essentials'
import {
  Erc20,
  GetCdps,
  McdCat,
  McdFlip,
  McdJoinDai,
  McdOsm,
  McdSpot,
  Vat,
} from 'types/ethers-contracts'
import { DsProxy } from 'types/ethers-contracts/DsProxy'
import { DsProxyRegistry } from 'types/ethers-contracts/DsProxyRegistry'
import Web3 from 'web3'

BigNumber.config({ EXPONENTIAL_AT: 100000 })
const MCD_FLIP_ETH_A = '0xF32836B9E1f47a0515c6Ec431592D5EbC276407f'
const ILK = utf8ToBytes32('ETH-A')
const wad = new BigNumber(10).pow(18)
const ray = new BigNumber(10).pow(27)

function utf8ToBytes32(str: string): string {
  return Web3.utils.utf8ToHex(str).padEnd(66, '0')
}

async function getOrCreateProxy(
  provider: ethers.providers.JsonRpcProvider,
  signer: ethers.providers.JsonRpcSigner,
): Promise<string> {
  const address = await signer.getAddress()
  const dsProxyRegistry: DsProxyRegistry = new ethers.Contract(
    PROXY_REGISTRY,
    dsProxyRegistryAbi,
    provider,
  ).connect(signer) as any
  let proxyAddress = await dsProxyRegistry.proxies(address)
  if (proxyAddress === ethers.constants.AddressZero) {
    await (await dsProxyRegistry['build()']()).wait()
    proxyAddress = await dsProxyRegistry.proxies(address)
    assert(proxyAddress !== ethers.constants.AddressZero, 'Proxy not created')
  }
  return proxyAddress
}

interface CDP {
  id: number
  urn: string
  ilk: string
}

async function getLastCDP(
  provider: ethers.providers.JsonRpcProvider,
  signer: ethers.providers.JsonRpcSigner,
  proxyAddress: string,
): Promise<CDP> {
  const getCdps: GetCdps = new ethers.Contract(GET_CDPS, getCdpsAbi, provider).connect(
    signer,
  ) as any
  const { ids, urns, ilks } = await getCdps.getCdpsAsc(CDP_MANAGER, proxyAddress)
  const cdp: CDP | undefined = _.last(
    _.map((_.zip(ids, urns, ilks) as any) as [BigNumber, string, string][], (cdp) => ({
      id: cdp[0].toNumber(),
      urn: cdp[1],
      ilk: cdp[2],
    })),
  )
  if (_.isUndefined(cdp)) {
    throw new Error('No CDP available')
  }
  return cdp
}

async function openLockETHAndDraw(
  provider: ethers.providers.JsonRpcProvider,
  signer: ethers.providers.JsonRpcSigner,
  collateralAmount: BigNumber,
  generateAmount: BigNumber,
  proxyAddress: string,
): Promise<CDP> {
  const address = await signer.getAddress()

  const dssProxyActionsInterface = new ethers.utils.Interface(dssProxyActionsAbi)
  const proxyAction = dssProxyActionsInterface.encodeFunctionData('openLockETHAndDraw', [
    CDP_MANAGER,
    MCD_JUG,
    MCD_JOIN_ETH_A,
    MCD_JOIN_DAI,
    ILK,
    amountToWei(generateAmount, 'DAI').toFixed(0),
  ])
  const dsProxy: DsProxy = new ethers.Contract(proxyAddress, dsProxyAbi, provider).connect(
    signer,
  ) as any
  await (
    await dsProxy['execute(address,bytes)'](PROXY_ACTIONS, proxyAction, {
      value: amountToWei(collateralAmount, 'ETH').toFixed(0),
      from: address,
      gasLimit: 5000000,
    })
  ).wait()
  return await getLastCDP(provider, signer, proxyAddress)
}

async function getPriceData(
  provider: ethers.providers.JsonRpcProvider,
): Promise<{ curr: BigNumber; next: BigNumber; timestamp: number; hop: number }> {
  const osm: McdOsm = new ethers.Contract(PIP_ETH, osmAbi, provider) as any
  const [currPriceHex] = await osm.peek({ from: MCD_SPOT })
  const [nextPriceHex] = await osm.peep({ from: MCD_SPOT })
  const zzz = await osm.zzz({ from: MCD_SPOT })
  const hop = await osm.hop({ from: MCD_SPOT })
  const currPrice = Web3.utils.hexToNumberString(currPriceHex)
  const nextPrice = Web3.utils.hexToNumberString(nextPriceHex)
  return {
    curr: new BigNumber(currPrice).dividedBy(wad),
    next: new BigNumber(nextPrice).dividedBy(wad),
    timestamp: zzz.toNumber(),
    hop: hop,
  }
}

async function generateDaiForLiquidator(
  provider: ethers.providers.JsonRpcProvider,
  signer: ethers.providers.JsonRpcSigner,
): Promise<void> {
  const proxyAddress = await getOrCreateProxy(provider, signer)
  const collateralAmount = new BigNumber(100)
  const generateAmount = new BigNumber(20000)
  await openLockETHAndDraw(provider, signer, collateralAmount, generateAmount, proxyAddress)
}

async function joinDai(
  provider: ethers.providers.JsonRpcProvider,
  signer: ethers.providers.JsonRpcSigner,
  wad: BigNumber,
): Promise<void> {
  const address = await signer.getAddress()
  const dai: Erc20 = new ethers.Contract(MCD_DAI, erc20Abi, provider).connect(signer) as any
  const joinDai: McdJoinDai = new ethers.Contract(MCD_JOIN_DAI, joinDaiAbi, provider).connect(
    signer,
  ) as any

  await (await dai.approve(joinDai.address, wad.toString())).wait()
  await (await joinDai.join(address, wad.toString())).wait()
}

async function liquidateCDP(
  provider: ethers.providers.JsonRpcProvider,
  signer: ethers.providers.JsonRpcSigner,
  cdp: CDP,
): Promise<void> {
  const cat: McdCat = new ethers.Contract(MCD_CAT, mcdCatAbi, provider).connect(signer) as any
  // Start liquidation
  await (await cat['bite(bytes32,address)'](ILK, cdp.urn)).wait()

  const flipper: McdFlip = new ethers.Contract(MCD_FLIP_ETH_A, flipAbi, provider).connect(
    signer,
  ) as any
  const bidId = (await flipper['kicks()']()).toNumber()
  const bid = await flipper['bids(uint256)'](bidId)

  // We will open a CDP to get DAI to pay for collateral
  await generateDaiForLiquidator(provider, signer)
  const vat: Vat = new ethers.Contract(MCD_VAT, vatAbi, provider).connect(signer) as any
  // We need internal DAI, not external one so we join it in
  await joinDai(
    provider,
    signer,
    new BigNumber(bid.tab.toString())
      .dividedToIntegerBy(ray)
      .plus(1) /* this plus one is used instead of rounding up */,
  )
  // Allow flipper to spend our internal DAI
  await (await vat.hope(flipper.address)).wait()
  // Make a bid
  await (await flipper.tend(bidId, bid.lot, bid.tab)).wait()

  // Deacrease lot size to get some collateral back after auction
  const newLot = new BigNumber(bid.lot.toString()).multipliedBy(0.9)

  await (await flipper.dent(bidId, newLot.toString(), bid.tab)).wait()

  // Disallow flipper to spend our internal DAI
  await (await vat.nope(flipper.address)).wait()

  const timestamp = (await provider.getBlock('latest')).timestamp
  const FOUR_HOURS = 5 * 60 * 60
  await provider.send('evm_setNextBlockTimestamp', [timestamp + FOUR_HOURS])
  // Close the liquidation process
  await (await flipper.deal(bidId)).wait()
}

async function triggerPriceUpdate(
  provider: ethers.providers.JsonRpcProvider,
  signer: ethers.providers.JsonRpcSigner,
): Promise<void> {
  // Move time so that the price update is possible
  const { timestamp, hop } = await getPriceData(provider)
  await provider.send('evm_setNextBlockTimestamp', [timestamp + hop])

  const osm: McdOsm = new ethers.Contract(PIP_ETH, osmAbi, provider).connect(signer) as any
  await (await osm.poke()).wait()

  const mcdSpot: McdSpot = new ethers.Contract(MCD_SPOT, spotAbi, provider).connect(signer) as any
  await (await mcdSpot.poke(ILK)).wait()
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider()
  const [user, liquidator] = [provider.getSigner(0), provider.getSigner(1)]
  console.log(`User with CDPs ${await user.getAddress()}`)
  console.log(`Liquidator ${await liquidator.getAddress()}`)

  const { curr } = await getPriceData(provider)
  const userProxyAddress = await getOrCreateProxy(provider, user)
  const collateralAmount = new BigNumber(10) // 10 ETH
  const collateralAmountUSD = collateralAmount.multipliedBy(curr)
  const generateAmountUnsafe = collateralAmountUSD.dividedToIntegerBy(1.5) // 150%
  const generateAmountSafe = collateralAmountUSD.dividedToIntegerBy(2.5) // 250%

  const safe = await openLockETHAndDraw(
    provider,
    user,
    collateralAmount,
    generateAmountSafe,
    userProxyAddress,
  ) // CDP with 250% collateralization rate

  const unsafe = await openLockETHAndDraw(
    provider,
    user,
    collateralAmount,
    generateAmountUnsafe,
    userProxyAddress,
  ) // CDP with 150% collateralization rate. Can be liquidated on next price update when the rate drops to 146%

  const toLiquidate = await openLockETHAndDraw(
    provider,
    user,
    collateralAmount,
    generateAmountUnsafe,
    userProxyAddress,
  ) // CDP with 150% collateralization rate. Will be liquidated on next price update

  await triggerPriceUpdate(provider, liquidator)
  await liquidateCDP(provider, liquidator, toLiquidate)

  console.log('Safe CDP', safe.id)
  console.log('Unsafe CDP', unsafe.id)
  console.log('Liquidated CDP', toLiquidate.id)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
