"""
Cryptographic utilities for Dilithium signing.
This module contains functions for key generation, signing, and verification
using the Dilithium post-quantum signature scheme via liboqs-python.
Uses ML-DSA-65 (NIST standardized Dilithium3 equivalent).
"""

import warnings
import oqs

# Suppress version mismatch warnings between liboqs and liboqs-python
warnings.filterwarnings('ignore', message='liboqs version.*differs')

# Use ML-DSA-65 which is the NIST standardized version equivalent to Dilithium3
ALGORITHM = "ML-DSA-65"


def generate_keys() -> dict:
    """
    Generate a ML-DSA-65 public/private key pair.
    
    Returns:
        dict: {"public_key": <hex string>, "private_key": <hex string>}
              or {"error": <message>} on failure
    """
    try:
        sig = oqs.Signature(ALGORITHM)
        public_key = sig.generate_keypair()
        private_key = sig.export_secret_key()
        
        return {
            "public_key": public_key.hex(),
            "private_key": private_key.hex()
        }
    except Exception as e:
        return {"error": f"Key generation failed: {str(e)}"}


def sign_document(private_key_hex: str, document_text: str) -> dict:
    """
    Sign a document using the private key.
    
    Args:
        private_key_hex: ML-DSA-65 private key as hex string
        document_text: Document text to sign
    
    Returns:
        dict: {"signature": <hex string>, "document": <original text>}
              or {"error": <message>} on failure
    """
    try:
        private_key_bytes = bytes.fromhex(private_key_hex)
        document_bytes = document_text.encode('utf-8')
        
        sig = oqs.Signature(ALGORITHM, secret_key=private_key_bytes)
        signature = sig.sign(document_bytes)
        
        return {
            "signature": signature.hex(),
            "document": document_text
        }
    except ValueError as e:
        return {"error": f"Invalid private key format: {str(e)}"}
    except Exception as e:
        return {"error": f"Signing failed: {str(e)}"}


def verify_document(public_key_hex: str, document_text: str, signature_hex: str) -> dict:
    """
    Verify a document signature using the public key.
    
    Args:
        public_key_hex: ML-DSA-65 public key as hex string
        document_text: Original document text
        signature_hex: Signature as hex string
    
    Returns:
        dict: {"valid": true/false, "message": <human-readable result>}
              or {"error": <message>} on failure
    """
    try:
        # Validate hex format for public key
        try:
            public_key_bytes = bytes.fromhex(public_key_hex)
        except ValueError:
            return {"error": "Invalid public key format: Must be a valid hexadecimal string."}
        
        # Validate hex format for signature
        try:
            signature_bytes = bytes.fromhex(signature_hex)
        except ValueError:
            return {"error": "Invalid signature format: Signature must be a valid hexadecimal string. The signature may have been corrupted or modified."}
        
        document_bytes = document_text.encode('utf-8')
        
        sig = oqs.Signature(ALGORITHM)
        is_valid = sig.verify(document_bytes, signature_bytes, public_key_bytes)
        
        return {
            "valid": is_valid,
            "message": "✓ Signature is valid and verified." if is_valid else "✗ Signature is invalid. The document or signature has been modified, or it was not signed with the provided key."
        }
    except Exception as e:
        return {"error": f"Verification failed: {str(e)}"}
