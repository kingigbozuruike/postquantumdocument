"""
Cryptographic utilities for Dilithium signing.
This module contains functions for key generation, signing, and verification
using the Dilithium post-quantum signature scheme via liboqs-python.
"""

import warnings
import oqs

# Suppress version mismatch warnings between liboqs and liboqs-python
warnings.filterwarnings('ignore', message='liboqs version.*differs')


def generate_keys() -> dict:
    """
    Generate a Dilithium3 public/private key pair.
    
    Returns:
        dict: {"public_key": <hex string>, "private_key": <hex string>}
              or {"error": <message>} on failure
    """
    try:
        sig = oqs.Signature("Dilithium3")
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
        private_key_hex: Dilithium3 private key as hex string
        document_text: Document text to sign
    
    Returns:
        dict: {"signature": <hex string>, "document": <original text>}
              or {"error": <message>} on failure
    """
    try:
        private_key_bytes = bytes.fromhex(private_key_hex)
        document_bytes = document_text.encode('utf-8')
        
        sig = oqs.Signature("Dilithium3", secret_key=private_key_bytes)
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
        public_key_hex: Dilithium3 public key as hex string
        document_text: Original document text
        signature_hex: Signature as hex string
    
    Returns:
        dict: {"valid": true/false, "message": <human-readable result>}
              or {"error": <message>} on failure
    """
    try:
        public_key_bytes = bytes.fromhex(public_key_hex)
        document_bytes = document_text.encode('utf-8')
        signature_bytes = bytes.fromhex(signature_hex)
        
        sig = oqs.Signature("Dilithium3", public_key=public_key_bytes)
        sig.verify(document_bytes, signature_bytes)
        
        return {
            "valid": True,
            "message": "Signature is valid and verified."
        }
    except ValueError as e:
        if "Invalid hex" in str(e):
            return {"error": f"Invalid hex format: {str(e)}"}
        return {
            "valid": False,
            "message": "Signature verification failed: Invalid signature."
        }
    except Exception as e:
        return {"error": f"Verification failed: {str(e)}"}
