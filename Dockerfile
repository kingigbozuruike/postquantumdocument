FROM python:3.12-slim

# Install build dependencies
RUN apt-get update && apt-get install -y \
    git \
    cmake \
    build-essential \
    gcc \
    libtool \
    autoconf \
    && rm -rf /var/lib/apt/lists/*

# Build liboqs and install to system location
RUN cd /tmp && \
    git clone https://github.com/open-quantum-safe/liboqs.git && \
    cd liboqs && \
    mkdir build && cd build && \
    cmake -DCMAKE_INSTALL_PREFIX=/usr/local .. && \
    make && \
    make install && \
    ldconfig && \
    cd /tmp && rm -rf liboqs

# Verify liboqs was built
RUN ls -la /usr/local/lib/*oqs* 2>/dev/null || echo "Warning: liboqs libraries not found"

# Copy the application
COPY dilithium-signing-portal /app

# Set working directory
WORKDIR /app/backend

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Set library path for runtime
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

# Start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

