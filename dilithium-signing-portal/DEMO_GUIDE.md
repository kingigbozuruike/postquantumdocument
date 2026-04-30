# Quantum-Safe Signing Portal - Demo Guide for Two People

## Overview

This guide walks two presenters through demonstrating the Quantum-Safe Signing Portal. One person acts as the **Presenter** (explains concepts) and the other as the **Operator** (controls the app). This collaborative approach creates engaging, dynamic demos.

**Total Demo Time:** ~15-20 minutes

---

## Pre-Demo Checklist (5 minutes before)

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Both visible on screen (split screen or projector recommended)
- [ ] Backend terminal shows "Uvicorn running on http://127.0.0.1:8000"
- [ ] Frontend shows app homepage with header "Quantum-Safe Signing Portal"
- [ ] Test connection: Open browser to `http://localhost:5173`

---

## SEGMENT 1: Introduction & Context (2-3 minutes)

### Presenter's Role
**Talking Points:**

> "Today we're demonstrating the Quantum-Safe Signing Portal—a practical application of post-quantum cryptography using CRYSTALS-Dilithium.
>
> Why does this matter? Classical cryptography—the RSA and ECDSA algorithms that secure the internet today—relies on mathematical problems that are *hard for classical computers* but *easy for quantum computers* to solve using Shor's algorithm.
>
> Dilithium is different. It's based on lattice problems, which are believed to be hard even for quantum computers. In 2024, the U.S. National Institute of Standards and Technology (NIST) standardized Dilithium as ML-DSA—the new standard for post-quantum digital signatures.
>
> What we're showing you today is real, production-ready cryptography. Let me walk you through it."

### Operator's Role
- Display the app on the main screen
- Have the "Why Post-Quantum?" panel visible (click to expand if needed)
- Show the comparison table with RSA/ECDSA vs Dilithium3

**Visual Aid:**
- Point to the comparison table showing:
  - RSA-2048: "Quantum Safe? No"
  - ECDSA-256: "Quantum Safe? No"
  - Dilithium3: "Quantum Safe? ✓ Yes"

---

## SEGMENT 2: Key Generation (2-3 minutes)

### Presenter's Role
**Talking Points:**

> "The first step in any signing system is generating a key pair. You need a private key that you keep secret, and a public key that you share with the world.
>
> Here's what's interesting: Dilithium keys are much larger than classical keys. A Dilithium public key is about 1,952 bytes compared to RSA which is only 256 bytes. This is the trade-off we make for quantum safety—slightly larger keys, but unbreakable security.
>
> Let's generate a key pair."

### Operator's Role
1. Click **"Tab 1: Generate Keys"** at the top
2. Click the blue **"Generate Key Pair"** button
3. **Wait for completion** (shows "✓ Document Signed Successfully")
4. **Show the results:**
   - Point out the public key (1,952-byte hex string)
   - Point out the private key (much larger, ~4,000 bytes)
   - Have the audience note the size difference

**Audience Interaction:**
- Ask: "Who can tell me why the public key is so much larger than RSA's?"
- Answer: "Lattice-based cryptography requires more data to be mathematically secure against quantum attacks."

---

## SEGMENT 3: Digital Signature (3-4 minutes)

### Presenter's Role
**Talking Points:**

> "Now we have our keys. The next step is digital signing. We're going to take a document—any text—and create a cryptographic signature using our *private key*.
>
> This signature proves three things:
> 1. **Authenticity** - The document was signed by the holder of this private key
> 2. **Non-repudiation** - The signer can't deny they signed it
> 3. **Integrity** - The document hasn't been modified since signing
>
> Watch what happens when we sign."

### Operator's Role
1. Click **"Tab 2: Sign Document"**
2. In the document textarea, paste this sample text:
   ```
   CONFIDENTIAL MEMO
   
   To: Finance Department
   From: Security Team
   Date: April 21, 2026
   
   This memo certifies that all cryptographic systems have been 
   upgraded to post-quantum standards and are resistant to 
   future quantum attacks.
   
   Authorized: Quantum Security Initiative
   ```
3. Click **"Sign Document"** button
4. **Show the results:**
   - Green success banner appears
   - Signature displays (6,600+ character hex string)
   - **Important:** Show the **Signature Byte Preview** grid
     - Point out the 8×8 colored pattern
     - Explain: "Each tile is 1 byte of the signature. See the color pattern? That's completely random-looking, which is exactly what you want in cryptography."

**Audience Interaction:**
- Ask: "Why is the signature so long? It's thousands of characters!"
- Answer: "Post-quantum signatures are larger because they encode more security information. Dilithium signatures are ~3,300 bytes vs. ECDSA's 64 bytes. Again, this is the trade-off for quantum safety."

**Key Moment:**
- Have audience copy one character from the signature somewhere
- Show them they can paste it back and use it in verification

---

## SEGMENT 4: Signature Verification (Valid) (2-3 minutes)

### Presenter's Role
**Talking Points:**

