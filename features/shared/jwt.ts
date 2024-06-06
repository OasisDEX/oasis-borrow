import type { SignMessageResponse } from '@safe-global/safe-apps-sdk'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { decode } from 'jsonwebtoken'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { fromPromise } from 'rxjs/internal-compatibility'
import { map } from 'rxjs/operators'
import type Web3 from 'web3'

const LOCAL_STORAGE_GNOSIS_SAFE_PENDING = 'gnosis-safe-pending'

export type JWToken = string
// return 'invalid' if we have forced the removal of the token again
export function jwtAuthGetToken(address: string): JWToken | undefined | 'invalid' {
  const token = Object.entries(localStorage).find(
    ([key]) => key.toLowerCase() === `token-b/${address}`.toLowerCase(),
  )?.[1]
  if (token && token !== 'xxx') {
    const parsedToken = JSON.parse(atob(token.split('.')[1]))

    // remove old tokens moved to termsAcceptance.ts
    if (!parsedToken.chainId) {
      return 'invalid'
    }
  }
  return token === null ? undefined : token
}

export function jwtAuthSetupToken$(
  web3: Web3,
  chainId: number,
  account: string,
  isGnosisSafe: boolean,
): Observable<JWToken> {
  const token = jwtAuthGetToken(account)
  if (token === 'invalid') {
    return of('invalid')
  }
  if (token === undefined) {
    return fromPromise(requestJWT(web3, chainId, account, isGnosisSafe))
  }
  return of(token)
}

interface GnosisSafeSignInDetails {
  messageHash: string
  challenge: string
}

interface GnosisSafeSignInDetailsWithData extends GnosisSafeSignInDetails {
  dataToSign: string
}

async function getGnosisSafeDetails(
  sdk: SafeAppsSDK,
  chainId: number,
  account: string,
  newChallenge: string,
): Promise<GnosisSafeSignInDetailsWithData> {
  const key = `${LOCAL_STORAGE_GNOSIS_SAFE_PENDING}/${chainId}-${account}`
  const pendingSignature: GnosisSafeSignInDetails = JSON.parse(localStorage.getItem(key)!)

  if (pendingSignature) {
    const exp = (decode(pendingSignature.challenge) as any)?.exp
    if (exp && exp * 1000 >= Date.now()) {
      return {
        ...pendingSignature,
        dataToSign: getDataToSignFromChallenge(pendingSignature.challenge),
      }
    }
  }

  const dataToSign = getDataToSignFromChallenge(newChallenge)
  const res = (await sdk.txs.signMessage(dataToSign)) as SignMessageResponse
  let messageHash: string | undefined
  if ('messageHash' in res) {
    messageHash = res.messageHash
  } else if ('safeTxHash' in res) {
    throw new Error('Please upgrade your SAFE')
  } else {
    throw new Error('Unexpected response type')
  }

  localStorage.setItem(
    key,
    JSON.stringify({
      messageHash,
      challenge: newChallenge,
    } as GnosisSafeSignInDetails),
  )
  return { challenge: newChallenge, messageHash, dataToSign }
}

async function requestJWT(
  web3: Web3,
  chainId: number,
  account: string,
  isGnosisSafe: boolean,
): Promise<string> {
  const web3Instance = web3
  const addressForSignature = account

  const challenge = await requestChallenge(account, isGnosisSafe).toPromise()

  if (isGnosisSafe) {
    const sdk = new SafeAppsSDK()

    const {
      challenge: gnosisSafeChallenge,
      messageHash,
      dataToSign,
    } = await getGnosisSafeDetails(sdk, chainId, account, challenge)

    // start polling
    const token = await new Promise<string | null>((resolve) => {
      let returnValue = (val: string | null) => resolve(val) // CAUTION: this function is reassigned later
      const interval = setInterval(async () => {
        if (messageHash) {
          try {
            const isSigned = await sdk.safe.isMessageSigned(dataToSign)
            if (!isSigned) {
              throw new Error('Not signed yet')
            }
            const offchainSignature = await sdk.safe.getOffChainSignature(messageHash)
            if (!offchainSignature) {
              throw new Error('GS: not ready')
            }
            const safeJwt = await requestSignin({
              challenge: gnosisSafeChallenge,
              signature: offchainSignature,
              chainId,
              isGnosisSafe: true,
            }).toPromise()

            return returnValue(safeJwt)
          } catch (error) {
            console.error('GS: error occurred', error)
          }
        }
      }, 5 * 1000)

      // clear all scheduled callbacks
      returnValue = (val: string | null) => {
        clearInterval(interval)
        resolve(val)
      }
    })

    if (!token) {
      throw new Error(`GS: failed to sign`)
    }

    localStorage.setItem(`token-b/${account}`, token)
    return token
  }

  const signature = await signTypedPayload(challenge, web3Instance, addressForSignature)
  const jwt = await requestSignin({
    challenge,
    signature,
    chainId,
    isGnosisSafe: false,
  }).toPromise()

  localStorage.setItem(`token-b/${account}`, jwt)

  return jwt
}

async function signTypedPayload(challenge: string, web3: Web3, account: string): Promise<string> {
  const data = getDataToSignFromChallenge(challenge)

  return web3.eth.personal.sign(data, account, '')
}

function requestChallenge(address: string, isGnosisSafe: boolean): Observable<string> {
  return ajax({
    url: `/api/auth/challenge`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { address: address.toLowerCase(), isGnosisSafe },
  }).pipe(map((resp) => resp.response.challenge))
}

function requestSignin({
  signature,
  challenge,
  chainId,
  isGnosisSafe,
}: {
  signature: string
  challenge: string
  chainId: number
  isGnosisSafe: boolean
}): Observable<string> {
  return ajax({
    url: `/api/auth/signin`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { signature, challenge, chainId, isGnosisSafe },
  }).pipe(map((resp) => resp.response.jwt))
}

function getDataToSignFromChallenge(challenge: string): string {
  const decodedChallenge = decode(challenge) as any
  return `Sign to verify your wallet ${decodedChallenge.address} (${decodedChallenge.randomChallenge})`
}
