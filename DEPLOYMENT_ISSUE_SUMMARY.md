# Liboqs-Python Deployment Issue - Detailed Summary

## Problem Statement

A FastAPI backend application deployed to Railway is crashing at startup with:
```
RuntimeError: No oqs shared libraries found
/bin/sh: 1: git: not found
Error installing liboqs.
```

The application requires `liboqs-python` (a Python wrapper around the liboqs C library) for quantum-safe cryptography operations (ML-DSA-65/Dilithium3 signatures).

## Root Cause Analysis

### Primary Issue: Fallback Auto-Installation Mechanism
`liboqs-python` has a built-in fallback that triggers when the compiled `liboqs` C library is not found at Python import time:

1. Python code imports `oqs` module
2. `oqs.py` tries to load the compiled `liboqs` shared library via ctypes
3. If library not found, triggers auto-install: `git clone https://github.com/open-quantum-safe/liboqs.git`
4. Auto-install tries to compile from source using cmake/make
5. **Runtime container lacks git, cmake, and build tools** → compilation fails
6. App crashes

### Secondary Issue: Library Discovery Mechanism
`liboqs-python` searches for compiled libraries in these locations (in order):
1. System library paths (via `ldconfig`)
2. `LD_LIBRARY_PATH` environment variable
3. `./liboqs/lib` (current directory)
4. Falls back to auto-install (see above)

Our Dockerfiles built liboqs correctly but the libraries **aren't being found** at runtime.

## Deployment Timeline & Attempts

### Attempt 1: Procfile Release Phase
```
release: bash scripts/build_liboqs.sh
web: cd backend && source venv/bin/activate && python main.py
```
**Failed**: Release phase runs AFTER build environment is cleaned up. No access to git/cmake.

### Attempt 2: bin/build Script
Created `bin/build` script with liboqs compilation. Railway should auto-execute during build phase.

**Failed**: Script was not automatically executed. Railway's Railpack doesn't recognize arbitrary build scripts.

### Attempt 3: Dockerfile (Single-stage, slim image)
```dockerfile
FROM python:3.12-slim
# Install git, cmake, build-essential
# Build liboqs to /usr/local
# Copy app and install Python deps
```
**Failed**: 
- `python:3.12-slim` is too minimal
- Even with liboqs built and ldconfig run, `liboqs-python` still doesn't find it
- Unclear why ldconfig registration isn't working
- Fallback mechanism still triggers

### Attempt 4: Dockerfile (Single-stage, full image)
```dockerfile
FROM python:3.12
# Install git, cmake, build-essential
# Build liboqs to /usr/local
# Run ldconfig
# Copy app and install Python deps
# Test import: python3 -c "import oqs"
```
**Failed**: Import test passed during build, but at runtime still triggers fallback mechanism
- Suggests libraries are in image during build but **not accessible at runtime**
- Possible causes:
  - Libraries not properly copied to runtime layers
  - Dynamic linking issues
  - `ldconfig` cache not preserved

### Attempt 5: Dockerfile (Multistage Build)
```dockerfile
FROM python:3.12 as liboqs-builder
# Build liboqs, install to /usr/local

FROM python:3.12
# COPY --from=liboqs-builder /usr/local/lib/liboqs* /usr/local/lib/
# COPY --from=liboqs-builder /usr/local/include/oqs /usr/local/include/oqs
# ldconfig
# Install Python deps
# Test import
```
**Current Status**: Deployed but still failing with same error

## Key Technical Details

### Application Stack
- **Language**: Python 3.12
- **Framework**: FastAPI + Uvicorn
- **Crypto Library**: liboqs-python 0.14.1
- **liboqs-python Dependency**: liboqs C library (compiled binary)
- **Deployment Platform**: Railway.app
- **Build System**: Docker

