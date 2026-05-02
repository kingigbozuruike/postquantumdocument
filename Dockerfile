# Stage 1: Build liboqs
FROM python:3.12 as liboqs-builder

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    build-essential \
    gcc \
    libtool \
    autoconf \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

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
    ldconfig

# Verify liboqs was built
RUN ldconfig -p | grep liboqs || (echo "ERROR: liboqs not found after build" && exit 1)

# Stage 2: Runtime image
FROM python:3.12

# Copy compiled liboqs from builder
COPY --from=liboqs-builder /usr/local/lib/liboqs* /usr/local/lib/
COPY --from=liboqs-builder /usr/local/include/oqs /usr/local/include/oqs

# Update library cache
RUN ldconfig

# Copy the application
COPY dilithium-signing-portal /app
WORKDIR /app/backend

# Install Python dependencies
# liboqs-python will find the compiled library via ldconfig
RUN pip install --no-cache-dir -r requirements.txt

# Test that import works
RUN python3 -c "import oqs; print('✓ liboqs-python imported successfully')"

# Expose port
EXPOSE 8000

# Set library path as runtime fallback
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

# Start server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

