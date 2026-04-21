#!/usr/bin/env python3
"""Debug available OQS algorithms."""

import oqs

# Suppress warnings
import warnings
warnings.filterwarnings('ignore')

print("liboqs-python version:", oqs.__version__)

# List available signature algorithms
sig = oqs.Signature.__init__.__doc__
print("\nAvailable signature algorithms:")

try:
    # Try to create a signature object to see what's supported
    algorithms = [
        "Dilithium2",
        "Dilithium3", 
        "Dilithium5",
        "ML-DSA-44",
        "ML-DSA-65",
        "ML-DSA-87"
    ]
    
    for alg in algorithms:
        try:
            s = oqs.Signature(alg)
            print(f"  ✓ {alg}")
        except Exception as e:
            print(f"  ✗ {alg}: {str(e)[:50]}")
            
except Exception as e:
    print(f"Error: {e}")
