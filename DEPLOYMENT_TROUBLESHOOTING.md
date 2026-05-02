# Railway Deployment Troubleshooting Guide

## Issue: `/bin/sh: 1: git: not found` + `RuntimeError: No oqs shared libraries found`

This guide helps diagnose and fix deployment failures on Railway.

---

## Pre-Deployment Checklist

### ✅ 1. Verify Dockerfile is Correct
```bash
# Ensure Dockerfile has these elements:
# - git, cmake, build-essential in RUN apt-get install
# - CMAKE_INSTALL_PREFIX=/usr/local or /usr/lib
# - ldconfig run after make install
# - pip install AFTER liboqs compilation
# - LD_LIBRARY_PATH set
```

### ✅ 2. Test Locally with Docker
```bash
# Test the Dockerfile builds
docker build -f Dockerfile -t liboqs-test .

# Test import works
docker run --rm liboqs-test python3 -c "import oqs; print('OK')"

# Test the API starts
docker run --rm -p 8000:8000 liboqs-test uvicorn main:app --host 0.0.0.0 --port 8000
```

### ✅ 3. Check Railway Configuration

**In Railway Dashboard:**
- Service: Select your repository
- Dockerfile: Should show "Detected" (not "Using Procfile")
- Environment: No need for special variables
- Port: 8000 (automatically detected from Dockerfile EXPOSE)

**In railway.json:**
```json
{
  "rootDirectory": "dilithium-signing-portal"
}
```

---

## Common Issues & Fixes

### Issue 1: "git: not found" during deployment

**Cause:** The `liboqs-python` package's fallback is triggering.

**Fix:** Ensure Dockerfile has:
```dockerfile
RUN apt-get update && apt-get install -y git cmake build-essential
```
This MUST come before the liboqs build step.

---

### Issue 2: "No oqs shared libraries found" 

**Root Cause:** liboqs compiled but not in ctypes search path.

**Solutions (in order):**

**A) Verify library installation** (in Dockerfile):
```dockerfile
RUN ldconfig -p | grep liboqs
```

**B) Copy to guaranteed location**:
```dockerfile
RUN cp /usr/local/lib/liboqs* /usr/lib/
RUN ldconfig
```

**C) Add to LD_LIBRARY_PATH**:
```dockerfile
ENV LD_LIBRARY_PATH=/usr/local/lib:/usr/lib:$LD_LIBRARY_PATH
```

---

### Issue 3: Dockerfile not detected by Railway

**Check:**
1. Is `Dockerfile` in the project root or `dilithium-signing-portal/` root?
   - Railway looks in the `rootDirectory` specified in `railway.json`
2. Is the filename exactly `Dockerfile` (capital D)?
3. Try rebuilding the service in Railway dashboard (don't just redeploy)

**If Procfile is being used instead:**
```bash
# Remove Procfile or move it
mv Procfile Procfile.backup

# Commit and push
git add Procfile.backup
git commit -m "Use Dockerfile instead of Procfile"
git push
```

---

### Issue 4: "pip install liboqs-python" fails even though liboqs is compiled

**Cause:** Library found during compilation, but not during import.

**Fix:** Rebuild Python wrapper AFTER ensuring library is discoverable:
```dockerfile
# 1. Build liboqs
RUN ... (build liboqs)

# 2. Copy to standard location and refresh cache
RUN cp /usr/local/lib/liboqs* /usr/lib/
RUN ldconfig

# 3. Now install Python wrapper
RUN pip install --no-cache-dir -r requirements.txt

# 4. Verify import
RUN python3 -c "import oqs; print('OK')"
```

---

## Deployment Decision Tree

```
Does Dockerfile build locally? 
  ├─ NO  → Fix Dockerfile syntax errors
  └─ YES → Does import oqs work in container?
       ├─ NO  → Is library in /usr/lib? → If NO, add: RUN cp /usr/local/lib/liboqs* /usr/lib/
       └─ YES → Does API start successfully?
           ├─ NO  → Check main.py for errors (not liboqs-related)
           └─ YES → Ready for Railway!
                    - Push to GitHub
                    - In Railway dashboard: Rebuild service
                    - Monitor logs for "Uvicorn running on"
```

---

## Monitoring in Railway

**View logs after deployment:**
1. Go to Railway dashboard
2. Select your service
3. Click "Logs" tab
4. Look for:
   - ✅ `Uvicorn running on http://0.0.0.0:8000`
   - ✅ `Application startup complete`
   - ❌ `git: not found`
   - ❌ `liboqs shared libraries`

**If failure:**
1. Click "Redeploy" to try again
2. Or manually trigger rebuild by pushing to `main` branch

---

## Nuclear Option: Pre-Built Liboqs Wheel

If all else fails, pre-compile liboqs-python on a machine with liboqs installed:

```bash
# On a Linux machine with liboqs already installed:
pip wheel liboqs-python==0.14.1 --no-deps -w ./wheels/

# Then in requirements.txt, reference the wheel:
./wheels/liboqs_python-0.14.1-cp312-cp312-linux_x86_64.whl
```

Then Dockerfile:
```dockerfile
COPY wheels ./wheels
RUN pip install --no-cache-dir -r requirements.txt
```

---

## Quick Verification Commands

```bash
# Check if liboqs library is visible to ctypes (what liboqs-python uses)
python3 -c "
import ctypes
import sys
try:
    lib = ctypes.CDLL('liboqs.so')
    print('✅ liboqs library found by ctypes')
except Exception as e:
    print(f'❌ ctypes cannot find liboqs: {e}')
    sys.exit(1)
"

# Check if ldconfig sees it
ldconfig -p | grep liboqs

# Check library dependencies
ldd /usr/local/lib/liboqs.so
```

---

## Need Help?

Check these:
1. **Dockerfile in correct location**: `./Dockerfile` (project root)
2. **Railway rootDirectory**: `dilithium-signing-portal` in `railway.json`
3. **Build tools present**: `git`, `cmake`, `build-essential`
4. **Library in searchable location**: `/usr/lib` or `/usr/local/lib` with ldconfig updated
5. **LD_LIBRARY_PATH set**: `ENV LD_LIBRARY_PATH=/usr/local/lib:/usr/lib:$LD_LIBRARY_PATH`
