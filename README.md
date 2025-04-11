~ DFPG – Decentralized Fraud-Proof Payment Gateway

~ A secure, decentralized, and AI-enhanced blockchain payment platform for fast, transparent, and fraud-proof global transactions.

—

~ Demo

📽️ Demo Video         : {}
📂 GitHub Repository  : {}

—

~ 🧠 Problem Statement

Despite the rise of digital transactions, today’s payment systems still suffer from:

- Unauthorized access and irreversible mistakes
- High fees and delays in cross-border transactions
- Limited transparency and traceability
- Lack of privacy and fraud prevention mechanisms



~ Our Solution – DFPG

DFPG empowers users with a robust blockchain-based payment solution that’s:

- Smart Contract Secured – Tamper-proof and decentralized transactions on Ethereum
- Two-Way Handshake** – Receiver must verify a secret code to receive high-value payments
- Cross-Border ETH Payments** – Fast crypto transfers with real-time INR conversion
- Zero-Knowledge UPI Payments** – Sender can pay using UPI ID/QR without exposing details
- AI-Driven Scam Detection** – Identifies suspicious users and blocks fraudulent transactions
- Scam Reputation System** – Flags users based on failed verifications
- Future Scope: IPFS Logging** – Immutable audit trails for every transaction

—

~ How It Works

1. User logs in via Firebase Authentication
2. Payment is initiated with ETH and optional UPI ID/QR Code
3. f amount > ₹2000, a secret OTP/code is generated and must be shared manually
4. Receiver enters OTP/code to confirm and receive the payment
5. Smart contract executes transaction securely on Ethereum via MetaMask
6. AI scam detection engine checks user behavior and history
7. Transaction is completed with ETH transferred and optionally logged on IPFS.



~ Key Features

- Secure login/signup using Firebase
- Crypto payments via Meta-Mask (ETH-based)
- Auto-reversible transactions using smart contracts (in development)
- Dual-auth verification for high-risk transfers
- Real-time INR conversion of ETH values by FINICITY
- AI-based fraud prevention using user activity and metadata
- UPI/QR-based pseudo-anonymous payments (zero-knowledge)
- Users flagged if fraud suspected or OTP verification fails
- Planned IPFS data logging for tamper-proof storage


~ Tech Stack

|            Layer                |             Technologies Used              |
|---------------------------------|--------------------------------------------|
| Frontend                        | React and Tailwind (Custom animations, UI) |
| Authentication                  | Firebase Authentication                    |
| Blockchain                      | Ethereum, Web3.js, Meta-Mask               |
| Backend                         | Go-Lang (Fast, Secure), Node.js (optional) |
| Database                        | Firebase Realtime Database , Postgre SQL   |
| Fraud Detection                 | Python, TensorFlow (basic logic for dete.) |
| Crypto APIs                     | Chain-link (for real-time conversions)     |
| Decentralized Storage (Planned) | IPFS                                       |
| Hosting                         | Netlify / GitHub Pages                     |
|---------------------------------|--------------------------------------------|

