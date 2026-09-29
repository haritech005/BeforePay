BeforePay — Product Requirements Document (PRD)
1. Project Overview

Project name: BeforePay
Tagline: Investigate before you pay.
Project type: AI-powered web application
Primary goal: Help people investigate Instagram sellers and product listings before making a payment.

BeforePay helps users examine an Instagram seller, check where a product image appears online, compare product prices, and search for publicly available complaints or discussions. It combines these findings into one simple investigation report so users can make a more informed purchasing decision.

BeforePay does not guarantee that a seller is safe or fraudulent. It presents available evidence and signals for users to evaluate themselves.

2. Problem Statement

People sometimes purchase products from Instagram sellers without knowing whether the seller is reliable. A seller may accept payment without delivering the product, use product images found on other websites, offer prices that differ from comparable listings, or have publicly reported customer complaints.

Currently, a buyer may need to check the seller profile, reverse-search product images, compare prices, and search for complaints manually across different websites.

BeforePay brings these checks together into one simple investigation workflow before the buyer pays.

3. Target Users
People planning to purchase products from Instagram sellers.
Online shoppers who want to check unfamiliar sellers before making a payment.
People who want to compare an Instagram seller's asking price with comparable online listings.
4. MVP Scope — Locked Requirements

The MVP contains only the following five investigation and reporting capabilities:

Instagram Seller Profile Check.
Product Image Investigation.
Product Price Comparison.
Public Reputation Search.
Evidence Analysis and Final Investigation Report.

Do not add features outside this scope without explicit approval from the project owner.

5. User Workflow
The user opens BeforePay.
The user enters the Instagram seller handle or supported public profile URL.
The user provides the product image, product details if available, and the price quoted by the Instagram seller.
BeforePay retrieves available public information using the relevant SerpApi APIs.
The application collects and organizes the retrieved evidence.
LangChain passes the relevant evidence to the locally running Ollama model for analysis and summarization.
BeforePay displays one investigation report containing seller signals, image matches, cheaper comparable listings, public complaints or discussions, and source links.
The user reviews the evidence and decides independently whether to proceed with the purchase.

The application must handle missing or unavailable results without inventing evidence.

6. Functional Requirements
6.1 Instagram Seller Profile Check

Purpose: Show publicly available profile information that helps the user understand the seller's visible account activity.

Input: Instagram handle or supported public profile URL.

Data source: SerpApi Instagram Profile API.

Requirements:

Retrieve supported public profile information through SerpApi.
Display available information such as follower count, following count, post count, username, and profile details when returned by the API.
Show only fields that are available in the actual API response.
Present these details as profile signals, not proof of trustworthiness or fraud.
Do not treat a low follower count, a new account, or a high following count as proof that the seller is fraudulent.
Do not invent engagement rates or profile data that cannot be reliably calculated from the available response.
Handle private, unavailable, invalid, or unsupported profiles gracefully.
6.2 Product Image Investigation

Purpose: Help the user discover whether the supplied product image appears on other websites or in other product listings.

Input: Product image supplied by the user.

Data source: SerpApi Google Lens API.

Requirements:

Accept a product image for visual investigation.
Submit the image to the supported Google Lens search workflow through SerpApi.
Retrieve available visual matches and relevant source listings.
Display matching results with available titles, websites, images, and source links.
Clearly communicate findings such as: "This image appears on 4 other sources."
Do not claim that the Instagram seller stole an image merely because the same or a similar image appears elsewhere.
Distinguish exact-looking matches from visually similar results whenever the returned data supports that distinction.
If the image cannot be processed or no results are found, show an appropriate message.

Implementation note: Use a supported image input method for the selected SerpApi endpoint. Do not assume that a local file path can be submitted directly to a remote API. If a public image URL is required, implement only the simplest compatible method needed for the MVP.

6.3 Product Price Comparison

Purpose: Show comparable online listings that are cheaper than the price quoted by the Instagram seller.

Input:

Product name or identifying details, when available.
Instagram seller's quoted price.
Product image or image investigation results, when useful for identifying comparable listings.

Data source: SerpApi Google Shopping API.

Requirements:

