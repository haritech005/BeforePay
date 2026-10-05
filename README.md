# BeforePay

BeforePay is an automated consumer protection application designed to verify social commerce sellers before money is transferred. It cross-references Instagram seller signals, executes reverse visual searches with Google Lens, searches for cheaper prices across trusted online marketplaces with Google Shopping, and aggregates public customer complaints and reviews, synthesizing the findings into a clear, evidence-backed buyer safety report.

Built for the **SerpApi India Hackathon 2026** under the **AI Agents** and **Search Applications** tracks.

---

## 1. Problem Statement & Value Proposition

### The Problem
In India and worldwide, social commerce on Instagram and WhatsApp has grown rapidly. However, consumers frequently encounter:
- Scams where advance UPI payments are taken and orders are never delivered.
- Dropshipping markups where generic items available for low prices on Amazon, Myntra, or AJIO are sold at 2x to 5x markups using stolen catalog imagery.
- Fake seller accounts with zero verifiable history or hidden consumer disputes on forums like Reddit, Consumer Grievance boards, and Quora.

### Who It Helps
- Everyday consumers purchasing from Instagram shops and social storefronts.
- Buyers wanting to verify asking prices against established e-commerce marketplaces before paying.
- Users who need a fast, objective credibility check without manually searching dozens of search queries.

---

## 2. SerpApi Integration

BeforePay utilizes SerpApi as its core live search and social intelligence layer across four primary engines:

| Investigation Module | SerpApi Engine | Purpose & Query Structure |
|---|---|---|
| **Instagram Seller Profile** | `instagram_profile` / `google` | Queries the SerpApi Instagram Profile API (`profile_id: {handle}`) to directly retrieve structured profile metadata: follower count, following count, post volume, biography, external website links, verification status, and avatar image. Falls back to Google Search (`site:instagram.com/{handle}`) when indexed signals are needed. |
| **Product Reverse Search** | `google_lens` | Uploads compressed image binaries via SerpApi `/image` endpoint (`image_id`) to identify identical product catalog listings across the web. |
| **Price Comparison** | `google_shopping` | Extracts candidate product titles from visual matches and queries Google Shopping with India localization (`gl=in`, `hl=en`, `location=India`) to find lower-priced offers from trusted merchants (Amazon, Myntra, Flipkart, AJIO, etc.). |
| **Seller Reputation & Complaints** | `google` | Executes multi-pattern dispute queries (`"{handle}" scam OR fraud OR complaint OR fake`) across Reddit, Quora, and consumer grievance portals, backed by entity-matching algorithms to prevent false positives. |

---

## 3. System Architecture

```
                                    +------------------------+
                                    |     Client Browser     |
                                    |  (Next.js App Router)  |
                                    +-----------+------------+
                                                |
                                    POST Image + Form Data
                                                |
                                                v
                                    +------------------------+
                                    |   Next.js API Routes   |
                                    | (Server-Side Isolation)|
                                    +-----------+------------+
                                                |
            +-----------------------------------+-----------------------------------+
            |                                   |                                   |
            v                                   v                                   v
   +-----------------------+           +-----------------+                 +-----------------+
   |   Instagram Profile   |           | Google Lens &   |                 | Reputation &    |
   | (SerpApi Instagram API|           | Google Shopping |                 | Grievance Search|
   |   & Google Search)    |           |  (SerpApi APIs) |                 | (SerpApi Google)|
   +-----------+-----------+           +--------+--------+                 +--------+--------+
               |                                |                                   |
               +--------------------------------+-----------------------------------+
            +-----------------------------------+-----------------------------------+
                                                |
                                    Normalized Evidence DTO
                                                |
                                                v
                                    +------------------------+
                                    |  AI Report Synthesizer |
                                    |  (LangChain + Ollama   |
                                    |    Gemma 3 4B Local)   |
                                    +-----------+------------+
                                                |
                                                v
                                    +------------------------+
                                    | Unified Consumer Report|
                                    |  - Key Findings Summary|
                                    |  - Visual Matches Grid |
                                    |  - Cheaper Store Deals |
                                    |  - Public Grievances   |
                                    |  - Buyer Safe Checklist|
                                    +------------------------+
```

---

## 4. Key Engineering Highlights

- **Server-Side Credential Isolation**: The `SERPAPI_API_KEY` is exclusively accessed in server-side API handlers (`app/api/*`) and is never leaked to the client bundle.
- **Sharp Image Pre-Processing**: Uploaded product images are automatically compressed and resized using `sharp` to remain under 80 KB before sending to SerpApi, ensuring rapid binary upload and fast Lens processing.
- **Defensive Entity Relevance Filtering**: Seller reputation checks use strict token matching and promotional drop exclusion to prevent false-positive scam accusations against legitimate sellers.
- **Local AI Reasoning with Deterministic Fallback**: Uses LangChain and Ollama (`gemma3:4b`) for grounded reasoning without external AI API costs. If Ollama is offline or unavailable, the system automatically falls back to a deterministic rules engine, guaranteeing zero downtime.
- **Human-Centric Interface**: Clean typography, clear risk levels, zero artificial jargon or fake cyber badges, and responsive design optimized for desktop and mobile devices.

---

## 5. Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS v4 (Clean, accessible color palettes and typography)
- **Search Data Ingestion**: SerpApi REST Client (`google`, `google_lens`, `google_shopping`)
- **Image Processing**: Sharp
- **AI Synthesis**: LangChain Core, LangChain Ollama, Google Gemma 3 (4B)

---

## 6. Getting Started

### Prerequisites
1. **Node.js**: Version 18.18.0 or higher.
2. **SerpApi API Key**: A valid API key from [SerpApi](https://serpapi.com/).
3. **Ollama (Optional)**: For local AI report synthesis. If not running, BeforePay automatically uses its built-in deterministic synthesizer.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/haritech005/BeforePay.git
   cd BeforePay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the project root:
   ```env
   SERPAPI_API_KEY=your_serpapi_api_key_here
   OLLAMA_BASE_URL=http://127.0.0.1:11434
   OLLAMA_MODEL=gemma3:4b
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. How to Test & Verify

1. **Enter Instagram Handle**: Input any Instagram seller handle or URL (for example: `houseofclothes.in` or `brand_shop`).
2. **Upload Product Photo**: Attach a photo or screenshot of the product you want to verify.
3. **Enter Quoted Price**: Provide the seller's asking price in INR (for example: `780`).
4. **Click "Check Seller"**:
   - The application checks the Instagram profile via SerpApi Google Search.
   - It performs a Google Lens visual search to identify matching product listings.
   - It checks Google Shopping for lower prices on verified stores like Myntra, Amazon, and AJIO.
   - It searches public forums for unresolved disputes.
   - It generates a structured report with actionable buyer safety recommendations.

---

## 8. Hackathon Submission Disclosures

- **Hackathon**: SerpApi India Hackathon 2026
- **Submission Track**: AI Agents / Search Applications
- **Project Originality**: This project was developed as a new application for the SerpApi India Hackathon 2026.
- **AI Tools Used**: Developed with assistance from Antigravity IDE for development and paired programming; incorporates local Ollama (`gemma3:4b`) for report synthesis.
- **Demo Video**: [Link to 3-Minute Demo Video](https://drive.google.com/file/d/1cJ1zZapfpi5FNsPiriDdjCZFCQwEbSAD/view?usp=sharing)
- **Lead Participant**: Hariharan J ([GitHub](https://github.com/haritech005))

---

## 9. License

This project is licensed under the MIT License.
