const API_BASE = 'http://localhost:8000'

export async function generateKeys() {
  try {
    const response = await fetch(`${API_BASE}/api/generate-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to generate keys')
    }
    
    return await response.json()
  } catch (error) {
    throw new Error(`Error generating keys: ${error.message}`)
  }
}

export async function signDocument(privateKey, document) {
  try {
    const response = await fetch(`${API_BASE}/api/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        private_key: privateKey,
        document: document,
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to sign document')
    }
    
    return await response.json()
  } catch (error) {
    throw new Error(`Error signing document: ${error.message}`)
  }
}

export async function verifyDocument(publicKey, document, signature) {
  try {
    const response = await fetch(`${API_BASE}/api/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_key: publicKey,
        document: document,
        signature: signature,
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to verify document')
    }
    
    return await response.json()
  } catch (error) {
    throw new Error(`Error verifying document: ${error.message}`)
  }
}