Search for online product listings using the available product information.
Retrieve available listing titles, prices, merchants, ratings, review counts, and URLs.
Compare each usable listing price against the Instagram seller's quoted price.
Display only listings that are cheaper than the Instagram seller's price.
Exclude listings with equal or higher prices from the cheaper-alternatives section.
Example: If the Instagram seller asks for ₹1,999, show comparable listings at ₹1,499 and ₹1,699, but do not show a listing at ₹2,199.
Show the seller's quoted price clearly alongside the cheaper alternatives.
Link each alternative to its original listing when a usable URL is available.
Do not label a listing as the exact same product unless its identity is sufficiently supported by the available product details, such as brand, model, variant, size, colour, or quantity.
When exact identity cannot be established, label the listing as a comparable product rather than an exact match.
Do not invent prices, availability, discounts, or merchant details.
If no cheaper comparable listings are found, explain that no qualifying results were found. Do not interpret that outcome as a trust signal.
6.4 Public Reputation Search

Purpose: Find publicly indexed complaints, reviews, discussions, or reports that may be relevant to the Instagram seller.

Data sources: SerpApi Google Search, Google Forums, and Google News where supported and relevant.

Requirements:

Search the seller's handle, username, or available identifying details.
Use relevant queries such as:
"seller handle" scam
"seller handle" complaint
"seller handle" review
"seller handle" fraud
"seller handle" refund
"seller handle" "not delivered"
Use Google Search for general indexed pages, Google Forums for relevant discussions where available, and Google News for relevant news coverage.
Display relevant results with titles, snippets, source names, and original URLs when available.
Keep the distinction between a search result, an allegation, a reported complaint, and a verified finding clear.
Do not describe an allegation as proven fraud.
Check whether a result actually refers to the investigated seller. Similar usernames or unrelated sellers must not automatically be treated as matching identities.
Avoid presenting duplicate results as separate independent complaints.
If no relevant results are found, say: "No relevant public complaints were found in the searches performed. This does not prove that the seller is safe."
Do not imply that the search covers every website, private conversation, or complaint database.
6.5 Evidence Analysis and Final Investigation Report

Purpose: Combine the results from the four investigation checks into one readable report.

Technology: LangChain with a locally running Ollama model using Gemma 3 4B.

Requirements:

Supply the collected evidence to the model in a structured, understandable format.
Ask the model to summarize the evidence, identify relevant patterns and inconsistencies, and explain why particular findings may deserve attention.
Separate retrieved facts from AI-generated interpretation.
Generate a report using only the supplied evidence.
Never allow the model to invent search results, complaints, prices, profile statistics, sources, or URLs.
Preserve original source URLs so users can verify the evidence themselves.
Clearly indicate unavailable data and unsuccessful searches.
Do not calculate or display a numerical scam probability.
Do not declare that a seller is definitely a scam or definitely safe.
Do not treat the absence of complaints as evidence that a seller is trustworthy.
Do not treat image reuse, a low price, or profile statistics as conclusive evidence of fraud in isolation.

The report must contain these sections:

Investigation Summary: A concise overview of the findings and their limitations.
Seller Profile Signals: Public profile information returned by the API.
Product Image Matches: Relevant visual matches and their original sources.
Cheaper Comparable Listings: Only qualifying listings priced below the quoted Instagram price.
Public Complaints and Discussions: Relevant search results, allegations, and reports with source links.
Before You Pay Checklist: Practical checks based on the findings, such as confirming delivery terms, refund terms, seller identity, and payment protections.
Sources: Links to the original available sources used in the report.

Use cautious, evidence-based wording. A suitable example heading is "Multiple signals deserve attention" rather than "This seller is a scam."

7. User Interface Requirements

Build a simple, clean, responsive web interface that a non-technical person can understand.

Main Investigation Form

The form should collect:

Instagram handle or supported profile URL.
Product image.
Product name or description, when available.
Price quoted by the Instagram seller, in Indian rupees (INR).

Clearly mark required fields and optional fields. The product name can be optional if enough information is available from the image or the user-provided details to perform a search.

Investigation Progress

Show a clear loading state while the application performs the available checks. Where practical, indicate which check is running. Do not display fake progress or claim a check has succeeded before its result is received.

Results Page

Display the final report in distinct sections or cards. Use readable typography, clear labels, and links that allow users to open the original sources.

