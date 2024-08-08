export const checkAuthFromApi = async (
  walletAddress: string,
): Promise<{ authenticated: boolean }> => {
  const res = await fetch(`/api/auth/check-auth?walletAddress=${walletAddress}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return res.json()
}
