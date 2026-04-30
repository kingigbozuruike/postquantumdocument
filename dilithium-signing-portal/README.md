# Quantum-Safe Signing Portal

A modern web application demonstrating post-quantum cryptography using CRYSTALS-Dilithium (ML-DSA-65). This portal enables users to generate quantum-resistant key pairs, digitally sign documents, and verify signatures using NIST-standardized algorithms that will remain secure even after quantum computers become powerful enough to break classical cryptography.

## Project Description

This Quantum-Safe Signing Portal showcases the practical implementation of post-quantum cryptography for modern security. Unlike RSA and ECDSA schemes that are vulnerable to Shor's algorithm on quantum computers, Dilithium-based signatures rely on the hardness of lattice problems—which are believed to be resistant even to quantum attacks. The application provides an intuitive interface to generate cryptographic keys, sign documents, and verify signatures with built-in educational content explaining why quantum-safe cryptography is essential.

## Tech Stack

### Backend
- **Framework:** FastAPI 0.104.1
- **Server:** Uvicorn 0.24.0
- **Cryptography:** liboqs-python 0.14.1 (Python bindings for liboqs C library)
- **Data Validation:** Pydantic 2.5.0
- **Language:** Python 3.12
- **Algorithm:** ML-DSA-65 (NIST FIPS 204 standard, Dilithium3 equivalent)

### Frontend
- **UI Framework:** React 19.2.4
- **Build Tool:** Vite 5.0.8
- **Styling:** Tailwind CSS 3.4.0
- **Language:** JavaScript (ES modules)
- **Node.js:** 20.18.1+

### Post-Quantum Cryptography
- **Library:** liboqs 0.15.0 (C library implementing NIST post-quantum standards)
- **Algorithm:** ML-DSA-65 (CRYSTALS-Dilithium)
- **Standard:** NIST FIPS 204 (2024)

