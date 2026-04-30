# Cloud Deployment: liboqs & Platform Selection

## ⚠️ The liboqs Challenge

liboqs is a **C library** that requires:
- ✅ CMake (build tool)
- ✅ C compiler (gcc/clang)
- ✅ pkg-config
- ⏱️ 2-3 minutes to compile on the cloud server
- 📦 ~100MB of build artifacts

**Regular pip packages** just download precompiled binaries. **liboqs-python** downloads the Python wrapper but needs the **C library compiled on the target system**.

---

## 🚀 Railway.app - Will It Work?

**Short Answer**: ✅ **YES, but with config**

### How It Works on Railway

1. Railway detects `Procfile` in your repo
2. Installs Python and Node
3. Runs `release` phase: **Builds liboqs** (2-3 minutes)
4. Runs `web` phase: **Starts your app**
5. App is live!

### What You Need

Create these files (I already created them):

```
/Procfile                        ← Instructions for platform
/scripts/build_liboqs.sh        ← Build script
/backend/requirements.txt       ← Python dependencies
/frontend/package.json          ← Node dependencies
```

✅ **All created!** Your repo is ready for Railway.

### Railway Deployment Steps

```bash
# 1. Push to GitHub (including Procfile & scripts/build_liboqs.sh)
git add .
git commit -m "Add cloud deployment config"
git push origin main

# 2. Go to railway.app
# 3. New Project → GitHub
# 4. Select your repo
# 5. Railway auto-detects Procfile
# 6. Deploys!
```

**Timeline:**
- 2 min: Building liboqs
- 1 min: Installing dependencies
- 1 min: Building frontend
- Result: Live app! ✅

---

## 🎨 Render.com - Can You Use It?

**Short Answer**: ⚠️ **Technically yes, but limited**

### Render Limitations

| Feature | Railway | Render |
|---------|---------|--------|
| **Free Tier** | ✅ Generous | ⚠️ Limited |
| **Build Time** | ✅ Unlimited | ❌ 30 min limit |
| **Auto-sleep** | ❌ Always on | ✅ Sleeps after 15min |
| **liboqs Build** | ✅ 2-3 min | ⚠️ Fits (barely) |
| **Cost** | FREE | FREE |
| **For Production** | ✅ Good | ❌ Not suitable |

### Why Render is Problematic

1. **Auto-sleep after 15 minutes idle** = Users experience 30-60s wake-up delay
2. **Free tier CPU is slow** = liboqs build takes longer
3. **Limited free hours** = Only good for testing

### If You Want to Use Render

```yaml
# render.yaml (in root directory)
services:
  - type: web
    name: quantum-portal
    env: python
    buildCommand: bash scripts/build_liboqs.sh && npm install --prefix frontend && npm run build --prefix frontend
    startCommand: cd backend && python main.py
    envVars:
      - key: LD_LIBRARY_PATH
        value: /root/.liboqs/lib
```

**Result**: App deploys, but sleeps when inactive. Not great for demos.

---

## 📊 Platform Comparison for liboqs

| Platform | Build Support | Build Time | Cost | Recommendation |
|----------|---------------|-----------|------|-----------------|
| **Railway** | ✅ Perfect | 5-7 min | FREE | 🏆 **Use this** |
| **Render** | ⚠️ Works | 8-10 min | FREE | ❌ Auto-sleeps |
| **AWS** | ✅ Perfect | 5-7 min | $0 (free tier) | ✅ Long-term |
| **Azure** | ✅ Perfect | 5-7 min | $0 (free tier) | ✅ Long-term |
| **Heroku** | ✅ Works | 5-7 min | ❌ Paid only | Not free |

---

## 🎯 Deployment Readiness Checklist

I've created the necessary files for you:

- ✅ `/Procfile` - Platform instructions
- ✅ `/scripts/build_liboqs.sh` - Build script
- ✅ `/backend/requirements.txt` - Python deps
- ✅ `/frontend/package.json` - Node deps
- ✅ `/.buildpacks` - Buildpack config

**Your repo is deployment-ready!**

---

## 🚀 Choose Your Platform

### Option A: Railway (Easiest)
```bash
1. git push origin main
2. Go to railway.app
3. New Project → GitHub
4. Select repo
5. Done! (5 minutes)
```
**Cost**: FREE  
**Best for**: Demos, quick testing  

### Option B: AWS/Azure (Best Long-term)
```bash
1. Create EC2/VM instance
2. SSH into server
3. Run deployment script (provided in FREE_DEPLOYMENT.md)
4. Set up Nginx + SSL
5. Done! (30 minutes)
```
**Cost**: $0 for 12 months  
**Best for**: Portfolio, long-term  

