import {
  BASE_FEE,
  Horizon,
  Keypair,
  Memo,
  Networks,
  Operation,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk"

const DEFAULT_TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org"
const DEFAULT_PUBLIC_HORIZON_URL = "https://horizon.stellar.org"
const SUPPORTED_STELLAR_NETWORKS = "testnet, public/mainnet/pubnet, futurenet, or custom"
const TRACE_CV_ANCHOR_DATA_NAME = "tracecv:snapshot-hash"
const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/i

type StellarNetworkName = "public" | "testnet" | "futurenet" | "custom"

export type StellarAnchorReceipt = {
  hash: string
  transactionHash: string
  network: string
  explorerUrl: string | null
  verifiedAt: string
}

export function isStellarAnchoringConfigured() {
  return Boolean(
    process.env.STELLAR_SECRET_KEY?.trim() &&
      process.env.STELLAR_PUBLIC_KEY?.trim(),
  )
}

type StellarConfig = {
  network: StellarNetworkName
  networkPassphrase: string
  horizonUrl: string
  secretKey: string
  publicKey: string
}

function isUrlLike(value: string) {
  return /^https?:\/\//i.test(value)
}

function normalizeNetwork(value: string | undefined): StellarNetworkName {
  const trimmedValue = value?.trim()
  const normalizedValue = trimmedValue?.toLowerCase()

  if (!normalizedValue) {
    return "testnet"
  }

  if (isUrlLike(normalizedValue)) {
    throw new Error(
      `STELLAR_NETWORK must be one of ${SUPPORTED_STELLAR_NETWORKS}; received a URL. Use STELLAR_NETWORK=testnet and leave STELLAR_HORIZON_URL empty unless you are overriding it with a Horizon endpoint. https://soroban-testnet.stellar.org is a Soroban RPC endpoint, not a Horizon endpoint.`,
    )
  }

  if (normalizedValue === "testnet") {
    return "testnet"
  }

  if (
    normalizedValue === "public" ||
    normalizedValue === "mainnet" ||
    normalizedValue === "pubnet"
  ) {
    return "public"
  }

  if (normalizedValue === "futurenet") {
    return "futurenet"
  }

  if (normalizedValue === "custom") {
    return "custom"
  }

  throw new Error(
    `Unsupported STELLAR_NETWORK "${trimmedValue}". Use one of ${SUPPORTED_STELLAR_NETWORKS}.`,
  )
}

export function getConfiguredStellarNetworkName() {
  return normalizeNetwork(process.env.STELLAR_NETWORK)
}

export function getStellarNetworkDisplayName() {
  try {
    return getConfiguredStellarNetworkName()
  } catch {
    return process.env.STELLAR_NETWORK?.trim() || "testnet"
  }
}

function getNetworkPassphrase(network: StellarNetworkName) {
  if (network === "public") {
    return Networks.PUBLIC
  }

  if (network === "futurenet") {
    return Networks.FUTURENET
  }

  if (network === "custom") {
    const passphrase = process.env.STELLAR_NETWORK_PASSPHRASE?.trim()

    if (!passphrase) {
      throw new Error(
        "STELLAR_NETWORK_PASSPHRASE is required when STELLAR_NETWORK=custom.",
      )
    }

    return passphrase
  }

  return Networks.TESTNET
}

function getDefaultHorizonUrl(network: StellarNetworkName) {
  if (network === "public") {
    return DEFAULT_PUBLIC_HORIZON_URL
  }

  return DEFAULT_TESTNET_HORIZON_URL
}

function validateHorizonUrl(horizonUrl: string) {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(horizonUrl)
  } catch {
    throw new Error("STELLAR_HORIZON_URL must be a valid Horizon URL.")
  }

  if (parsedUrl.hostname.includes("soroban")) {
    throw new Error(
      `STELLAR_HORIZON_URL must point to a Horizon endpoint, not a Soroban RPC endpoint. For Stellar testnet use ${DEFAULT_TESTNET_HORIZON_URL}; do not use https://soroban-testnet.stellar.org.`,
    )
  }
}

