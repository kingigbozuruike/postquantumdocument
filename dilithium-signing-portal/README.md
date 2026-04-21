# Dilithium Signing Portal

A full-stack web application for post-quantum cryptography signing using Dilithium

## Project Structure

```
/dilithium-signing-portal
├── /backend           - FastAPI backend
│   ├── main.py       - FastAPI app with routes
│   ├── crypto.py     - Cryptographic utilities
│   └── requirements.txt
├── /frontend         - Vite + React frontend
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The API will run at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server will run at `http://localhost:5173`

## Endpoints

- `GET /health` - Health check endpoint

## Technologies

- **Backend**: FastAPI, Python, Dilithium (via python-oqs)
- **Frontend**: React, Vite, Tailwind CSS
