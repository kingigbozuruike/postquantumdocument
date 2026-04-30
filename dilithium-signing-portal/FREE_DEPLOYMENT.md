# FREE Deployment Guide: Quantum-Safe Signing Portal

## 🎯 Best FREE Options

| Option | Cost | Uptime | Setup Time | Best For |
|--------|------|--------|-----------|----------|
| **Railway.app** | FREE tier | 99%+ | 5 minutes | 🏆 **Best for demos** |
| **AWS Free Tier** | $0 (12 months) | 99.9%+ | 30 minutes | Production-quality |
| **Azure Free Tier** | $0 (12 months) | 99.9%+ | 30 minutes | Production-quality |
| **Render.com** | FREE tier (limited) | 95% | 10 minutes | Quick testing |
| **Your Laptop** | $0 | 100% (if running) | Already done! | Demos, development |

---

## 🚀 Option 1: Railway.app (EASIEST - 5 MINUTES)

Railway has the **most generous free tier** and **simplest setup**.

### Free Tier Benefits
✅ 5 GB storage  
✅ $5 credit/month (usually enough for this app)  
✅ Auto-deploys from GitHub  
✅ Automatic SSL/HTTPS  
✅ No credit card required (initially)  

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not done)
cd /Users/user1/postquantumdocument/dilithium-signing-portal
git init
git add .
git commit -m "Initial commit: Quantum-safe signing portal"

# Create GitHub repo at github.com/yourusername/dilithium-signing-portal
git branch -M main
git remote add origin https://github.com/yourusername/dilithium-signing-portal.git
git push -u origin main
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your `dilithium-signing-portal` repository
6. Click "Deploy"

### Step 3: Add Environment Variables

In Railway dashboard:
1. Click your project
2. Go to "Variables"
3. Add:
   ```
   PYTHON_VERSION=3.12
   NODE_VERSION=20
   ```

### Step 4: Wait for Deploy (2-3 minutes)

Railway automatically:
- Detects Python backend
- Installs dependencies
- Builds frontend
- Deploys everything
- Assigns you a live URL

### Result
🎉 Your app is live at: `https://yourdomain.up.railway.app`

---

## 🔐 Option 2: AWS Free Tier (BEST FOR LONG-TERM)

AWS gives **12 months of free** compute + storage.

### What's Free (12 months)
✅ EC2 t2.micro instance (0.75 GB RAM)  
✅ 30 GB storage  
✅ 1 GB data transfer  
✅ Elastic IP address  
⚠️ After 12 months: ~$10-15/month if you keep it running  

### Step 1: Create AWS Account

