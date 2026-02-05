export type SiweChallengeRequest = {
  address: string
}

export type SiweChallengeResponse = {
  nonce: string
  issued_at: string
  expiration_time: string
}

export type SiweVerifyRequest = {
  payload: {
    message: string
    signature: string
  }
  nonce: string
}

export type SiweVerifyResponse = {
  address: string
  bound: boolean
  idempotent?: boolean
}

export type WalletsResponse = {
  wallets: Array<{
    address: string
    chain: string
    verified_at: string
    verification_method: string
  }>
}
