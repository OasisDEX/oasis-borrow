import { isAddress } from 'ethers/lib/utils'

interface ValidateOraclessPayloadParams {
  collateralAddress: string
  poolAddress: string
  quoteAddress: string
}

export function validateOraclessPayload({
  collateralAddress,
  poolAddress,
  quoteAddress,
}: ValidateOraclessPayloadParams) {
  const errors: string[] = []

  if (!poolAddress && !collateralAddress && !quoteAddress)
    errors.push('Specify at least one of the addresses')
  if (poolAddress && !isAddress(poolAddress))
    errors.push('Pool address is not valid contract address.')
  if (collateralAddress && !isAddress(collateralAddress))
    errors.push('Collateral address is not valid contract address.')
  if (quoteAddress && !isAddress(quoteAddress))
    errors.push('Quote address is not valid contract address.')

  return errors
}
