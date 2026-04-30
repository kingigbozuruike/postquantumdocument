#!/bin/bash

echo "========================================================================"
echo "QUANTUM-SAFE SIGNING PORTAL - END-TO-END TEST"
echo "========================================================================"

# Step 1: Generate Keys
echo ""
echo "[STEP 1] Generating ML-DSA-65 key pair..."
KEYS=$(curl -s -X POST http://localhost:8000/api/generate-keys)
echo "$KEYS" | jq . > /tmp/keys.json 2>/dev/null || echo "$KEYS" > /tmp/keys.json

PUBLIC_KEY=$(echo "$KEYS" | jq -r '.public_key' 2>/dev/null || grep -o '"public_key":"[^"]*' /tmp/keys.json | cut -d'"' -f4)
PRIVATE_KEY=$(echo "$KEYS" | jq -r '.private_key' 2>/dev/null || grep -o '"private_key":"[^"]*' /tmp/keys.json | cut -d'"' -f4)

if [ -z "$PUBLIC_KEY" ]; then
  echo "✗ FAILED: Could not generate keys"
  echo "Response: $KEYS"
  exit 1
fi

echo "✓ Keys generated successfully"
echo "  Public key length: ${#PUBLIC_KEY} chars (~$((${#PUBLIC_KEY} / 2)) bytes)"
echo "  Private key length: ${#PRIVATE_KEY} chars (~$((${#PRIVATE_KEY} / 2)) bytes)"
echo "  Public key (first 64 chars): ${PUBLIC_KEY:0:64}..."

# Step 2: Sign a document
echo ""
echo "[STEP 2] Signing a document..."
DOCUMENT="This is a test document for quantum-safe signing. It demonstrates the power of post-quantum cryptography."

SIGN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/sign \
  -H "Content-Type: application/json" \
  -d "{\"private_key\":\"$PRIVATE_KEY\",\"document\":\"$DOCUMENT\"}")

SIGNATURE=$(echo "$SIGN_RESPONSE" | jq -r '.signature' 2>/dev/null)

if [ -z "$SIGNATURE" ] || [ "$SIGNATURE" = "null" ]; then
  echo "✗ FAILED: Could not sign document"
  echo "Response: $SIGN_RESPONSE"
  exit 1
fi

echo "✓ Document signed successfully"
echo "  Document: ${DOCUMENT:0:50}..."
echo "  Signature length: ${#SIGNATURE} chars (~$((${#SIGNATURE} / 2)) bytes)"
echo "  Signature (first 64 chars): ${SIGNATURE:0:64}..."

# Step 3: Verify valid signature
echo ""
echo "[STEP 3] Verifying signature with original document..."

VERIFY_RESPONSE=$(curl -s -X POST http://localhost:8000/api/verify \
  -H "Content-Type: application/json" \
  -d "{\"public_key\":\"$PUBLIC_KEY\",\"document\":\"$DOCUMENT\",\"signature\":\"$SIGNATURE\"}")

IS_VALID=$(echo "$VERIFY_RESPONSE" | jq -r '.valid' 2>/dev/null)
VERIFY_MESSAGE=$(echo "$VERIFY_RESPONSE" | jq -r '.message' 2>/dev/null)

if [ "$IS_VALID" = "true" ]; then
  echo "✓ Signature verification PASSED"
  echo "  Result: $VERIFY_MESSAGE"
else
  echo "✗ FAILED: Signature should be valid but isn't"
  echo "  Result: $VERIFY_MESSAGE"
  exit 1
fi

# Step 4: Verify with tampered document
echo ""
echo "[STEP 4] Verifying signature with TAMPERED document..."
TAMPERED_DOCUMENT="This is a MODIFIED test document for quantum-safe signing."

TAMPER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/verify \
  -H "Content-Type: application/json" \
  -d "{\"public_key\":\"$PUBLIC_KEY\",\"document\":\"$TAMPERED_DOCUMENT\",\"signature\":\"$SIGNATURE\"}")

TAMPER_IS_VALID=$(echo "$TAMPER_RESPONSE" | jq -r '.valid' 2>/dev/null)
TAMPER_MESSAGE=$(echo "$TAMPER_RESPONSE" | jq -r '.message' 2>/dev/null)

if [ "$TAMPER_IS_VALID" = "false" ]; then
  echo "✓ Tamper detection PASSED"
  echo "  Result: $TAMPER_MESSAGE"
  echo "  Modified doc: ${TAMPERED_DOCUMENT:0:50}..."
else
  echo "✗ FAILED: Signature should be invalid for tampered doc but isn't"
  echo "  Result: $TAMPER_MESSAGE"
  exit 1
fi

echo ""
echo "========================================================================"
echo "✓ ALL TESTS PASSED - COMPLETE WORKFLOW SUCCESSFUL"
echo "========================================================================"
echo ""
echo "Summary:"
echo "  ✓ Step 1: Generate Keys - PASSED"
echo "  ✓ Step 2: Sign Document - PASSED"
echo "  ✓ Step 3: Verify Valid Signature - PASSED"
echo "  ✓ Step 4: Detect Tampering - PASSED"
echo ""
echo "The quantum-safe signing portal is fully functional!"
echo ""
