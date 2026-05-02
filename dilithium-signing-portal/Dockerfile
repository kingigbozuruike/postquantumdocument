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
    make -j"$(nproc)" && \
    make install

RUN ls -l /usr/local/lib/liboqs*

# Stage 2: Runtime image
FROM python:3.12

# Copy entire liboqs library and include directories
COPY --from=liboqs-builder /usr/local/lib/ /usr/local/lib/
COPY --from=liboqs-builder /usr/local/include/ /usr/local/include/

# Explicitly register /usr/local/lib in system loader configuration
RUN echo "/usr/local/lib" > /etc/ld.so.conf.d/liboqs.conf && ldconfig

# Set LD_LIBRARY_PATH EARLY, before pip install and import tests
ENV LD_LIBRARY_PATH=/usr/local/lib

# Copy the application
COPY dilithium-signing-portal /app
WORKDIR /app/backend

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Test the exact runtime loading path that will happen at container startup
RUN ls -l /usr/local/lib/liboqs* && \
    python3 -c "import ctypes; ctypes.CDLL('/usr/local/lib/liboqs.so'); import oqs; print('✓ liboqs-python imported successfully')"

# Expose port
EXPOSE 8000

# Start server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

