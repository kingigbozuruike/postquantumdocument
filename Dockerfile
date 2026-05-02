FROM python:3.12-slim

# Install build dependencies
RUN apt-get update && apt-get install -y \
    git \
    cmake \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Build liboqs from source
RUN mkdir -p /app/liboqs-build && \
    cd /app/liboqs-build && \
    git clone https://github.com/open-quantum-safe/liboqs.git . && \
    mkdir build && cd build && \
    cmake -DCMAKE_INSTALL_PREFIX=/app/.oqs .. && \
    make && \
    make install && \
    cd /app && rm -rf liboqs-build

# Copy the application
COPY dilithium-signing-portal /app/app

# Set up Python environment
ENV LD_LIBRARY_PATH=/app/.oqs/lib:$LD_LIBRARY_PATH
WORKDIR /app/app/backend

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
