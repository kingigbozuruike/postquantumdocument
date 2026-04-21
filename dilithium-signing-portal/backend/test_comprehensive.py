#!/usr/bin/env python3
"""Comprehensive tests for Dilithium3 crypto functions."""

from crypto import generate_keys, sign_document, verify_document

def test_key_generation():
    """Test 1: Key generation returns proper format."""
    print("Test 1: Key Generation")
    result = generate_keys()
    assert "error" not in result, f"Key generation failed: {result}"
    assert "public_key" in result, "Missing public_key"
    assert "private_key" in result, "Missing private_key"
    # Verify they're valid hex
    bytes.fromhex(result["public_key"])
    bytes.fromhex(result["private_key"])
    print("✓ Keys generated successfully\n")
    return result

def test_signing(keys, doc_text):
    """Test 2: Signing produces valid format."""
    print("Test 2: Document Signing")
    result = sign_document(keys["private_key"], doc_text)
    assert "error" not in result, f"Signing failed: {result}"
    assert "signature" in result, "Missing signature"
    assert "document" in result, "Missing document"
    assert result["document"] == doc_text, "Document mismatch"
    bytes.fromhex(result["signature"])  # Verify hex format
    print(f"✓ Document signed successfully\n")
    return result

def test_verification_valid(keys, doc_text, sig_result):
    """Test 3: Valid signature verifies."""
    print("Test 3: Valid Signature Verification")
    result = verify_document(keys["public_key"], doc_text, sig_result["signature"])
    assert "error" not in result, f"Verification error: {result}"
    assert result["valid"] == True, f"Signature should be valid: {result}"
    assert "message" in result, "Missing message"
    print(f"✓ Valid signature verified: {result['message']}\n")

def test_verification_invalid_signature():
    """Test 4: Invalid signature fails."""
    print("Test 4: Invalid Signature Detection")
    keys = generate_keys()
    doc_text = "Test document"
    
    # Get a valid signature
    sig_result = sign_document(keys["private_key"], doc_text)
    valid_sig = sig_result["signature"]
    
    # Corrupt the signature (flip last byte)
    sig_bytes = bytes.fromhex(valid_sig)
    corrupted = (sig_bytes[:-1] + bytes([sig_bytes[-1] ^ 0xFF])).hex()
    
    result = verify_document(keys["public_key"], doc_text, corrupted)
    assert result["valid"] == False, "Should detect corrupted signature"
    print(f"✓ Corrupted signature detected: {result['message']}\n")

def test_verification_invalid_document():
    """Test 5: Signature fails with different document."""
    print("Test 5: Document Tampering Detection")
    keys = generate_keys()
    doc_text = "Original document"
    
    sig_result = sign_document(keys["private_key"], doc_text)
    
    # Verify with different document
    result = verify_document(keys["public_key"], "Tampered document", sig_result["signature"])
    assert result["valid"] == False, "Should detect document tampering"
    print(f"✓ Document tampering detected: {result['message']}\n")

def test_error_handling():
    """Test 6: Error handling for invalid inputs."""
    print("Test 6: Error Handling")
    
    # Invalid hex
    result = sign_document("not_hex_format", "test")
    assert "error" in result, "Should handle invalid hex"
    print(f"✓ Invalid hex caught: {result['error']}")
    
    # Invalid key format
    result = sign_document("deadbeef", "test")  # Too short
    assert "error" in result, "Should handle invalid key length"
    print(f"✓ Invalid key length caught: {result['error']}\n")

def test_multiple_documents():
    """Test 7: Multiple documents independently signed."""
    print("Test 7: Multiple Documents")
    keys = generate_keys()
    docs = ["Doc 1", "Doc 2", "Doc 3"]
    
    signatures = {}
    for doc in docs:
        sig_result = sign_document(keys["private_key"], doc)
        signatures[doc] = sig_result["signature"]
    
    # Verify all signatures
    for i, doc in enumerate(docs):
        result = verify_document(keys["public_key"], doc, signatures[doc])
        assert result["valid"] == True, f"Failed to verify doc {i+1}"
        print(f"✓ Document '{doc}' verified")
    print()

if __name__ == "__main__":
    print("=" * 50)
    print("DILITHIUM3 CRYPTO TESTS")
    print("=" * 50 + "\n")
    
    try:
        # Run tests in sequence
        keys = test_key_generation()
        doc_text = "Hello, Post-Quantum World!"
        sig_result = test_signing(keys, doc_text)
        test_verification_valid(keys, doc_text, sig_result)
        test_verification_invalid_signature()
        test_verification_invalid_document()
        test_error_handling()
        test_multiple_documents()
        
        print("=" * 50)
        print("ALL TESTS PASSED ✓")
        print("=" * 50)
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
