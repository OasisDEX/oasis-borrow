import type { GetYieldsResponseMapped } from 'helpers/lambda/yields'

export function has7daysYield(
  yields: GetYieldsResponseMapped,
): yields is Required<Pick<GetYieldsResponseMapped, 'apy1d' | 'apy7d'>> {
  return !!yields.apy7d
}

export function has90daysYield(
  yields: GetYieldsResponseMapped,
): yields is Required<Pick<GetYieldsResponseMapped, 'apy1d' | 'apy7d' | 'apy90d'>> {
  return !!yields.apy90d
}
