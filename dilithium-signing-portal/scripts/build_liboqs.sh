#!/bin/bash
# Build script for liboqs on cloud platforms
# This is executed during the Procfile release phase

set -e  # Exit on error

echo "=========================================="
echo "Building liboqs for Quantum-Safe Signing"
echo "=========================================="

# Check if already built
if [ -f "$HOME/.liboqs/lib/liboqs.so" ]; then
    echo "✓ liboqs already built"
    exit 0
fi

# Install build dependencies
echo "📦 Installing build dependencies..."
apt-get update -qq
apt-get install -y -qq \
    build-essential \
    cmake \
    pkg-config \
    git \
    > /dev/null 2>&1

# Create build directory
mkdir -p /tmp/liboqs-build
cd /tmp/liboqs-build

# Clone liboqs
echo "📥 Downloading liboqs..."
git clone --depth 1 https://github.com/open-quantum-safe/liboqs.git . > /dev/null 2>&1

# Build liboqs with custom prefix
echo "⚙️  Building liboqs (this may take 2-3 minutes)..."
mkdir -p build
cd build

cmake \
    -DCMAKE_INSTALL_PREFIX=$HOME/.liboqs \
    -DCMAKE_BUILD_TYPE=Release \
    -DOQS_ENABLE_SHA3=ON \
    .. > /dev/null 2>&1

make -j$(nproc) > /dev/null 2>&1
make install > /dev/null 2>&1

# Update library cache
echo "🔗 Linking libraries..."
export LD_LIBRARY_PATH=$HOME/.liboqs/lib:$LD_LIBRARY_PATH
ldconfig -n $HOME/.liboqs/lib 2>/dev/null || true

# Verify build
echo "✓ Testing liboqs installation..."
python3 -c "
import sys
sys.path.insert(0, '$HOME/.liboqs')
try:
    import oqs
    sig = oqs.Signature('ML-DSA-65')
    print('✓ liboqs successfully built and verified!')
except Exception as e:
    print(f'✗ Error: {e}')
    sys.exit(1)
"

echo "=========================================="
echo "✓ Build complete!"
echo "=========================================="
