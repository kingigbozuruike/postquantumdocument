#!/bin/bash
# Fix version mismatch by building latest liboqs

set -e

echo "Removing old liboqs build..."
cd /tmp
rm -rf liboqs

echo "Cloning latest liboqs..."
git clone --depth 1 https://github.com/open-quantum-safe/liboqs.git
cd liboqs

echo "Building and installing latest liboqs..."
mkdir -p build
cd build
cmake .. -DCMAKE_INSTALL_PREFIX=/usr/local -DBUILD_SHARED_LIBS=ON
make -j$(nproc)
sudo make install
sudo ldconfig

echo "✓ liboqs installed successfully!"
echo "Reinstalling liboqs-python..."
cd /workspaces/postquantumdocument/dilithium-signing-portal/backend
pip install --force-reinstall --no-cache-dir liboqs-python==0.14.1

echo "✓ Complete! Testing..."
python test.py