> "Now comes the critical moment: verification. We're going to take our document, our signature, and our public key, and verify that everything matches.
>
> Here's the beautiful part: to verify a signature, you only need the *public key*. The signer never has to reveal their private key. Only they can sign, but anyone can verify.
>
> Let's verify that our signature is valid."

### Operator's Role
1. Click **"Tab 3: Verify Document"**
2. The fields should be **pre-filled:**
   - Document (from previous signing)
   - Signature (from previous signing)
   - Public Key (from key generation)
3. Click **"Verify Signature"** button
4. **Show the result:**
   - **Large green checkmark** appears with message: "✓ Signature Valid"
   - Explain: "This document is authentic and has not been tampered with."

**Audience Reaction:**
This is the moment where crypto "feels magic"—the system proved authenticity without revealing secrets.

---

## SEGMENT 5: Tamper Detection (2-3 minutes)

### Presenter's Role
**Talking Points:**

> "Here's where digital signatures become powerful. Even a *single character change* to the document will break the signature. Let me show you.
>
> Watch what happens when we modify just one word in the document. The signature becomes invalid—completely useless."

### Operator's Role
1. **Scroll down to the yellow "Tamper Simulator" section**
2. In the "Editable Document Copy" textarea, make a small change:
   - Find the word "quantum" and change it to "classical"
   - Or change a number
   - **Show the audience exactly what you're changing**
3. Click **"Re-Verify Tampered Document"** button
4. **Show the result:**
   - **Large red X** appears with message: "✗ Signature Invalid"
   - Explain: "This document has been modified or the signature does not match."

**Audience Interaction:**
- Ask: "Why is the signature now invalid? We only changed one character!"
- Answer: "Because digital signatures use cryptographic hash functions. A tiny change to the input creates a completely different hash. The signature no longer matches. This is exactly why digital signatures protect document integrity."

**Optional Deepening:**
- Undo the change and re-verify again to show it becomes valid again
- Demonstrate that this works with ANY change, no matter how small

---

## SEGMENT 6: Step Progress Indicator (1 minute)

### Presenter's Role
**Talking Points:**

> "Notice at the top of the page there's a progress indicator. This shows where we are in the workflow."

### Operator's Role
1. Scroll to the top
2. Point out the **Step Progress bar:**
   - Step 1: ✓ (checkmark, green, labeled "Done")
   - Step 2: ✓ (checkmark, green, labeled "Done")
   - Step 3: ✓ (checkmark, green, labeled "Done")
   - Progress counter: "3 of 3 steps completed"
3. Explain each step's purpose

---

## SEGMENT 7: Q&A & Deep Dive (5-10 minutes)

### Presenter's Role

**Likely Questions:**

**Q: "How is this different from what banks use today?"**

> "Great question. Banks today use RSA-2048 or ECDSA-256. Both are mathematically secure against classical computers—but they're vulnerable to quantum computers. A sufficiently powerful quantum computer (not yet built, but theoretically possible in 10-20 years) could break these in minutes.
>
> Dilithium, on the other hand, is based on lattice mathematics. Even a quantum computer would take millions of years to break it. This is why NIST standardized it in 2024."

**Q: "What if I lose my private key?"**

> "That's a real problem. Your private key is like your digital identity—anyone with it can forge your signatures. In production systems, private keys are stored in hardware security modules (HSMs) or encrypted vaults. For this demo, we're storing it in memory for simplicity."

**Q: "Can I use this for real contracts?"**

> "In theory, yes—Dilithium is production-ready. But in practice, you'd want to add:
> - Certificate infrastructure (PKI) to bind public keys to identities
> - Timestamp authorities to prove when something was signed
> - Legal frameworks for digital signatures
> - Secure key management systems
>
> This demo shows the cryptographic core, but real-world deployment requires more layers."

**Q: "Why are the keys and signatures so large?"**

> "Lattice-based cryptography requires more data to achieve quantum-resistant security. It's a fundamental trade-off:
> - Classical: Small keys/signatures, but quantum-vulnerable
> - Post-quantum: Larger keys/signatures, but quantum-resistant
>
> For most applications, this is an acceptable trade-off. Networks are fast, storage is cheap, but breaking all of cryptography is catastrophic."

### Operator's Role
- Prepare to demonstrate specific features based on questions
- Have the "Why Post-Quantum?" panel ready to expand
- Be ready to re-run the full workflow if asked

---

## SEGMENT 8: Closing Remarks (1-2 minutes)

### Presenter's Role

**Talking Points:**

> "What you've just seen is the future of digital cryptography. NIST has designated Dilithium as the standard for post-quantum digital signatures. Government agencies, financial institutions, and tech companies are beginning deployment now.
>
> The transition from classical to post-quantum cryptography is one of the largest coordinated cybersecurity efforts in history. We call it 'Q-Day Preparation'—getting ready for the day quantum computers become powerful enough to break today's encryption.
>
> This application demonstrates that post-quantum cryptography isn't some theoretical concept—it's practical, it's standardized, and it's ready to use today. The mathematics is proven, the implementations are solid, and the performance is acceptable.
>
> Thank you for exploring the future of digital security with us!"

### Operator's Role
- Keep the app open on screen
- Be ready to answer technical follow-ups
- Offer to let audience members try signing their own documents

