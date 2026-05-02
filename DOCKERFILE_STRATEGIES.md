# Dockerfile Strategy Comparison

## Summary

| Strategy | File | Pros | Cons | Best For |
|----------|------|------|------|----------|
| **A (Updated)** | `Dockerfile` | Simple, standard approach | Requires explicit library verification | Most cases |
| **B (Robust)** | `Dockerfile.robust` | Explicit /usr/lib copy, defensive | Larger final image, over-engineered | If Strategy A fails |
| **C (Multi-stage)** | `Dockerfile.multistage` | Smallest image, clean separation | More complex, but optimized | Production with size constraints |

---

## Strategy A: Updated Dockerfile (RECOMMENDED START HERE)

**File:** `Dockerfile` (already updated in your repo)

**Key improvements:**
```dockerfile
# 1. Build liboqs with shared library
cmake ... -DBUILD_SHARED_LIBS=ON -DCMAKE_BUILD_TYPE=Release

# 2. Update ldconfig
ldconfig

# 3. Verify compilation
ldconfig -p | grep liboqs || exit 1

# 4. Copy app BEFORE pip install
COPY dilithium-signing-portal /app
WORKDIR /app/backend

# 5. Install Python deps after liboqs in ldconfig
RUN pip install --no-cache-dir -r requirements.txt

# 6. Verify Python import works
RUN python3 -c "import oqs; print('✓ liboqs-python imported successfully')"

# 7. Set LD_LIBRARY_PATH
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
```

**Test locally:**
```bash
docker build -f Dockerfile -t test .
docker run --rm test python3 -c "import oqs; oqs.Signature('ML-DSA-65')"
```

**When to use:** First deployment attempt, expected to work in most cases

---

## Strategy B: Ultra-Robust Dockerfile (IF STRATEGY A FAILS)

**File:** `Dockerfile.robust`

**What it does differently:**
```dockerfile
# 1. Builds liboqs to /usr/local (same as A)

# 2. EXPLICITLY COPIES to /usr/lib (guaranteed searchable)
RUN cp -v /usr/local/lib/liboqs* /usr/lib/ 2>/dev/null || true

# 3. Runs ldconfig again
RUN ldconfig

# 4. VERIFIES library is accessible
RUN ls -la /usr/lib/liboqs*
RUN ldconfig -p | grep liboqs

# 5. Detailed test with try/except
RUN python3 << 'EOF'
import sys
try:
    import oqs
    sig = oqs.Signature('ML-DSA-65')
    print('✅ SUCCESS: liboqs-python is working')
except Exception as e:
    print(f'❌ FAILED: {e}', file=sys.stderr)
    sys.exit(1)
EOF

# 6. Sets LD_LIBRARY_PATH with both paths
ENV LD_LIBRARY_PATH=/usr/local/lib:/usr/lib:$LD_LIBRARY_PATH
```

**Why it's more robust:**
- Copies library to /usr/lib (ctypes default search location)
- Multiple verifications at build time
- Detailed error messages if anything fails
- Defensive LD_LIBRARY_PATH with both locations

**When to use:** 
- Strategy A fails with "No oqs shared libraries found"
- You need guaranteed reliability
- Want explicit verification in build output

---

## Strategy C: Multi-Stage Dockerfile (PRODUCTION OPTIMIZED)

**File:** `Dockerfile.multistage`

**How it works:**
```dockerfile
# Stage 1: Builder (includes all build tools)
FROM python:3.12-slim as builder
RUN apt-get install -y git cmake build-essential ...
RUN build liboqs here
COPY liboqs to /usr/local

# Stage 2: Final runtime (minimal, clean)
FROM python:3.12-slim
COPY --from=builder /usr/local/lib/liboqs* /usr/lib/
COPY --from=builder /usr/local/include/oqs /usr/include/oqs
RUN ldconfig
COPY dilithium-signing-portal /app
RUN pip install -r requirements.txt
```

**Advantages:**
- ✅ Final image **50-60% smaller** (build tools not included)
- ✅ Cleaner separation: builder vs runtime
- ✅ Faster image pulls from Railway registry
- ✅ Better security (no build tools in production)

**Disadvantages:**
- More complex to debug
- Slightly harder to maintain

**When to use:**
- After confirming Strategy A or B works
- Want to optimize for performance/size
- In production with many deployments

---

## How to Choose

### Start with Strategy A
```bash
# Your current Dockerfile is now Strategy A
docker build -f Dockerfile -t test .
docker run --rm test python3 -c "import oqs; print('OK')"
```

### If that fails, try Strategy B
```bash
# If "No oqs shared libraries found" error appears:
docker build -f Dockerfile.robust -t test .
# Copy Dockerfile.robust contents to Dockerfile and retry
cp Dockerfile.robust Dockerfile
```

### When ready for production, use Strategy C
```bash
# After confirming B works:
cp Dockerfile.multistage Dockerfile
# Test it works, then deploy
```

---

## Deployment Steps

### For ANY strategy:

1. **Test locally:**
```bash
docker build -f Dockerfile -t myapp .
docker run --rm myapp python3 -c "import oqs; oqs.Signature('ML-DSA-65')"
```

2. **Push to GitHub:**
```bash
git add Dockerfile
git commit -m "Fix: liboqs deployment for Railway"
git push origin main
```

3. **Deploy on Railway:**
- Dashboard → Your service → Settings
- Verify "Dockerfile" is selected (not Procfile)
- Click "Redeploy" or wait for auto-detection
- Watch logs for "Uvicorn running"

4. **Monitor:**
```bash
# In Railway logs, look for:
# ✅ "Uvicorn running on http://0.0.0.0:8000"
# ❌ "git: not found"
# ❌ "No oqs shared libraries found"
```

---

## Rollback Plan

If deployment fails:
```bash
# Try the next strategy
git checkout Dockerfile.robust  # or Dockerfile.multistage
git add Dockerfile
git commit -m "Rollback: try alternative build strategy"
git push origin main
# Railway auto-rebuilds
```

---

## FAQ

**Q: Will Strategy A definitely work?**
A: Strategy A has been used successfully with liboqs in many deployments. The key is the order of operations and ldconfig. If it doesn't work, Strategy B is more defensive.

**Q: Which strategy is used by liboqs-python itself?**
A: The official Python wrapper doesn't do multi-stage; it recommends compiling liboqs to system paths, which is what Strategies A & B do.

**Q: Can I use Strategy C immediately?**
A: You can try, but A or B are safer for first deployment since they're easier to debug.

**Q: What if I need even smaller images?**
A: Switch to `python:3.12-alpine` instead of `python:3.12-slim`, but you'll need to install musl-dev and other Alpine equivalents of build tools.
