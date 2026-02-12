const OAUTH2_ENCODE_KEY = 'thanks,pig4cloud'
const DEFAULT_CLIENT_ID = 'test'
const DEFAULT_CLIENT_SECRET = 'test'
const AES_BLOCK_SIZE = 16

function utf8ToBytes(input: string) {
  return new TextEncoder().encode(input)
}

function bytesToBase64(bytes: Uint8Array) {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  if (typeof uni !== 'undefined' && typeof uni.arrayBufferToBase64 === 'function') {
    return uni.arrayBufferToBase64(buffer)
  }

  if (typeof btoa === 'function') {
    let binary = ''
    bytes.forEach((item) => {
      binary += String.fromCharCode(item)
    })
    return btoa(binary)
  }

  throw new Error('当前环境不支持 Base64 编码')
}

function getCryptoSubtle() {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('当前环境不支持 WebCrypto，无法执行 AES 加密')
  }
  return crypto.subtle
}

async function aesBlockEncrypt(subtle: SubtleCrypto, key: CryptoKey, inputBlock: Uint8Array) {
  const output = await subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: new Uint8Array(AES_BLOCK_SIZE),
    },
    key,
    inputBlock,
  )
  return new Uint8Array(output).slice(0, AES_BLOCK_SIZE)
}

async function aes128CfbEncrypt(plain: Uint8Array, keyBytes: Uint8Array, ivBytes: Uint8Array) {
  const subtle = getCryptoSubtle()
  const key = await subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['encrypt'])
  const cipher = new Uint8Array(plain.length)
  let feedback = new Uint8Array(ivBytes)

  for (let offset = 0; offset < plain.length; offset += AES_BLOCK_SIZE) {
    const remaining = plain.length - offset
    const currentSize = Math.min(AES_BLOCK_SIZE, remaining)
    const stream = await aesBlockEncrypt(subtle, key, feedback)

    for (let i = 0; i < currentSize; i++) {
      cipher[offset + i] = plain[offset + i] ^ stream[i]
    }

    if (currentSize === AES_BLOCK_SIZE) {
      feedback = cipher.slice(offset, offset + AES_BLOCK_SIZE)
    }
  }

  return cipher
}

export async function encryptOAuth2Password(plainPassword: string) {
  const keyBytes = utf8ToBytes(OAUTH2_ENCODE_KEY)
  if (keyBytes.byteLength !== AES_BLOCK_SIZE) {
    throw new Error('encodeKey 长度必须是 16 字节（AES-128）')
  }

  const cipher = await aes128CfbEncrypt(utf8ToBytes(plainPassword), keyBytes, keyBytes)
  return bytesToBase64(cipher)
}

export function getOAuth2BasicAuthorization(clientId = DEFAULT_CLIENT_ID, clientSecret = DEFAULT_CLIENT_SECRET) {
  const raw = `${clientId}:${clientSecret}`
  return `Basic ${bytesToBase64(utf8ToBytes(raw))}`
}