function getStellarConfig(): StellarConfig {
  const network = getConfiguredStellarNetworkName()
  const secretKey = process.env.STELLAR_SECRET_KEY?.trim()

  if (!secretKey) {
    throw new Error(
      "STELLAR_SECRET_KEY is required to anchor snapshot hashes on Stellar.",
    )
  }

  const keypair = Keypair.fromSecret(secretKey)
  const derivedPublicKey = keypair.publicKey()
  const publicKey = process.env.STELLAR_PUBLIC_KEY?.trim() ?? derivedPublicKey

  if (!StrKey.isValidEd25519PublicKey(publicKey)) {
    throw new Error("STELLAR_PUBLIC_KEY must be a valid Stellar public key.")
  }

  if (publicKey !== derivedPublicKey) {
    throw new Error("STELLAR_PUBLIC_KEY does not match STELLAR_SECRET_KEY.")
  }

  const horizonUrl =
    process.env.STELLAR_HORIZON_URL?.trim() || getDefaultHorizonUrl(network)

  validateHorizonUrl(horizonUrl)

  return {
    network,
    networkPassphrase: getNetworkPassphrase(network),
    horizonUrl,
    secretKey,
    publicKey,
  }
}


function getErrorStatus(error: unknown) {
  const maybeError = error as {
    response?: { status?: number }
    status?: number
  }

  return maybeError.response?.status ?? maybeError.status ?? null
}

function getStellarErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Unknown Stellar error"
}

function toStellarAnchoringError(error: unknown, config: StellarConfig) {
  if (getErrorStatus(error) === 404) {
    return new Error(
      `Stellar account ${config.publicKey} was not found on ${config.network} Horizon (${config.horizonUrl}). Fund the account on the selected network and make sure STELLAR_NETWORK is set to a network name such as testnet, not a URL. For testnet Horizon, use ${DEFAULT_TESTNET_HORIZON_URL}; https://soroban-testnet.stellar.org is Soroban RPC and cannot be used as a Horizon URL.`,
    )
  }

  return new Error(`Stellar anchoring failed: ${getStellarErrorMessage(error)}`)
}

function validateSnapshotHash(hash: string) {
  if (!SHA256_HEX_PATTERN.test(hash)) {
    throw new Error("Snapshot hash must be a 64-character SHA-256 hex digest.")
  }
}

function buildExplorerUrl(
  network: StellarNetworkName,
  transactionHash: string,
) {
  if (network === "custom") {
    return null
  }

  return `https://stellar.expert/explorer/${network}/tx/${transactionHash}`
}

export async function anchorHashOnStellar(
  hash: string,
): Promise<StellarAnchorReceipt> {
  validateSnapshotHash(hash)

  const config = getStellarConfig()
  const hashBuffer = Buffer.from(hash, "hex")
  const keypair = Keypair.fromSecret(config.secretKey)
  const server = new Horizon.Server(config.horizonUrl)

  let account: Awaited<ReturnType<typeof server.loadAccount>>

  try {
    account = await server.loadAccount(config.publicKey)
  } catch (error) {
    throw toStellarAnchoringError(error, config)
  }

  const fee = await server.fetchBaseFee().catch(() => Number(BASE_FEE))
  const transaction = new TransactionBuilder(account, {
    fee: String(fee),
    networkPassphrase: config.networkPassphrase,
  })
    .addMemo(Memo.hash(hashBuffer))
    .addOperation(
      Operation.manageData({
        name: TRACE_CV_ANCHOR_DATA_NAME,
        value: hashBuffer,
      }),
    )
    .setTimeout(180)
    .build()

  transaction.sign(keypair)

  let submittedTransaction: Awaited<ReturnType<typeof server.submitTransaction>>

  try {
    submittedTransaction = await server.submitTransaction(transaction, {
      skipMemoRequiredCheck: true,
    })
  } catch (error) {
    throw toStellarAnchoringError(error, config)
  }

  const transactionHash = submittedTransaction.hash

  return {
    hash,
    transactionHash,
    network: config.network,
    explorerUrl: buildExplorerUrl(config.network, transactionHash),
    verifiedAt: new Date().toISOString(),
  }
}
