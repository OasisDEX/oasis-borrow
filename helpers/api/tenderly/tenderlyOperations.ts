import axios from 'axios';
let latestFork : Fork | undefined = undefined;

export type Fork = {
  blockNumber: number;
  timestamp: number;
  uuid: string;
}

export type TenderlyConfig = {
  maxAgeInSeconds: number,
  apiKey: string,
  tenderlyUser: string,
  tenderlyProject: string
}

export function getConfig() : TenderlyConfig {
  return {
    maxAgeInSeconds: 300,
    apiKey : process.env.TENDERLY_API_KEY || "IMIdJzO8hb-pnl0DGgLzSK8hxtym7HrF",
    tenderlyUser : process.env.TENDERLY_USERNAME || "",
    tenderlyProject : process.env.TENDERLY_PROJECT || "",
  }
}

const defaultConfig : TenderlyConfig = getConfig();

export async function refreshFork(config : TenderlyConfig = defaultConfig) : Promise<Fork> {
  const existingFork = await getLatestFork();
  if(!existingFork || isOverdue(existingFork, config)){
    if(existingFork){
      await deleteFork(existingFork.uuid);
    }
    const latestFork = await createForkInternal();
    await updateLatestFork(latestFork);
    return latestFork;
  }
  return existingFork;

}

async function deleteFork(uuid : string ,config : TenderlyConfig = defaultConfig) : Promise<void> {
  if(latestFork)
    await deleteForkInternal(uuid, config);
  latestFork = undefined;

}

async function getLatestFork() : Promise<Fork | undefined> {
  return latestFork;
}

async function updateLatestFork(fork : Fork) : Promise<void> {
  latestFork = fork;
}

async function deleteForkInternal(forkId : string, config : TenderlyConfig = defaultConfig) : Promise<void> {
  await axios.delete(
    `https://api.tenderly.co/api/v1/account/${config.tenderlyUser}/project/${config.tenderlyProject}/fork/${forkId}`,
    {
      headers: {
        'X-Access-Key': config.apiKey as string,
      },
    }
  );
}

async function createForkInternal(config : TenderlyConfig = defaultConfig) : Promise<Fork> {
  const response = await axios.post(
    `https://api.tenderly.co/api/v1/account/${config.tenderlyUser}/project/${config.tenderlyProject}/fork`,
    JSON.stringify({
      network_id: '1',
      chain_config: {
        chain_id: 1
      },
    }),
    {
      headers: {
        'X-Access-Key': config.apiKey as string,
      },
    }
  );

  return {
    uuid: (response.data as any).simulation_fork.id,
    blockNumber:(response.data as any).simulation_fork.block_number,
    timestamp:(new Date()).getTime(),
  }
}

function isOverdue(existingFork: Fork, config: TenderlyConfig) : boolean {
  const currentTime = (new Date()).getTime();
  if(currentTime - existingFork?.timestamp > config.maxAgeInSeconds){
    return true;
  }
  return false;
}
