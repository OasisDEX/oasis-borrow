interface ResolveIfCachedPositionParams<T> {
  cached: boolean
  cachedPosition?: T
  currentPosition: T
}

export function resolveIfCachedPosition<T extends Pick<T, 'position' | 'simulation'>>({
  cached,
  cachedPosition,
  currentPosition,
}: ResolveIfCachedPositionParams<T>) {
  return {
    positionData: cached && cachedPosition ? cachedPosition.position : currentPosition.position,
    simulationData:
      cached && cachedPosition ? cachedPosition.simulation : currentPosition.simulation,
  }
}
