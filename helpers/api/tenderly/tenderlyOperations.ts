import axios from 'axios'
import { ethers } from 'ethers'
import { throttle } from 'lodash'
import { prisma } from 'server/prisma'
let latestFork: Fork | undefined = undefined

export type Fork = {
  blockNumber: number
  lastModified: Date
  uuid: string
}

export type TenderlyConfig = {
  maxAgeInSeconds: number
  apiKey: string
  tenderlyUser: string
  tenderlyProject: string
}

export function getConfig(): TenderlyConfig {
  return {
    maxAgeInSeconds: 300,
    apiKey: process.env.TENDERLY_API_KEY || 'IMIdJzO8hb-pnl0DGgLzSK8hxtym7HrF',
    tenderlyUser: process.env.TENDERLY_USERNAME || '',
    tenderlyProject: process.env.TENDERLY_PROJECT || '',
  }
}

const defaultConfig: TenderlyConfig = getConfig()

export async function refreshFork(config: TenderlyConfig = defaultConfig): Promise<Fork> {
  console.log('refreshFork')
  return await refreshForkThrottled(config)
}

const refreshForkInternal = async (config: TenderlyConfig = defaultConfig): Promise<Fork> => {
  console.log('refreshForkInternal')
  const existingFork = await getLatestFork()
  if (!existingFork || isOverdue(existingFork, config)) {
    if (existingFork) {
      await deleteFork(existingFork.uuid)
    }
    const latestFork = await createForkInternal()
    await saveLatestFork(latestFork)
    return latestFork
  }
  return existingFork
}

const refreshForkThrottled = throttle(refreshForkInternal, (getConfig().maxAgeInSeconds / 2) * 1000)

export async function topupAddress(address: string, amount: number): Promise<void> {
  const config = getConfig()
  const fork = await refreshFork(config)
  const rpcUrl = `https://rpc.tenderly.co/fork/${fork.uuid}`
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  await provider.send('tenderly_addBalance', [
    [address],
    //amount in wei will be added for all wallets
    ethers.utils.hexValue(ethers.utils.parseUnits(amount.toString(), 'ether').toHexString()),
  ])
}

async function deleteFork(uuid: string, config: TenderlyConfig = defaultConfig): Promise<void> {
  console.log('deleting fork', uuid)
  if (latestFork) await deleteForkInternal(uuid, config)
  await prisma.rpcForks.delete({
    where: {
      uuid: uuid,
    },
  })
}

async function getLatestFork(): Promise<Fork | undefined> {
  if (latestFork) {
    console.log('getLatestFork cached', latestFork)
    return latestFork
  }

  const forks = (
    await prisma.rpcForks.findMany({
      orderBy: {
        last_modified: 'desc',
      },
      take: 1,
    })
  ).map((fork) => ({
    blockNumber: fork.blocknumber,
    lastModified: fork.last_modified,
    uuid: fork.uuid,
  }))

  console.log('getLatestFork number', forks.length)

  latestFork = forks[0]

  return forks[0]
}

async function saveLatestFork(fork: Fork): Promise<void> {
  console.log('saveLatestFork', fork)
  await prisma.rpcForks.create({
    data: {
      uuid: fork.uuid,
      blocknumber: fork.blockNumber,
      last_modified: fork.lastModified,
    },
  })
  latestFork = fork
}

async function deleteForkInternal(
  forkId: string,
  config: TenderlyConfig = defaultConfig,
): Promise<void> {
  await axios.delete(
    `https://api.tenderly.co/api/v1/account/${config.tenderlyUser}/project/${config.tenderlyProject}/fork/${forkId}`,
    {
      headers: {
        'X-Access-Key': config.apiKey as string,
      },
    },
  )
}

async function createForkInternal(config: TenderlyConfig = defaultConfig): Promise<Fork> {
  const url = `https://api.tenderly.co/api/v1/account/${config.tenderlyUser}/project/${config.tenderlyProject}/fork`
  console.log('creating fork', url)
  console.log('config', config)
  const response = await axios.post(
    url,
    {
      network_id: '1',
      chain_config: {
        chain_id: 1,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': config.apiKey as string,
      },
    },
  )

  return {
    uuid: (response.data as any).simulation_fork.id,
    blockNumber: (response.data as any).simulation_fork.block_number,
    lastModified: new Date(),
  }
}

function isOverdue(existingFork: Fork, config: TenderlyConfig): boolean {
  const currentTime = new Date().getTime()
  const lastModified = existingFork?.lastModified.getTime()
  console.log(
    'isOverdue',
    currentTime,
    lastModified,
    currentTime - lastModified,
    config.maxAgeInSeconds,
  )
  if (currentTime - lastModified > config.maxAgeInSeconds) {
    console.log('fork is overdue')
    return true
  }
  console.log('fork is not overdue')
  return false
}
