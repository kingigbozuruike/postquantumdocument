from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crypto import generate_keys, sign_document, verify_document
import time

app = FastAPI(title="Dilithium Signing Portal API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request bodies
class SignRequest(BaseModel):
    private_key: str
    document: str


class VerifyRequest(BaseModel):
    public_key: str
    document: str
    signature: str


@app.get("/health")
def get_health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/api/generate-keys")
def generate_keys_endpoint():
    """
    Generate a new Dilithium3 public/private key pair.
    
    Returns:
        dict: { "public_key": <hex string>, "private_key": <hex string> }
    """
    result = generate_keys()
    
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    
    return result


@app.post("/api/sign")
def sign_endpoint(request: SignRequest):
    """
    Sign a document using the provided private key.
    
    Args:
        request: { "private_key": <hex string>, "document": <text> }
    
    Returns:
        dict: { "signature": <hex string>, "document": <original text>, "performance": {...} }
    """
    # Measure signing time
    start_time = time.perf_counter()
    result = sign_document(request.private_key, request.document)
    elapsed_time = (time.perf_counter() - start_time) * 1000  # Convert to ms
    
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    
    # Add performance metrics
    document_bytes = len(request.document.encode('utf-8'))
    signature_bytes = len(result["signature"]) // 2  # Hex string to bytes
    
    result["performance"] = {
        "signing_time_ms": round(elapsed_time, 2),
        "document_size_bytes": document_bytes,
        "document_size_kb": round(document_bytes / 1024, 2),
        "signature_size_bytes": signature_bytes,
        "signature_size_kb": round(signature_bytes / 1024, 2),
        "throughput_mbps": round((document_bytes / 1024 / 1024) / (elapsed_time / 1000), 2) if elapsed_time > 0 else 0
    }
    
    return result


@app.post("/api/verify")
def verify_endpoint(request: VerifyRequest):
    """
    Verify a document signature using the provided public key.
    
    Args:
        request: { "public_key": <hex string>, "document": <text>, "signature": <hex string> }
    
    Returns:
        dict: { "valid": <boolean>, "message": <human-readable result>, "performance": {...} }
    """
    # Measure verification time
    start_time = time.perf_counter()
    result = verify_document(request.public_key, request.document, request.signature)
    elapsed_time = (time.perf_counter() - start_time) * 1000  # Convert to ms
    
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    
    # Add performance metrics
    document_bytes = len(request.document.encode('utf-8'))
    signature_bytes = len(request.signature) // 2  # Hex string to bytes
    
    result["performance"] = {
        "verification_time_ms": round(elapsed_time, 2),
        "document_size_bytes": document_bytes,
        "document_size_kb": round(document_bytes / 1024, 2),
        "signature_size_bytes": signature_bytes,
        "signature_size_kb": round(signature_bytes / 1024, 2),
        "throughput_mbps": round((document_bytes / 1024 / 1024) / (elapsed_time / 1000), 2) if elapsed_time > 0 else 0
    }
    
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