### liboqs-python Specifics
- Package: `liboqs-python==0.14.1` (pure Python wrapper)
- Actual library: Open Quantum Safe's `liboqs` C library
- Search order (ctypes.CDLL):
  1. System library paths (glibc's `find_library()`)
  2. LD_LIBRARY_PATH
  3. Fallback to auto-install if not found
- **Auto-install requires**: git, cmake, build-essential, make

### Current Error Logs
```
Starting Container
liboqs not found, installing it in /root/_oqs
Installing in 5 seconds...
/bin/sh: 1: git: not found
Error installing liboqs.
RuntimeError: No oqs shared libraries found
```

This indicates:
1. ✗ Library not in standard system paths
2. ✗ Library not in LD_LIBRARY_PATH
3. ✗ Library not found via ctypes.CDLL()
4. ✓ Fallback triggered
5. ✗ git not available in runtime container (expected, but means fallback can't recover)

## Current Repository Structure
```
postquantumdocument/
├── Dockerfile (multistage, current)
├── runtime.txt (python-3.12.3)
├── railway.json (rootDirectory: dilithium-signing-portal)
├── bin/build (unused)
├── dilithium-signing-portal/
│   ├── backend/
│   │   ├── main.py (FastAPI server)
│   │   ├── crypto.py (uses oqs)
│   │   ├── requirements.txt (includes liboqs-python==0.14.1)
│   │   └── .python-version (3.12)
│   ├── Procfile
│   └── frontend/
├── scripts/build_liboqs.sh (unused)
```

## Hypothesis for Next Engineer

The multistage Dockerfile build IS working correctly:
- Build stage compiles liboqs
- Libraries are in `/usr/local/lib/`
- Build stage import test passes (`python3 -c "import oqs"` ✓)

**But at runtime, something breaks the library linkage:**

Possible causes:
1. **Dynamic dependencies missing**: liboqs compiled libraries have dependencies (libc, openssl, etc.) that aren't available in runtime image
   - Solution: Check ldd output of compiled libraries
   
2. **Symbolic links not preserved**: Multistage COPY might not preserve symlinks properly
   - Solution: Use tar + archive instead of COPY
   
3. **Runtime ld.so cache invalid**: ldconfig cache from build stage not available in runtime
   - Solution: Run ldconfig again in runtime stage or hardcode library paths
   
4. **Library name/version mismatch**: liboqs-python looking for specific library filename that wasn't created
   - Solution: Check what oqs.py expects vs what was actually built
   
5. **Working directory or path issues**: Runtime working directory different from build
   - Solution: Verify paths at startup

## Questions for Next Engineer

1. Can you run `ldd` on the compiled liboqs library to see its dependencies?
2. Does the compiled library have specific filename/version requirements?
3. Can you trace what ctypes.CDLL() is actually searching for?
4. What does `liboqs-python/oqs.py` expect for library search?
5. Should we pre-compile a minimal liboqs binary distribution instead of building from source?
6. Can we install liboqs from a pre-built .deb package instead?

## Alternative Approaches to Consider

1. **Use pre-built liboqs .deb package** instead of compiling
   - Might be available in apt repos
   - Would eliminate build complexity

2. **Use liboqs conda package** instead of pip + Docker
   - Conda environment management might handle dependencies better

3. **Static linking**: Compile liboqs with `-static` flag to eliminate runtime dependencies
   - More complex but eliminates library discovery issues

4. **Docker volume mount**: Build liboqs locally, mount into container
   - Not applicable for Railway, but useful for testing

5. **Abandon liboqs-python, use direct ctypes binding**
   - Would give us full control over library loading
   - High effort, not recommended

## Artifacts for Debugging

Available in the repository:
- `Dockerfile` (current multistage build)
- `Dockerfile.robust` (alternative approach)
- `Dockerfile.multistage` (reference)
- Build logs from Railway (in deployment history)
- `DEPLOYMENT_SOLUTION.md` (technical analysis)
- `DEPLOYMENT_TROUBLESHOOTING.md` (previous attempts)

## GitHub Repository
- **Repo**: kingigbozuruike/postquantumdocument
- **Branch**: main
- **Latest Commit**: Multistage Dockerfile build
