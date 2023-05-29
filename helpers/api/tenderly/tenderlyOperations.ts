import axios from 'axios'
import { ethers } from 'ethers'
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

export async function topupAddress(address: string, amount: number): Promise<void> {
  const config = getConfig()
  const fork = await refreshFork(config);
  const rpcUrl = `https://rpc.tenderly.co/fork/${fork.uuid}`
  const provider = new ethers.providers.JsonRpcProvider( rpcUrl );
  await provider.send("tenderly_addBalance", [
    [address],
    //amount in wei will be added for all wallets
    ethers.utils.hexValue(ethers.utils.parseUnits(amount.toString(), "ether").toHexString()),
  ])
};

async function deleteFork(uuid: string, config: TenderlyConfig = defaultConfig): Promise<void> {
  if (latestFork) await deleteForkInternal(uuid, config)
  await prisma.rpcForks.delete({
    where: {
      uuid: uuid,
    },
  });
}

async function getLatestFork(): Promise<Fork | undefined> {
  if(latestFork) return latestFork;

  const forks = (await prisma.rpcForks.findMany({
    orderBy: {
      last_modified : 'desc',
    },
    take: 1
  })).map((fork) => ({
    blockNumber: fork.blocknumber,
    lastModified: fork.last_modified,
    uuid: fork.uuid,
  }));

  latestFork = forks[0];

  return forks[0];
}

async function saveLatestFork(fork: Fork): Promise<void> {
  await prisma.rpcForks.create({
    data: {
      uuid: fork.uuid,
      blocknumber: fork.blockNumber,
      last_modified: fork.lastModified,
    }
  });
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
  const response = await axios.post(
    `https://api.tenderly.co/api/v1/account/${config.tenderlyUser}/project/${config.tenderlyProject}/fork`,
    JSON.stringify({
      network_id: '1',
      chain_config: {
        chain_id: 1,
      },
    }),
    {
      headers: {
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
  if (currentTime - existingFork?.lastModified.getTime() > config.maxAgeInSeconds) {
    return true
  }
  return false
}