## Installation

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd dilithium-signing-portal/backend
   ```

2. **Create and activate Python virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # macOS/Linux
   # or: venv\Scripts\activate  # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Build liboqs (if not already installed):**
   
   The application requires the liboqs C library. If you encounter "No oqs shared libraries found" errors:
   
   ```bash
   # macOS/Linux:
   # Install liboqs from source (requires CMAKE)
   brew install cmake pkg-config
   cd /tmp
   git clone https://github.com/open-quantum-safe/liboqs.git
   cd liboqs
   mkdir build && cd build
   cmake -DCMAKE_INSTALL_PREFIX=$VIRTUAL_ENV ..
   make -j$(nproc)
   make install
   
   # Set library path in activation script:
   echo "export DYLD_LIBRARY_PATH=$VIRTUAL_ENV/lib:\$DYLD_LIBRARY_PATH" >> ../venv/bin/activate
   source ../venv/bin/activate
   ```

5. **Run the backend server:**
   ```bash
   python main.py
   ```
   
   The server will start on **http://localhost:8000**

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd dilithium-signing-portal/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at **http://localhost:5173**

## Running the Application

### Start Backend (Terminal 1)
```bash
cd dilithium-signing-portal/backend
source venv/bin/activate  # Activate virtual environment
python main.py
# Expected output: "Uvicorn running on http://127.0.0.1:8000"
```

### Start Frontend (Terminal 2)
```bash
cd dilithium-signing-portal/frontend
npm run dev
# Expected output: "Local: http://localhost:5173/"
```

### Access the Application
Open your browser to **http://localhost:5173**

## Usage Guide

### Step 1: Generate Keys
- Click **"Generate Key Pair"** to create a new ML-DSA-65 key pair
- Public key is shared; private key is kept secret
- Keys are displayed in hex format and can be copied to clipboard

### Step 2: Sign Document
- Enter or upload a document
- Use your private key to create a digital signature
- The signature is generated using post-quantum cryptography
- View the signature byte preview to visualize the signature pattern

### Step 3: Verify Document
- Provide the original document, signature, and public key
- Click **"Verify Signature"** to check authenticity
- Use the tamper simulator to demonstrate how tampering invalidates signatures

## Understanding CRYSTALS-Dilithium

**CRYSTALS-Dilithium** (formally ML-DSA per NIST FIPS 204) is a post-quantum digital signature algorithm based on lattice problems. Unlike classical signatures (RSA, ECDSA) that rely on the difficulty of factoring large numbers or solving discrete logarithms—which quantum computers can solve efficiently using Shor's algorithm—Dilithium signatures rely on the hardness of lattice-based problems. These problems are believed to be computationally hard even for quantum computers. Dilithium was selected by NIST in 2022 and standardized in FIPS 204 (2024) as the primary post-quantum digital signature algorithm for government and enterprise use.

### Key Characteristics:
- **Key Size:** Public keys are ~1,952 bytes (larger than classical schemes)
- **Signature Size:** ~3,293 bytes (larger than ECDSA/RSA but manageable)
- **Security Level:** 256-bit post-quantum security
- **Performance:** Fast key generation and signing operations
- **Quantum Resistance:** Secure against known quantum attacks

## API Endpoints

### POST `/api/generate-keys`
Generate a new ML-DSA-65 key pair.

**Response:**
```json
{
  "public_key": "hex_string...",
  "private_key": "hex_string..."
}
```

### POST `/api/sign`
Sign a document with a private key.

**Request:**
```json
{
  "private_key": "hex_string...",
  "document": "text to sign"
}
```

**Response:**
```json
{
  "signature": "hex_string...",
  "document": "text to sign"
}
```

### POST `/api/verify`
Verify a document signature.

**Request:**
```json
{
  "public_key": "hex_string...",
  "document": "text to verify",
  "signature": "hex_string..."
}
```

**Response:**
```json
{
  "valid": true/false,
  "message": "Signature is valid" / "Signature verification failed"
}
```

## Features

✅ **Post-Quantum Cryptography:** ML-DSA-65 (NIST FIPS 204 standard)
✅ **Key Generation:** Create secure quantum-resistant key pairs
✅ **Document Signing:** Sign any text document with digital signatures
✅ **Signature Verification:** Verify document authenticity and integrity
✅ **Tamper Detection:** Built-in tamper simulator to demonstrate signature sensitivity
✅ **Signature Visualization:** 8×8 byte preview grid showing signature patterns
✅ **Step Progress Indicator:** Track completion through the workflow
✅ **Empty State Guidance:** Helpful messages guiding users through steps
✅ **Comprehensive Error Handling:** Clear error messages for all API failures
✅ **Educational Content:** Detailed explanations and comparison tables
✅ **Copy to Clipboard:** Easy sharing of keys and signatures
✅ **File Upload:** Sign documents from .txt, .doc, .docx, .pdf files
✅ **Responsive Design:** Works on desktop and tablet browsers

## Architecture

### Frontend Architecture
```
src/
├── App.jsx                  # Main component with state management
├── api.js                   # Backend API client functions
├── components/
│   ├── GenerateKeys.jsx    # Key pair generation interface
│   ├── SignDocument.jsx     # Document signing interface
│   ├── VerifyDocument.jsx   # Signature verification interface
│   ├── SignatureBytePreview.jsx  # Visual signature pattern display
│   ├── WhyPostQuantum.jsx   # Educational panel with comparison table
│   └── StepProgress.jsx     # Progress indicator component
├── App.css                  # Application styles
└── index.css               # Global Tailwind directives
```

### Backend Architecture
```
backend/
├── main.py        # FastAPI application with route handlers
├── crypto.py      # Cryptographic functions (generate, sign, verify)
└── requirements.txt
```

## Security Considerations

⚠️ **Important:** This is an educational demo. For production use:

1. **Private Key Storage:** Never share private keys. In production, use hardware security modules (HSMs) or secure key management systems (KMS).

2. **Signature Verification:** Always verify signatures using trusted public keys. Never download public keys from untrusted sources.

3. **Document Integrity:** Ensure documents are transmitted securely and haven't been modified during transit.

4. **Key Rotation:** Periodically rotate keys and securely delete old private keys.

5. **HTTPS:** Deploy with HTTPS/TLS in production environments.

6. **CORS:** Configure CORS properly for production deployments (currently set to localhost:5173).

## Troubleshooting

### Backend Issues

**Error: "No oqs shared libraries found"**
- Solution: Install liboqs from source (see Backend Setup section)
- Set DYLD_LIBRARY_PATH in venv activation script

**Error: "Module liboqs_python not found"**
- Solution: `pip install liboqs-python`
- Note: Version mismatch warnings between liboqs-python and liboqs are normal

**CORS Errors in Frontend**
- Solution: Ensure backend is running on http://localhost:8000
- Update CORS configuration in main.py if needed

### Frontend Issues

**Error: "Vite requires Node.js version 20.19+"**
- Solution: Update Node.js or downgrade Vite to version 5.0.8
- Current setup uses Vite 5.0.8 with Node 20.18.1

**Module not defined error in config files**
- Solution: Config files use ES modules syntax (`export default`)
- Ensure package.json has `"type": "module"`

## Testing

### Full Workflow Test

1. **Generate Keys:** Click "Generate Key Pair" on Step 1
2. **Sign Document:** Enter text and click "Sign Document" on Step 2
3. **Verify Valid:** Click "Verify Signature" on Step 3 (should show ✓ Valid)
4. **Verify Invalid (Tampered):** Edit document in tamper simulator and click "Re-Verify Tampered Document" (should show ✗ Invalid)

All four operations should complete successfully and show appropriate results.

## Performance Notes

- Key generation: ~100ms per key pair
- Signing: ~50ms per document
- Verification: ~100ms per signature
- Signature visualization: Renders 64 colored tiles instantly

## License

Educational use. Modify freely for learning purposes.

## References

- [CRYSTALS-Dilithium](https://pq-crystals.org/dilithium/)
- [NIST FIPS 204: ML-DSA Specification](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf)
- [Open Quantum Safe (liboqs)](https://openquantumsafe.org/)
- [Post-Quantum Cryptography Standardization](https://csrc.nist.gov/projects/post-quantum-cryptography/)

---

Built with ❤️ for post-quantum cryptography education
