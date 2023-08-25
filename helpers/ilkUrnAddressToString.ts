export function ilkUrnAddressToString({
  ilk,
  urnAddress,
}: {
  ilk: string
  urnAddress: string
}): string {
  return `${ilk}-${urnAddress}`
}
