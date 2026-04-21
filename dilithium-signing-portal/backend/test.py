from crypto import generate_keys, sign_document, verify_document
import json

# Generate keys
keys = generate_keys()
print("Keys result:", json.dumps(keys, indent=2))

if "error" in keys:
    print("Error generating keys!")
    exit(1)

pub = keys["public_key"]
priv = keys["private_key"]

# Sign
sig_result = sign_document(priv, "Hello, World!")
print("Sign result:", json.dumps(sig_result, indent=2)[:200])

if "error" in sig_result:
    print("Error signing!")
    exit(1)

signature = sig_result["signature"]

# Verify
verify_result = verify_document(pub, "Hello, World!", signature)
print("Verify result:", json.dumps(verify_result, indent=2))

if verify_result.get("valid"):
    print("\n✓ All tests passed!")
else:
    print("\n✗ Verification failed!")