1. Go to [aws.amazon.com/free](https://aws.amazon.com/free)
2. Click "Create a free account"
3. Provide email, password, payment method (charged $0)

### Step 2: Launch EC2 Instance

```bash
# In AWS Console:
1. Services → EC2
2. Launch Instance
3. Select: Ubuntu 22.04 LTS (free tier eligible)
4. Instance Type: t2.micro (free tier eligible)
5. Key Pair: Create new → download `.pem` file
6. Storage: 30 GB (free tier eligible)
7. Security Group: Allow ports 80, 443, 22
8. Launch
```

### Step 3: Connect to Server

```bash
# From your laptop (in the directory with your .pem file)
chmod 400 your-key-pair.pem
ssh -i your-key-pair.pem ubuntu@your-ec2-public-ip

# Example:
ssh -i ~/Downloads/quantum-key.pem ubuntu@54.123.45.67
```

### Step 4: Run Deployment Script

```bash
# On your EC2 instance:
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-venv python3-pip \
  nodejs npm git curl cmake pkg-config build-essential

# Clone your repo
cd /opt
sudo git clone https://github.com/yourusername/dilithium-signing-portal.git
cd dilithium-signing-portal/dilithium-signing-portal

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Build liboqs
cd /tmp
git clone https://github.com/open-quantum-safe/liboqs.git
cd liboqs && mkdir build && cd build
cmake -DCMAKE_INSTALL_PREFIX=$HOME/postquantumdocument/backend/venv ..
make -j$(nproc) && make install
ldconfig --print-cache | grep oqs

# Setup frontend
cd ~/dilithium-signing-portal/frontend
npm install
npm run build

# Start backend with systemd
sudo tee /etc/systemd/system/quantum-backend.service > /dev/null <<EOF
[Unit]
Description=Quantum Portal Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/dilithium-signing-portal/dilithium-signing-portal/backend
Environment="LD_LIBRARY_PATH=/home/ubuntu/postquantumdocument/backend/venv/lib"
ExecStart=/opt/dilithium-signing-portal/dilithium-signing-portal/backend/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable quantum-backend
sudo systemctl start quantum-backend

# Setup Nginx
sudo apt install -y nginx

sudo tee /etc/nginx/sites-available/quantum > /dev/null <<EOF
upstream backend {
    server localhost:8000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /opt/dilithium-signing-portal/dilithium-signing-portal/frontend/dist;
        try_files \$uri /index.html;
    }

    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/quantum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get free SSL with Certbot
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Result
🎉 Your app is live at: `https://your-domain.com`  
💰 Cost: **$0 for 12 months**

---

## 🌐 Option 3: Azure Free Tier (ALSO GREAT)

Similar to AWS, gives **12 months free**.

### What's Free (12 months)
✅ 1 B1S VM (1 GB RAM)  
✅ 128 GB managed disk  
✅ Free SQL Database (limited)  
✅ Free App Service (720 hours)  

### Quick Setup

```bash
# Install Azure CLI
brew install azure-cli

# Login
az login

# Create resource group
az group create --name quantum-portal --location eastus

# Create VM
az vm create \
  --resource-group quantum-portal \
  --name quantum-vm \
  --image UbuntuLTS \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys

# Then follow same backend/frontend setup as AWS above
```

---

## 💡 Option 4: Render.com (LIMITED FREE)

Render has a **free tier with limitations**:
- Auto-sleeps after 15 minutes of inactivity
- 100 GB/month bandwidth
- Suitable for demos only

Not recommended for production, but great for quick testing.

---

## 📊 Comparison: Free Tier Limits

| Feature | Railway | AWS (12mo) | Azure (12mo) | Render |
|---------|---------|-----------|-------------|--------|
| **Cost** | FREE | $0 | $0 | FREE |
| **RAM** | Shared | 1 GB | 1 GB | Shared |
| **CPU** | 0.5 vCPU | 1 vCPU | 1 vCPU | 0.5 vCPU |
| **Storage** | 5 GB | 30 GB | 128 GB | 0.5 GB |
| **Uptime** | 99%+ | 99.9%+ | 99.9%+ | 95% |
| **Auto-Sleep** | No | No | No | Yes ❌ |
| **Setup Time** | 5 min | 30 min | 30 min | 10 min |
| **Best For** | Quick demos | Long-term | Long-term | Testing |

---

## 🎓 My Recommendation

### For Your Professor Demo:
**Use Railway.app** ✅
- Takes 5 minutes
- No credit card needed
- Perfect for showing your work
- Free domain assigned

### For Long-Term Portfolio:
**Use AWS or Azure Free Tier** ✅
- $0 for 12 months
- More powerful (1 GB RAM vs shared)
- Can scale later if needed
- Great for resume/portfolio

### Right Now (Development):
**Keep Using Your Laptop** ✅
- Already running on http://localhost:5173
- Perfect for testing and demoing
- No network latency
- Full control

---

## 🚀 QUICKEST DEPLOYMENT (5 MINUTES)

### If you just want it live NOW:

```bash
# 1. Create GitHub repo
git init
git add .
git commit -m "Quantum signing portal"
git remote add origin https://github.com/yourusername/quantum-portal.git
git push -u origin main

# 2. Go to railway.app
# 3. Click "New Project" → "Deploy from GitHub"
# 4. Select your repo
# 5. Wait 2-3 minutes
# 6. Get live URL

# Done! ✅
```

That's literally it for Railway. No configuration needed.

---

## ⚠️ Important Notes

### For liboqs to work on cloud servers:
- Make sure to build liboqs with correct prefix
- Set `LD_LIBRARY_PATH` in systemd service
- Test with: `python -c "import oqs; print(oqs.Signature('ML-DSA-65'))"`

### For custom domain:
- Buy domain from: Namecheap, GoDaddy, or Route53
- Point to your server IP or Railway domain
- AWS Route53: ~$0.50/month
- Certbot SSL: FREE (auto-renewal)

### Database (you don't need one):
- This app has no database
- Everything is stateless crypto operations
- No persistent data to backup
- Perfect for serverless/simple deployment

---

## 📝 Cost Comparison

```
Laptop (current):     $0/month ✅
Railway.app:         FREE (then $5-20/month if needed)
AWS 12 months:       $0/month (free tier only) ✅
Azure 12 months:     $0/month (free tier only) ✅
AWS after 12 mo:     ~$10-15/month
Azure after 12 mo:   ~$10-15/month
DigitalOcean VPS:    $4-6/month
Heroku:              ❌ Discontinued
```

---

## 🎯 Next Steps

1. **For demo to professor**: Use Railway (5 minutes) or keep using laptop
2. **For portfolio**: Deploy to AWS/Azure free tier (30 minutes)
3. **For long-term**: Set up Render with auto-renewal SSL

Choose based on your timeline! 🚀

---

**Updated**: April 30, 2026
