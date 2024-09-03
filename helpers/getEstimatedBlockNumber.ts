import type { Block } from '@ethersproject/providers'
import type { ethers } from 'ethers'

/**
 * Estimates the block number closest to a given target timestamp.
 *
 * This function estimates the Ethereum block number corresponding to a given timestamp.
 * It assumes an average block time of 12 seconds. The function fetches the most recent block,
 * calculates the difference in time from the target timestamp, and estimates the block number.
 * It then verifies the estimated block's timestamp and adjusts accordingly if needed.
 *
 * @param provider - An instance of an ethers.js provider used to interact with the Ethereum blockchain.
 * @param targetTimestamp - The Unix timestamp (in seconds) to find the corresponding block number.
 * @param _lastBlock - Optional: A pre-fetched block to avoid fetching the latest block again if already available.
 * @returns A promise that resolves to the estimated block number closest to the target timestamp.
 */
export async function getEstimatedBlockNumber(
  provider: ethers.providers.Provider,
  targetTimestamp: number,
  _lastBlock?: Block,
): Promise<number> {
  // Fetch the block corresponding to the last block number
  const lastBlock = _lastBlock || (await provider.getBlock('latest'))

  // If the target timestamp is in the future, return lastBlock
  if (targetTimestamp >= lastBlock.timestamp) {
    console.warn('The provided timestamp is in the future.')
    return lastBlock.number - 1
  }

  // Calculate the time difference in seconds
  const timeDifference = lastBlock.timestamp - targetTimestamp

  // Estimate how many blocks have been minted since the target timestamp
  const blockDifference = Math.floor(timeDifference / 12) // assuming 12 seconds per block

  // Estimate the target block number
  const estimatedBlockNumber = lastBlock.number - blockDifference

  // Fetch the block corresponding to the estimated block number to verify
  const estimatedBlock = await provider.getBlock(estimatedBlockNumber)

  // Ensure the estimated block's timestamp is not later than the target timestamp
  if (estimatedBlock.timestamp <= targetTimestamp) {
    return estimatedBlockNumber
  } else {
    // Adjust the block number downward by one if it's still in the future
    return estimatedBlockNumber - 1
  }
}

/**
 * Synchronously estimates the block number closest to a given target timestamp.
 *
 * This function estimates the Ethereum block number corresponding to a given timestamp.
 * It assumes an average block time of 12 seconds and synchronously estimates the block
 * number based on the provided last block and target timestamp.
 *
 * @param targetTimestamp - The Unix timestamp (in seconds) to find the corresponding block number.
 * @param lastBlock - The latest known block, which serves as the reference point for the estimation.
 * @returns The estimated block number closest to the target timestamp.
 */
export function getEstimatedBlockNumberSync(targetTimestamp: number, lastBlock: Block): number {
  // If the target timestamp is in the future, return lastBlock
  if (targetTimestamp >= lastBlock.timestamp) {
    console.warn('The provided timestamp is in the future.')
    return lastBlock.number - 1
  }

  // Calculate the time difference in seconds
  const timeDifference = lastBlock.timestamp - targetTimestamp

  // Estimate how many blocks have been minted since the target timestamp
  const blockDifference = Math.floor(timeDifference / 12) // assuming 12 seconds per block

  // Estimate the target block number
  return lastBlock.number - blockDifference
}
