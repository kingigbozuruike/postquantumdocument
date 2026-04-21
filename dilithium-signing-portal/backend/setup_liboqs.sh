#!/bin/bash
# Setup script for liboqs and liboqs-python

set -e

echo "Installing liboqs build dependencies..."
sudo apt-get update -o APT::Get::AllowUnauthenticated=true || true
sudo apt-get install -y -o APT::Get::AllowUnauthenticated=true \
    build-essential \
    cmake \
    git \
    libssl-dev \
    openssl

echo "Cloning and building liboqs from source..."
cd /tmp
if [ -d "liboqs" ]; then
    rm -rf liboqs
fi

git clone --depth 1 https://github.com/open-quantum-safe/liboqs.git
cd liboqs

mkdir -p build
cd build
cmake .. -DCMAKE_INSTALL_PREFIX=/usr/local -DBUILD_SHARED_LIBS=ON
make -j$(nproc)
sudo make install

echo "Updating library cache..."
sudo ldconfig

echo "Installing Python liboqs bindings..."
cd /workspaces/postquantumdocument/dilithium-signing-portal/backend
pip install --force-reinstall --no-cache-dir liboqs-python==0.14.1

echo "✓ liboqs setup complete!"
