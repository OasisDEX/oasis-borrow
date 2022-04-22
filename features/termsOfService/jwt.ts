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
  return token === null ? undefined : token
}

export function jwtAuthSetupToken$(web3: Web3, account: string): Observable<JWToken> {
  const token = jwtAuthGetToken(account)
  if (token === undefined) {
    return fromPromise(requestJWT(web3, account))
  }
  return of(token)
}

async function requestJWT(web3: Web3, account: string): Promise<string> {
  const challenge = await requestChallenge(account).toPromise()

  console.log('Signing challenge: ', challenge)

  const signature = await signTypedPayload(challenge, web3, account)
  const jwt = await requestSignin({ challenge, signature }).toPromise()

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
}: {
  signature: string
  challenge: string
}): Observable<string> {
  return ajax({
    url: `${basePath}/api/auth/signin`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { signature, challenge },
  }).pipe(map((resp) => resp.response.jwt))
}

function getDataToSignFromChallenge(challenge: string): string {
  const decodedChallenge = decode(challenge) as any
  return `Sign to verify your wallet ${decodedChallenge.address} (${decodedChallenge.randomChallenge})`
}
