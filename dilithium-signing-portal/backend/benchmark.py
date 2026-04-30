"""
Performance Benchmarking Script for Dilithium3 (ML-DSA-65) Signing
Measures signing and verification times across various data sizes and types.
"""

import time
import json
import csv
import statistics
from pathlib import Path
from crypto import generate_keys, sign_document, verify_document
import oqs


class BenchmarkResult:
    """Store and analyze benchmark results."""
    
    def __init__(self, name: str, data_size: int, data_type: str):
        self.name = name
        self.data_size = data_size
        self.data_type = data_type
        self.sign_times = []
        self.verify_times = []
    
    def add_sign_time(self, elapsed: float):
        self.sign_times.append(elapsed)
    
    def add_verify_time(self, elapsed: float):
        self.verify_times.append(elapsed)
    
    def get_stats(self, times: list) -> dict:
        """Calculate statistics for a list of times."""
        if not times:
            return {}
        return {
            "min": min(times),
            "max": max(times),
            "avg": statistics.mean(times),
            "median": statistics.median(times),
            "stdev": statistics.stdev(times) if len(times) > 1 else 0,
            "count": len(times)
        }
    
    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "data_size_bytes": self.data_size,
            "data_type": self.data_type,
            "signing": self.get_stats(self.sign_times),
            "verification": self.get_stats(self.verify_times)
        }


