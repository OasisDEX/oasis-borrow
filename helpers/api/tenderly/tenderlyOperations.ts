import axios from 'axios';
let latestFork : Fork | undefined = undefined;
const apiKey = process.env.TENDERLY_API_KEY;

export type Fork = {
  blockNumber: number;
  timestamp: number;
  uuid: string;
}

export async function createMainnetFork() : Promise<Fork> {
  const fork : Fork = {
    blockNumber: 0,
    timestamp: 0,
    uuid: "uuid",
  }
  latestFork = fork;

  return latestFork;
}

export async function deleteFork(_uuid: string) : Promise<void> {
  latestFork = undefined;

}

export async function getLatestFork() : Promise<Fork | undefined> {
  return latestFork;
}
