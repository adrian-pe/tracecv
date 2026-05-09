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

type StellarConfig = {
  network: StellarNetworkName
  networkPassphrase: string
  horizonUrl: string
  secretKey: string
  publicKey: string
}

function normalizeNetwork(value: string | undefined): StellarNetworkName {
  const normalizedValue = value?.trim().toLowerCase()

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

  return "testnet"
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

function getStellarConfig(): StellarConfig {
  const network = normalizeNetwork(process.env.STELLAR_NETWORK)
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

  return {
    network,
    networkPassphrase: getNetworkPassphrase(network),
    horizonUrl:
      process.env.STELLAR_HORIZON_URL?.trim() || getDefaultHorizonUrl(network),
    secretKey,
    publicKey,
  }
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
  const account = await server.loadAccount(config.publicKey)
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

  const submittedTransaction = await server.submitTransaction(transaction, {
    skipMemoRequiredCheck: true,
  })
  const transactionHash = submittedTransaction.hash

  return {
    hash,
    transactionHash,
    network: config.network,
    explorerUrl: buildExplorerUrl(config.network, transactionHash),
    verifiedAt: new Date().toISOString(),
  }
}
