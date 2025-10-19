ERO QuickProfile
Decentralized Identity. Effortless Control.

A simple dApp to manage your ENS profile. ERO QuickProfile lets you update all your ENS text records (avatar, bio, socials) in one single transaction using multicall.

Built for the ETHRome 2025 hackathon.

🚀 Live Demo
Test the live application here: https://ero-quickprofile.vercel.app/

✨ Features
Clean UI: A simple, Web2-style form to edit complex Web3 records.

Reverse Resolution: Automatically finds your Primary .eth name when you connect.

Gas Efficient: Bundles all profile updates (bio, avatar, X, GitHub, etc.) into one multicall transaction to save you gas and time.

💻 Tech Stack
Framework: Next.js (App Router) & TypeScript

Styling: Tailwind CSS

Web3: Wagmi, Viem, & RainbowKit

Infrastructure: Alchemy (RPC) & Vercel (Deployment)

🛠️ How To Run Locally
Clone the repo:

Bash
git clone https://github.com/erenakaero/eroquick.git
cd eroquick
Install dependencies:

Bash
npm install
Set up environment variables:

Create a file named .env.local

Add your WalletConnect and Alchemy keys:

Kod snippet'i
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY=...
NEXT_PUBLIC_ALCHEMY_MAINNET_API_KEY=...
Run the server:

Bash
npm run dev
Open http://localhost:3000 in your browser.
