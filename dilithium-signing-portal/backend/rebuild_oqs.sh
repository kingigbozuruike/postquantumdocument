#!/bin/bash
# Find and build compatible liboqs version for liboqs-python 0.14.1

cd /tmp
rm -rf liboqs

echo "Cloning liboqs and checking tags..."
git clone https://github.com/open-quantum-safe/liboqs.git
cd liboqs

# Get recent tags
echo "Recent tags in liboqs repo:"
git tag | tail -20

# Try building from 0.14.0 tag (most compatible with 0.14.1 python)
echo ""
echo "Building liboqs from 0.14.0 tag..."
git checkout 0.14.0 || git checkout main

mkdir -p build
cd build
cmake .. -DCMAKE_INSTALL_PREFIX=/usr/local -DBUILD_SHARED_LIBS=ON -DENABLE_DEBUG=OFF
make -j$(nproc)
sudo make install
sudo ldconfig

echo "✓ liboqs installed!"

# Reinstall python bindings
cd /workspaces/postquantumdocument/dilithium-signing-portal/backend
pip install --force-reinstall --no-cache-dir liboqs-python==0.14.1

echo ""
echo "Testing again..."
python test.py
