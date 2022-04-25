import { getNetworkId } from '@oasisdex/web3-context'
import { decode } from 'jsonwebtoken'
import getConfig from 'next/config'
import { Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { fromPromise } from 'rxjs/internal-compatibility'
import { map } from 'rxjs/operators'
import Web3 from 'web3'

const basePath = getConfig()?.publicRuntimeConfig.basePath || ''

export type JWToken = string

export function jwtAuthGetToken(address: string): JWToken | undefined {
  const token = localStorage.getItem(`token-b/${address}`)
  if (token && token !== 'xxx') {
    const parsedToken = JSON.parse(atob(token.split('.')[1]))
    // remove old tokens
    if (!parsedToken.chainId) {
      localStorage.removeItem(`token-b/${address}`)
      return undefined
    }
  }
  return token === null ? undefined : token
}

export function jwtAuthSetupToken$(
  web3: Web3,
  account: string,
  isGnosisSafe: boolean,
): Observable<JWToken> {
  const token = jwtAuthGetToken(account)
  if (token === undefined) {
    return fromPromise(requestJWT(web3, account, isGnosisSafe))
  }
  return of(token)
}

async function requestJWT(web3: Web3, account: string, isGnosisSafe: boolean): Promise<string> {
  const web3Instance = isGnosisSafe ? new Web3(web3.givenProvider) : web3
  const addressForSignature = isGnosisSafe ? web3Instance.givenProvider.selectedAddress : account
  const challenge = await requestChallenge(account).toPromise()

  console.log('Signing challenge: ', challenge)

  const chainId = getNetworkId()

  const signature = await signTypedPayload(challenge, web3Instance, addressForSignature)
  const jwt = await requestSignin({ challenge, signature, chainId }).toPromise()

  localStorage.setItem(`token-b/${account}`, jwt)

  return jwt
}

async function signTypedPayload(challenge: string, web3: Web3, account: string): Promise<string> {
  const data = getDataToSignFromChallenge(challenge)

  return web3.eth.personal.sign(data, account, '')
}

function requestChallenge(address: string): Observable<string> {
  return ajax({
    url: `/api/auth/challenge`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { address: address.toLowerCase() },
  }).pipe(map((resp) => resp.response.challenge))
}

function requestSignin({
  signature,
  challenge,
  chainId,
}: {
  signature: string
  challenge: string
  chainId: number
}): Observable<string> {
  return ajax({
    url: `${basePath}/api/auth/signin`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { signature, challenge, chainId },
  }).pipe(map((resp) => resp.response.jwt))
}

function getDataToSignFromChallenge(challenge: string): string {
  const decodedChallenge = decode(challenge) as any
  return `Sign to verify your wallet ${decodedChallenge.address} (${decodedChallenge.randomChallenge})`
}
