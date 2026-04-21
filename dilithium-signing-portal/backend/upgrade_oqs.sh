#!/bin/bash
# Try to upgrade to latest liboqs-python

cd /workspaces/postquantumdocument/dilithium-signing-portal/backend

echo "Attempting to upgrade liboqs-python to latest..."
pip install --upgrade liboqs-python

echo ""
echo "Testing..."
python3 << 'EOF'
import warnings
warnings.filterwarnings('ignore')
import oqs

print("Testing Dilithium3...")
try:
    sig = oqs.Signature("Dilithium3")
    public_key = sig.generate_keypair()
    print(f"✓ Success! Public key size: {len(public_key)} bytes")
except Exception as e:
    print(f"✗ Failed: {e}")
EOF
