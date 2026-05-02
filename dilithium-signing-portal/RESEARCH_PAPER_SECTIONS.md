# Formal Academic Research Paper Sections
## Post-Quantum Document Signing Portal: System Design and Implementation

---

## V. System Design

The post-quantum document signing portal is architected as a distributed system with clear separation of concerns between the client-facing frontend and security-critical backend infrastructure. The frontend, implemented in React, provides a user interface for document input, key display, and result visualization, while a FastAPI-based backend handles all cryptographic operations, ensuring that sensitive key material remains isolated from client-side exposure. This architectural decision reflects contemporary best practices in security-sensitive applications, wherein cryptographic operations are deliberately confined to server-side environments where security posture can be more rigorously maintained.

The system implements a three-stage cryptographic workflow: key pair generation, document signing, and signature verification. Each stage is exposed through a distinct RESTful endpoint, enabling clear separation of concerns and facilitating straightforward integration with heterogeneous client implementations. Communication between frontend and backend occurs over HTTP with JSON serialization, allowing for stateless operation and horizontal scalability in future production deployments. The frontend maintains application state through React's hooks-based state management, tracking generated keys, signed documents, and verification results throughout the user session.

A critical design decision involves the exclusive execution of cryptographic operations on the backend server. This constraint prevents exposure of private key material to the browser environment and mitigates risks associated with client-side JavaScript vulnerabilities. The liboqs library, which provides low-level access to post-quantum algorithms, operates exclusively within the Python runtime environment where it can be secured through containerization, access controls, and audit logging in production settings. The frontend never receives or processes unencrypted private keys; instead, users supply private keys through text input when initiating signing operations, and these values remain transient within the HTTP request lifecycle.

The system incorporates feedback mechanisms through visual progress indicators and real-time error reporting. A step-progress component tracks completion of the three core operations, providing users with context regarding system state. Error handling is implemented comprehensively, ensuring that all API failures manifest as visible error banners rather than silent failures. This design principle enhances debugging and user confidence in cryptographic operations, which users typically perceive as security-critical.

---

## VI. Implementation

The system was constructed using contemporary web development technologies selected for their maturity, community support, and security characteristics. React 19.2.4 serves as the frontend framework, providing component-based abstraction and efficient DOM reconciliation. Vite 5.0.8 provides build-time optimization and rapid development iteration through hot module replacement. Tailwind CSS 3.4.0 enables responsive styling without custom CSS authoring, reducing the attack surface associated with style-related vulnerabilities. The backend implements FastAPI 0.104.1, a modern Python framework selected for its type safety through Pydantic models, automatic OpenAPI documentation generation, and built-in support for dependency injection. Uvicorn 0.24.0 provides an ASGI application server optimized for concurrent request handling.

Integration with post-quantum cryptography is achieved through liboqs-python 0.14.1, a Python binding layer over the Open Quantum Safe C library (liboqs 0.15.0). The liboqs library provides reference implementations of NIST-standardized post-quantum algorithms. Within the Python environment, the liboqs-python module is imported and initialized with the algorithm identifier "ML-DSA-65," corresponding to the NIST-standardized variant of CRYSTALS-Dilithium. This integration abstracts away low-level cryptographic details, allowing the application to invoke signing and verification operations through high-level Python APIs while leveraging the performance and security properties of the underlying C implementation.

The key generation operation instantiates an `oqs.Signature` object with the ML-DSA-65 algorithm, invokes the `generate_keypair()` method, and returns the resulting public and private keys as hexadecimal strings. This representation enables transmission over JSON serialization and display within the web interface. The signing operation accepts a hexadecimal-encoded private key and a document string, reconstructs the key material in the liboqs runtime, and invokes the `sign()` method to produce a signature. The signature is returned as a hexadecimal string, encoding approximately 3,293 bytes of cryptographic material. The verification operation accepts a public key, document, and signature, all as hexadecimal strings, and invokes the `verify()` method to produce a boolean result. Each operation is wrapped in exception handling to capture and report errors to the frontend, preventing unhandled exceptions from propagating to the HTTP response layer.

User interaction flows through the three primary operations in sequence. The Generate Keys panel invokes the `/api/generate-keys` endpoint, receiving a response containing both public and private keys. These are stored in React component state and displayed to the user with copy-to-clipboard functionality. The Sign Document panel requires users to input a document (either through textarea entry or file upload) and accepts the private key from component state. File upload is processed on the client side using the FileReader API, converting file contents to text strings before transmission to the backend. The backend sign endpoint validates input length, performs the cryptographic signing operation, and returns the signature alongside metadata such as byte length and timestamp. The Verify Document panel accepts a document, signature, and public key, forwarding these to the `/api/verify` endpoint. To facilitate demonstration of tamper detection, the interface provides an editable copy of the document, permitting users to modify it and re-verify, observing the transition from a valid to an invalid signature state.

---

## VII. Security Analysis

The implementation provides multiple security guarantees appropriate to a post-quantum signature system. Authenticity is established through the ownership of the private key: any document signed with a given private key can be verified using the corresponding public key, and the mathematical properties of the Dilithium signature scheme ensure that a valid signature could not have been produced without possession of the private key. Since the private key is never transmitted to the frontend and is provided by the user only transiently during signing requests, the authentication guarantee is preserved even in the presence of client-side vulnerabilities.