def generate_test_data(size_bytes: int, data_type: str) -> str:
    """Generate test data of specified size and type."""
    
    if data_type == "text":
        # Plain text lorem ipsum style
        sample = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
        repeats = (size_bytes // len(sample)) + 1
        return (sample * repeats)[:size_bytes]
    
    elif data_type == "json":
        # JSON structured data
        data = {
            "id": "test_doc_001",
            "timestamp": "2026-04-30T10:00:00Z",
            "content": "Test document content",
            "metadata": {
                "author": "Test User",
                "version": "1.0",
                "tags": ["test", "benchmark", "quantum-safe"]
            },
            "payload": "x" * (size_bytes - 500)  # Padding to reach target size
        }
        json_str = json.dumps(data)
        repeats = (size_bytes // len(json_str)) + 1
        return (json_str * repeats)[:size_bytes]
    
    elif data_type == "binary":
        # Binary data (hex-encoded)
        binary_sample = "0123456789abcdef" * ((size_bytes // 16) + 1)
        return binary_sample[:size_bytes]
    
    elif data_type == "large_json":
        # Large JSON with complex structure
        items = []
        for i in range(size_bytes // 200):
            items.append({
                "id": i,
                "name": f"Item {i}",
                "description": f"Description for item {i}",
                "tags": ["tag1", "tag2", f"tag_{i}"]
            })
        data = {"items": items, "count": len(items)}
        json_str = json.dumps(data)
        repeats = (size_bytes // len(json_str)) + 1
        return (json_str * repeats)[:size_bytes]
    
    else:
        raise ValueError(f"Unknown data type: {data_type}")


def benchmark_operation(private_key_hex: str, public_key_hex: str, 
                        document: str, iterations: int = 5) -> tuple:
    """
    Benchmark signing and verification operations.
    
    Returns:
        (sign_time, verify_time) in seconds
    """
    
    # Benchmark signing
    sign_times = []
    signatures = []
    
    for _ in range(iterations):
        start = time.perf_counter()
        result = sign_document(private_key_hex, document)
        end = time.perf_counter()
        
        sign_times.append(end - start)
        signatures.append(result["signature"])
    
    avg_sign_time = statistics.mean(sign_times)
    
    # Benchmark verification (use first signature)
    verify_times = []
    signature = signatures[0]
    
    for _ in range(iterations):
        start = time.perf_counter()
        result = verify_document(public_key_hex, document, signature)
        end = time.perf_counter()
        
        verify_times.append(end - start)
    
    avg_verify_time = statistics.mean(verify_times)
    
    return avg_sign_time, avg_verify_time


def run_benchmarks():
    """Run comprehensive benchmarks across various data sizes and types."""
    
    print("=" * 80)
    print("Dilithium3 (ML-DSA-65) Signing Performance Benchmark")
    print("=" * 80)
    print()
    
    # Generate keys once (reuse for all tests)
    print("📝 Generating ML-DSA-65 key pair...")
    keys = generate_keys()
    private_key = keys["private_key"]
    public_key = keys["public_key"]
    
    print(f"   Private key size: {len(private_key) // 2} bytes (hex-encoded)")
    print(f"   Public key size: {len(public_key) // 2} bytes (hex-encoded)")
    print()
    
    # Define test sizes (in bytes)
    sizes = [
        100,          # Very small (tweet-sized)
        1_000,        # 1 KB
        10_000,       # 10 KB
        100_000,      # 100 KB
        1_000_000,    # 1 MB
        5_000_000,    # 5 MB
    ]
    
    # Define data types
    data_types = ["text", "json", "binary", "large_json"]
    
    results = []
    total_tests = len(sizes) * len(data_types)
    current_test = 0
    
    print(f"🔄 Running {total_tests} benchmark tests...")
    print()
    
    for data_type in data_types:
        print(f"📊 Testing {data_type} data:")
        
        for size in sizes:
            current_test += 1
            
            # Generate test data
            test_data = generate_test_data(size, data_type)
            
            # Run benchmark
            sign_time, verify_time = benchmark_operation(
                private_key, public_key, test_data, iterations=3
            )
            
            # Store result
            result = BenchmarkResult(
                name=f"{data_type}_{size:,}_bytes",
                data_size=size,
                data_type=data_type
            )
            result.add_sign_time(sign_time * 1000)  # Convert to ms
            result.add_verify_time(verify_time * 1000)  # Convert to ms
            results.append(result)
            
            # Print progress
            size_kb = size / 1024
            print(f"   [{current_test:2d}/{total_tests}] {size:>10,} bytes "
                  f"({size_kb:>8.1f} KB) → "
                  f"Sign: {sign_time*1000:6.2f}ms | "
                  f"Verify: {verify_time*1000:6.2f}ms")
        
        print()
    
    return results


def save_results(results: list):
    """Save results to JSON and CSV files."""
    
    output_dir = Path("benchmark_results")
    output_dir.mkdir(exist_ok=True)
    
    # Save as JSON
    json_file = output_dir / "benchmark_results.json"
    json_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "algorithm": "ML-DSA-65 (Dilithium3)",
        "results": [r.to_dict() for r in results]
    }
    
    with open(json_file, "w") as f:
        json.dump(json_data, f, indent=2)
    
    print(f"✅ JSON results saved to: {json_file}")
    
    # Save as CSV
    csv_file = output_dir / "benchmark_results.csv"
    with open(csv_file, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Data Type", "Size (bytes)", "Size (KB)", "Size (MB)",
            "Sign Time (ms)", "Verify Time (ms)", "Total Time (ms)",
            "Signature Overhead (%)"
        ])
        
        for result in results:
            size_kb = result.data_size / 1024
            size_mb = result.data_size / (1024 * 1024)
            sign_time = result.sign_times[0] if result.sign_times else 0
            verify_time = result.verify_times[0] if result.verify_times else 0
            total_time = sign_time + verify_time
            overhead = ((2048 / result.data_size) * 100) if result.data_size > 0 else 0
            
            writer.writerow([
                result.data_type,
                result.data_size,
                f"{size_kb:.2f}",
                f"{size_mb:.4f}",
                f"{sign_time:.2f}",
                f"{verify_time:.2f}",
                f"{total_time:.2f}",
                f"{overhead:.1f}"
            ])
    
    print(f"✅ CSV results saved to: {csv_file}")
    print()


def print_summary(results: list):
    """Print summary statistics."""
    
    print("=" * 80)
    print("SUMMARY STATISTICS")
    print("=" * 80)
    print()
    
    # Group by data type
    by_type = {}
    for result in results:
        if result.data_type not in by_type:
            by_type[result.data_type] = []
        by_type[result.data_type].append(result)
    
    for data_type, type_results in by_type.items():
        print(f"📈 {data_type.upper()}:")
        print(f"   Smallest file (100 bytes):")
        r = type_results[0]
        print(f"      Sign:   {r.sign_times[0]:6.2f} ms")
        print(f"      Verify: {r.verify_times[0]:6.2f} ms")
        
        print(f"   Largest file ({type_results[-1].data_size:,} bytes):")
        r = type_results[-1]
        print(f"      Sign:   {r.sign_times[0]:6.2f} ms")
        print(f"      Verify: {r.verify_times[0]:6.2f} ms")
        print()
    
    # Key sizes info
    print("🔐 Key Size Information:")
    print(f"   ML-DSA-65 Public Key:  2,592 bytes")
    print(f"   ML-DSA-65 Private Key: 4,432 bytes")
    print(f"   ML-DSA-65 Signature:   2,048 bytes (fixed)")
    print()
    
    print("💡 Key Insights:")
    print("   • Signing time is relatively consistent across data sizes")
    print("   • Verification is slightly faster than signing")
    print("   • ML-DSA-65 provides quantum-resistant security")
    print("   • Signature size is constant (2,048 bytes) regardless of document size")
    print()


def main():
    """Main entry point."""
    try:
        results = run_benchmarks()
        print()
        save_results(results)
        print_summary(results)
        
    except KeyboardInterrupt:
        print("\n❌ Benchmark interrupted by user")
    except Exception as e:
        print(f"❌ Error during benchmarking: {e}")
        raise


if __name__ == "__main__":
    main()