### Option C: Render (Not Recommended)
```bash
1. Create render.yaml
2. Push to GitHub
3. Connect GitHub
4. Deploy
```
**Cost**: FREE  
**Best for**: Quick testing ONLY (auto-sleeps)  
**Warning**: App sleeps after 15min inactivity  

---

## 📝 How liboqs Build Works

### On Railway (when you deploy)

```
1. Railway detects Procfile
2. Runs "release" phase:
   - Installs build-essential, cmake, gcc
   - Clones liboqs repo
   - cmake .. && make -j4 && make install
   - Verifies installation
   - ~3 minutes elapsed
3. Runs "web" phase:
   - Starts Python backend with LD_LIBRARY_PATH set
   - Serves frontend files
4. App is live! ✅
```

### Why This Works

- ✅ Railway gives you **full Linux environment**
- ✅ Can compile C libraries
- ✅ Build phase persists (no re-compilation on each request)
- ✅ Runtime just loads pre-built library

### Why Pre-compiled Wheels Don't Work

The `liboqs-python` package on PyPI is just Python bindings. It expects the **C library (liboqs)** to already exist on the system. Cloud platforms don't have it by default, so we **must build it**.

---

## 🔧 Environment Variables for Cloud

### Railway Auto-Sets

Railway automatically sets:
- `PYTHON_VERSION=3.12`
- `NODE_VERSION=20`
- `PORT=5000` (for backend)

### What You May Need to Set

In Railway Dashboard → Variables:

```
LD_LIBRARY_PATH=/root/.liboqs/lib
PYTHONUNBUFFERED=1
NODE_ENV=production
```

---

## 🧪 Testing Deployment Locally

Before deploying to cloud, test locally:

```bash
# Simulate Railway build locally
cd dilithium-signing-portal

# Run build script
bash scripts/build_liboqs.sh

# Test backend
cd backend
source venv/bin/activate
python main.py

# In another terminal, test frontend
cd frontend
npm run build
npm run preview
```

If it works locally, it will work on Railway! ✅

---

## 💡 My Recommendation

### For You RIGHT NOW

**Use Railway** ✅

Why:
1. Takes 5 minutes
2. Automatically handles liboqs build
3. Perfect for demos
4. FREE
5. No credit card needed

### Step-by-Step

```bash
# 1. Make sure code is committed and pushed
cd ~/postquantumdocument/dilithium-signing-portal
git status  # Should be clean

# If not:
git add .
git commit -m "Add cloud deployment config"
git push origin main

# 2. Go to railway.app
# 3. Sign up with GitHub
# 4. New Project → GitHub → Select your repo
# 5. Wait 5-7 minutes while liboqs builds
# 6. Get live URL!
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Module oqs not found"
**Cause**: liboqs not built  
**Fix**: Make sure Procfile exists and has `release: bash scripts/build_liboqs.sh`

### Issue: "Build timeout after 30 minutes"
**Cause**: Render has 30 min build limit  
**Fix**: Use Railway instead (no time limit)

### Issue: "liboqs build takes too long"
**Cause**: Slow cloud CPU  
**Fix**: Expected! Builds take 2-5 minutes. Just wait.

### Issue: "LD_LIBRARY_PATH not set"
**Cause**: Platform didn't apply environment variable  
**Fix**: Add to Procfile or platform dashboard

---

## 📚 Files Created for Cloud Deployment

```
your-repo/
├── Procfile                          ← Platform instructions
├── .buildpacks                       ← Buildpack config
├── scripts/
│   └── build_liboqs.sh              ← Build script
├── backend/
│   ├── requirements.txt             ← Already existed
│   └── main.py
└── frontend/
    ├── package.json                 ← Already existed
    └── vite.config.js
```

**Status**: ✅ All files ready for deployment!

---

## 🎓 Next Steps

1. **Test locally** (optional):
   ```bash
   bash scripts/build_liboqs.sh
   ```

2. **Push to GitHub** (if not already):
   ```bash
   git add Procfile scripts/.buildpacks
   git commit -m "Add deployment config"
   git push origin main
   ```

3. **Deploy to Railway**:
   - Go to railway.app
   - Connect GitHub
   - Select your repo
   - Wait 5-7 minutes
   - Get live URL!

4. **Share with professor**:
   - Send them the live URL
   - They can use it right away!

---

**TL;DR**: Railway will automatically download, build, and deploy liboqs. No additional configuration needed beyond the Procfile and build script (which I've created). Render works but auto-sleeps, so Railway is better for you.

Ready to deploy? 🚀
