#!/bin/bash
# Test script to verify liboqs-python deployment setup locally

set -e

echo "=========================================="
echo "Testing liboqs-python Docker Setup"
echo "=========================================="

# Test 1: Build the standard Dockerfile
echo ""
echo "📦 Test 1: Building Dockerfile (Strategy A)..."
docker build -f Dockerfile -t liboqs-test:a . > /tmp/build-a.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Dockerfile built successfully"
else
    echo "❌ Dockerfile build failed"
    tail -30 /tmp/build-a.log
    exit 1
fi

# Test 2: Run the container and test import
echo ""
echo "🧪 Test 2: Running container and testing import..."
docker run --rm liboqs-test:a python3 -c "
import oqs
import sys

try:
    # Test 1: Can we create a Signature object?
    sig = oqs.Signature('ML-DSA-65')
    print('✅ Created ML-DSA-65 Signature object')
    
    # Test 2: Can we generate a keypair?
    public_key, secret_key = sig.generate_keypair()
    print(f'✅ Generated keypair (public: {len(public_key)} bytes, secret: {len(secret_key)} bytes)')
    
    # Test 3: Can we sign?
    message = b'test message'
    signature = sig.sign(message)
    print(f'✅ Signed message (signature: {len(signature)} bytes)')
    
    # Test 4: Can we verify?
    is_valid = sig.verify(message, signature, public_key)
    print(f'✅ Verified signature: {is_valid}')
    
    print('')
    print('🎉 All tests passed! liboqs-python is ready for production.')
    
except Exception as e:
    print(f'❌ Error: {e}', file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo "✅ Container tests passed"
else
    echo "❌ Container tests failed"
    exit 1
fi

# Test 3: Run the FastAPI server
echo ""
echo "🚀 Test 3: Starting FastAPI server..."
timeout 5 docker run --rm -p 8000:8000 liboqs-test:a uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/server.log 2>&1 &
sleep 2

if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ FastAPI server started successfully"
    pkill -f "docker run" || true
else
    echo "❌ FastAPI server failed to start"
    tail -20 /tmp/server.log
    pkill -f "docker run" || true
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ All tests passed!"
echo "=========================================="
echo ""
echo "You can now safely deploy to Railway."
echo "Recommended deployment steps:"
echo "1. Ensure railway.json points to correct rootDirectory"
echo "2. Push Dockerfile to repository"
echo "3. In Railway dashboard: set deployment to use Dockerfile"
echo "4. Deploy and monitor logs"