Include clear messages for missing results, failed API requests, invalid input, and local model errors. One failed check should not silently become a fabricated result.

The interface must work on desktop and mobile screen sizes.

8. Technology Stack

Use the following stack only unless a technical limitation requires a minimal, explicitly justified change.

Frontend
Next.js.
React.
TypeScript.
Tailwind CSS.

Purpose: Build the pages, input form, investigation progress UI, and final report.

Backend
Next.js Route Handlers using TypeScript.

Purpose: Receive form submissions, validate inputs, call SerpApi, coordinate the investigation, and return the results to the frontend.

Do not create a separate Express server. Use the backend capabilities already provided by Next.js.

Search and External Data
SerpApi.
Instagram Profile API.
Google Lens API.
Google Shopping API.
Google Search API.
Google News API and Google Forums results where supported and relevant.

Purpose: Retrieve external search data and evidence for the investigation.

AI Integration
LangChain.js / LangChain for JavaScript and TypeScript.
Ollama running locally.
Gemma 3 4B through Ollama.

Purpose: Pass the collected evidence to the local model and generate a concise, evidence-based investigation summary.

Workflow Coordination
Ordinary TypeScript functions and asynchronous calls.

Use LangChain where it provides a real benefit for the model integration. LangGraph is not required and must not be introduced into the MVP.

Storage
No database.
No persistent user accounts or investigation history.
Keep investigation data in memory for the current request and response only, except for temporary files strictly required to process the uploaded image.
Clean up temporary files where applicable.
Authentication
No user authentication or registration.
Deployment
The MVP is designed to run locally for the hackathon demonstration.
No public deployment is required.
Version Control
Git and a public GitHub repository for hackathon submission.
9. Architecture

The application should follow this straightforward architecture:

User → Next.js Frontend → Next.js Route Handler → TypeScript Investigation Functions → SerpApi Searches → Structured Evidence → LangChain + Ollama/Gemma 3 4B → Final Report → Next.js Results UI.

The four investigation checks should be implemented as separate, understandable functions. Run independent checks concurrently where practical, subject to API limits and available inputs. Aggregate their results into a predictable TypeScript data structure before asking the model to summarize them.

Use simple orchestration. Do not introduce a complex agent framework, microservices, message queues, a vector database, or unnecessary abstractions.

10. API and Configuration Requirements

Use environment variables for credentials and configuration.

Create a .env.example file containing placeholder values for required variables, such as:

SERPAPI_API_KEY=
Any additional configuration genuinely required for the local Ollama endpoint or selected model.

Use the standard local Ollama endpoint and the configured Gemma 3 4B model unless the local installation requires a different setting.

Requirements:

Never expose the SerpApi API key in frontend code or client-visible responses.
Keep API requests on the server.
Do not hardcode credentials in source files.
Validate user inputs before making external requests.
Handle API errors, rate limits, invalid responses, and timeouts gracefully.
Do not invent successful results when an API request fails.
Avoid unnecessary repeated searches and duplicate requests to conserve the SerpApi free monthly quota.
Use only the API endpoints and parameters supported by the selected SerpApi APIs. Verify the current documentation before implementing endpoint-specific details.
11. Privacy and Security
Process only the information needed for the current investigation.
Do not ask users to provide Instagram passwords, OTPs, payment PINs, or account credentials.
Do not attempt to access private Instagram content or bypass access restrictions.
Do not expose secrets or API keys in browser responses or logs.
Do not retain uploaded product images beyond what is necessary for processing the current request.
Validate uploaded image types and file sizes on the server.
Render external text safely and avoid executing content from search results.
Clearly communicate when data could not be retrieved.
12. Error Handling

The application must handle the following situations:

Invalid or missing Instagram handle.
Unsupported or invalid image file.
Product image search returns no results.
Seller profile cannot be retrieved.
Google Shopping returns no cheaper comparable listings.
Public reputation searches return no relevant results.
SerpApi authentication failure, quota exhaustion, timeout, or service error.
Ollama is not running or the selected model is unavailable.
The model returns incomplete or unusable output.
Some investigation checks succeed while others fail.

Show understandable messages to the user. Preserve successful evidence when possible, identify failed checks, and never substitute invented evidence for missing results.