---

## Alternative Demo Scenarios

### Scenario A: Short Demo (8-10 minutes)
**For time-constrained environments (elevator pitch, quick overview)**

1. Introduction (1 min)
2. Key Generation (1 min)
3. Signing (2 min)
4. Verification - Valid (1 min)
5. Verification - Tampered (2 min)
6. Closing (1 min)

**Skip:** Detailed Q&A, deep dives, Step Progress explanation

---

### Scenario B: Extended Demo (25-30 minutes)
**For technical audiences wanting deep dives**

1. Introduction with NIST context (3 min)
2. Key Generation + math explanation (3 min)
3. Signing + cryptographic hash explanation (3 min)
4. Verification - Valid (2 min)
5. Verification - Tampered + integrity discussion (3 min)
6. Byte Preview explanation (2 min)
7. Q&A / Technical Deep Dive (5-10 min)
8. Closing + future roadmap (2 min)

**Add:** Show backend terminal showing API calls, explain the REST API architecture

---

### Scenario C: Interactive Demo (20-25 minutes)
**For workshops/training where audience participates**

1. Introduction (2 min)
2. Audience member #1 generates keys (3 min)
3. Audience member #2 provides document text to sign (2 min)
4. Operator signs (1 min)
5. Audience member #3 verifies signature (2 min)
6. All audience members tamper with document, see it fail (2 min)
7. Group Q&A (5-10 min)
8. Closing (1 min)

**Engagement:** Let different audience members control each step

---

## Demo Troubleshooting

### Problem: Page loads but app doesn't show content
**Solution:** Check that backend is running (`http://localhost:8000/docs` should show API docs)

### Problem: "No oqs shared libraries found" error
**Solution:** Verify backend terminal shows `Uvicorn running on...` without errors. If error occurs, restart backend with proper DYLD_LIBRARY_PATH set.

### Problem: Signing is very slow
**Solution:** First time signing is slow (~2-3 seconds). Subsequent signatures are faster. This is normal.

### Problem: API calls from frontend get CORS errors
**Solution:** Ensure frontend is on `localhost:5173` and backend is on `localhost:8000`. CORS is configured for localhost only.

### Problem: Signature verification always fails
**Solution:** Make sure you're using the same document and signature from the same keys. If you generated new keys, you need to re-sign.

---

## Talking Points by Audience Type

### For Security Professionals
- Focus on FIPS 204 standardization
- Discuss lattice hardness assumptions
- Compare to classical algorithms
- Mention implementation details (parameter sets)

### For Business Decision-Makers
- Focus on quantum threat timeline
- Discuss regulatory requirements
- Emphasize NIST endorsement
- Talk about enterprise adoption trends

### For Students/Learners
- Focus on "how it works" concepts
- Use visual demonstrations (byte preview grid)
- Emphasize the integrity protection
- Connect to broader cryptography concepts

### For General Audiences
- Avoid heavy math
- Use analogies (digital signature = handwritten signature but better)
- Focus on practical implications
- Emphasize security benefit

---

## Key Phrases to Memorize

1. **"Quantum Safe"** - Resistant to attacks by quantum computers
2. **"FIPS 204"** - The NIST standard for post-quantum digital signatures
3. **"Lattice Problems"** - The mathematical basis for Dilithium security
4. **"Non-repudiation"** - Can't deny signing something you signed
5. **"Integrity Protection"** - Any change to the document breaks the signature
6. **"Q-Day"** - The day quantum computers become powerful enough to break current encryption
7. **"Trade-off"** - Larger keys/signatures for quantum safety

---

## Visual Aids to Prepare

- Slide deck with comparison table (RSA vs ECDSA vs Dilithium)
- Timeline showing when quantum computers might arrive
- Diagram showing how digital signatures work
- Chart showing key/signature sizes

---

## Post-Demo Resources

Provide audiences with:
- Link to GitHub repository
- README.md with installation instructions
- "Understanding Post-Quantum Cryptography" whitepaper link
- NIST FIPS 204 specification link
- Open Quantum Safe (liboqs) documentation

---

## Feedback Collection

After the demo, ask:
- "What part was most interesting to you?"
- "Do you have concerns about quantum threats?"
- "Would you want to use this in your organization?"
- "What questions do you still have?"

---

## Notes for Presenter

- **Enthusiasm matters** - This is cutting-edge technology!
- **Don't get bogged down in math** - Keep explanations intuitive
- **Use the visualization** - The byte preview grid is memorable
- **Emphasize the practical** - This isn't theoretical; NIST already standardized it
- **Answer questions honestly** - If you don't know something, say so

## Notes for Operator

- **Smooth clicks** - Practice the demo before showing
- **Read any error messages aloud** - Transparency builds trust
- **Pause for emphasis** - Give the audience time to process
- **Be ready to improvise** - Have backup documents to sign
- **Test everything beforehand** - No surprises during the demo

---

**Last Updated:** April 21, 2026  
**Demo Duration:** 15-20 minutes (adjustable)  
**Difficulty:** Beginner-friendly, no technical background required