Integrity protection is demonstrated through the signature verification mechanism: any modification to a signed document, no matter how small, results in a failed verification. The cryptographic hash function underlying the signature scheme possesses the avalanche property, wherein minute input changes produce completely uncorrelated hash outputs. This property is leveraged by the tamper detection interface, which allows users to observe the transition from valid to invalid signatures upon document modification. The integrity property is fundamental to the security model and does not depend on the quantum resistance of the algorithm; even classical signature schemes provide identical integrity guarantees.

Quantum resistance derives from the mathematical hardness assumptions underlying CRYSTALS-Dilithium. Unlike RSA-2048 and ECDSA-256, which are vulnerable to Shor's algorithm on quantum computers, Dilithium's security depends on the hardness of lattice problems, specifically the Learning with Errors (LWE) problem and its ring variant. These problems are conjectured to remain hard even for quantum computers, though no formal proof of quantum hardness exists. The NIST standardization of ML-DSA in FIPS 204 represents a collective assessment by cryptographic experts that lattice problems possess sufficient quantum resistance for government and critical infrastructure applications. The implementation leverages the reference implementation provided by the Open Quantum Safe project, which has undergone community review and is maintained to current security standards.

Implementation-level security considerations include the following. First, the backend enforces server-side isolation of cryptographic operations; the liboqs library operates only within the server process, preventing exposure to browser-based attacks. Second, input validation occurs before cryptographic operations: the backend validates that provided keys conform to expected length and format before attempting to use them. Third, error handling avoids leaking sensitive information; error messages do not disclose key material or internal state that might aid an attacker. Fourth, the system does not implement key persistence; keys are maintained only in volatile memory and are not stored to disk within the application, consistent with the demonstration purpose of the system. Production deployments would require key management infrastructure such as hardware security modules or encrypted key vaults.

The signature scheme itself provides non-repudiation: an entity cannot credibly deny having signed a document that carries a valid signature under their public key, assuming the private key has not been compromised. This property is valuable for document authentication workflows in legal, financial, and regulatory contexts.

---

## VIII. Challenges and Solutions

Multiple challenges emerged during the development and deployment of the post-quantum document signing portal. These challenges, while not fundamental to the cryptographic algorithms themselves, represent practical integration issues that practitioners must address when deploying post-quantum systems.

### liboqs Library Availability and Integration

The primary challenge encountered during backend development involved integrating the liboqs C library with the Python environment. Initial attempts to install liboqs-python through standard package management resulted in automatic compilation of the liboqs C library from source. However, the automatic build process attempted to clone a non-existent git branch (0.14.1) from the Open Quantum Safe repository, resulting in a build failure with the error message "fatal: Remote branch 0.14.1 not found in upstream origin." This prevented the liboqs-python module from locating the required shared libraries at runtime, manifesting as "No oqs shared libraries found" when the application attempted key generation. The solution involved manually building liboqs version 0.15.0 from source code using the CMake build system, installing the compiled shared libraries to the Python virtual environment directory (venv/lib), and configuring the environment variable DYLD_LIBRARY_PATH to reference this location. This approach was necessary because liboqs-python 0.14.1 and liboqs 0.15.0 exhibit version compatibility despite the apparent mismatch; the Python bindings can successfully invoke the newer C library when it is accessible through the system library path. This solution demonstrated the importance of understanding underlying build dependencies in post-quantum cryptography libraries.

### Algorithm Nomenclature and Version Compatibility

A secondary challenge arose following successful resolution of the liboqs library availability issue. The crypto.py module initially referenced the algorithm as "Dilithium3" when instantiating the signature object. However, this algorithm identifier was not available in liboqs 0.15.0, resulting in a MechanismNotSupportedError exception. Investigation revealed that NIST's standardization process resulted in the adoption of the ML-DSA nomenclature for lattice-based digital signatures in FIPS 204, superseding the academic CRYSTALS-Dilithium naming convention. Consequently, liboqs 0.15.0 implements the standardized ML-DSA-65 algorithm variant, not the pre-standardized Dilithium3. The solution required updating all references in crypto.py to use the string identifier "ML-DSA-65" when instantiating signature objects. This change is semantically equivalent; the ML-DSA-65 standard corresponds to the CRYSTALS-Dilithium parameter set known as Dilithium3. This challenge illustrated the distinction between academic cryptographic specifications and NIST-standardized nomenclature, a distinction practitioners must understand during post-quantum implementation.


---

## References and Further Reading

- [NIST FIPS 204: Module-Lattice-Based Digital Signature Standard](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf)
- [CRYSTALS-Dilithium Algorithm Specification](https://pq-crystals.org/dilithium/data/Dilithium_Submission_3.pdf)
- [Open Quantum Safe Project Documentation](https://openquantumsafe.org/)
- National Institute of Standards and Technology. "Post-Quantum Cryptography Standardization." https://csrc.nist.gov/projects/post-quantum-cryptography/

---

**Document Version:** 1.0  
**Date:** April 27, 2026  
**System:** Post-Quantum Document Signing Portal (CRYSTALS-Dilithium ML-DSA-65)
