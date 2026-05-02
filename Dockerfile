FROM python:3.12-slim

# Install build dependencies for liboqs compilation
RUN apt-get update && apt-get install -y \
    git \
    cmake \
    build-essential \
    gcc \
    libtool \
    autoconf \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Stage 1: Build liboqs with shared library support
RUN cd /tmp && \
    git clone --depth 1 https://github.com/open-quantum-safe/liboqs.git && \
    cd liboqs && \
    mkdir build && cd build && \
    cmake -DCMAKE_INSTALL_PREFIX=/usr/local \
          -DBUILD_SHARED_LIBS=ON \
          -DCMAKE_BUILD_TYPE=Release \
          .. && \
    make -j$(nproc) && \
    make install && \
    ldconfig && \
    cd /tmp && rm -rf liboqs

# Verify liboqs compilation succeeded
RUN ldconfig -p | grep liboqs || (echo "ERROR: liboqs not found after compilation" && exit 1)

# Copy the application BEFORE installing Python dependencies
COPY dilithium-signing-portal /app
WORKDIR /app/backend

# Install Python dependencies (after liboqs is in ldconfig)
# This ensures liboqs-python finds the compiled library
RUN pip install --no-cache-dir -r requirements.txt

# Verify the liboqs-python wrapper can import successfully
RUN python3 -c "import oqs; print('✓ liboqs-python imported successfully')"

# Expose port
EXPOSE 8000

# Ensure liboqs library is discoverable at runtime
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

# Start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