13. Non-Functional Requirements
Keep the implementation simple enough for one developer to understand and maintain.
Use TypeScript types for API inputs, individual check results, collected evidence, and final report data.
Keep API keys on the server.
Make the interface responsive and accessible.
Avoid unnecessary external services and paid dependencies.
Prefer local inference through Ollama to avoid paid model API usage.
Minimize SerpApi calls to stay within the available free quota.
Ensure the application remains useful when some search results are unavailable.
14. Out of Scope

Do not build any of the following in this MVP:

Browser extension.
Mobile application.
WhatsApp or messaging integration.
User registration, authentication, or profiles.
Database or persistent investigation history.
UPI verification or payment tracing.
Integration with a fraud or payment database.
Automatic payment, refund, or dispute submission.
Post-scam recovery workflow.
Automated cybercrime complaint submission.
Public deployment or hosting setup.
Numerical scam probability or definitive safe/scam verdict.
Complex multi-agent architecture.
LangGraph.
Vector database or RAG pipeline.
Additional investigation modules not specified in this document.

Do not implement out-of-scope features unless the project owner explicitly approves a scope change.

15. Acceptance Criteria

The MVP is considered complete when all of the following are satisfied:

The user can enter an Instagram seller handle or supported profile URL.
The user can provide a product image and the seller's quoted price, along with product details when available.
The application can retrieve and display available Instagram profile signals through SerpApi.
The application can retrieve relevant Google Lens matches through SerpApi and show source links when available.
The application can search Google Shopping and display only cheaper qualifying comparable listings.
The application can search for relevant public complaints, reviews, discussions, and news through the specified SerpApi search sources where supported.
The application can aggregate the returned evidence and use LangChain with the local Ollama/Gemma 3 4B model to generate an evidence-based report.
The report contains the specified sections and provides source links when available.
The report does not fabricate findings, present allegations as proven facts, or declare the seller definitely safe or fraudulent.
Missing results and failed checks are clearly identified.
API keys remain server-side.
The complete workflow can be demonstrated locally.
The source code and setup instructions are suitable for a public GitHub repository.
No out-of-scope features have been added.
16. Instructions for the AI Coding Agent

Before writing code, read this PRD completely and use it as the source of truth for the project requirements.

Follow these rules:

Implement only the features explicitly listed in this document.
Do not add features, integrations, frameworks, or infrastructure because they seem useful.
Use Next.js, React, TypeScript, and Tailwind CSS for the application.
Use Next.js Route Handlers for the backend; do not create a separate server.
Use SerpApi as the external evidence source for the specified checks.
Use LangChain.js and the locally running Ollama/Gemma 3 4B model for evidence summarization.
Do not use LangGraph.
Do not add a database, authentication, a vector database, or persistent history.
Do not use paid LLM APIs or add paid services. The target is a zero-cost local demonstration apart from any limits or requirements of the selected SerpApi account.
Never expose credentials in client-side code.
Verify current SerpApi and LangChain.js documentation before implementing API-specific calls. Do not guess endpoint parameters or response fields.
Use clear, modular TypeScript functions without overengineering.
Keep API responses and evidence typed and validate external data before displaying or passing it to the model.
Ensure that the model summarizes supplied evidence instead of generating unsupported claims.
Implement sensible loading states, error handling, and empty states.
Do not pretend that an API request succeeded when it failed.
Build the smallest working end-to-end version first, then refine the interface and reliability.
Do not claim that a feature is complete until it has been implemented and tested.
If a required API capability, input method, or integration is unsupported or unclear, explain the limitation and ask for approval before changing the scope.
Do not begin implementing out-of-scope features without explicit approval.
17. Definition of Done

Before considering the MVP finished:

The application starts locally using documented commands.
Required environment variables are documented in .env.example.
The main investigation workflow functions end to end with valid API credentials and a running local Ollama model.
The seller, image, price, and reputation checks work when their required inputs and API results are available.
The final report displays collected evidence and original source links where available.
Error and empty states have been tested.
The application does not expose API secrets or invent missing results.
The README explains the project, prerequisites, environment setup, how to run locally, the technologies used, limitations, and the role of SerpApi.
No unapproved features or unnecessary dependencies have been introduced.

Final product principle: BeforePay helps users investigate before they pay. It provides evidence and context, not guarantees.