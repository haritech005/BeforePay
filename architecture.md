BeforePay — Technical Architecture & Phased Implementation Plan
1. Purpose of This Document

This document defines how BeforePay must be implemented, tested, and delivered phase by phase.

The AI coding agent must read both PRD.md and architecture.md completely before writing or modifying application code.

PRD.md defines what the application must do.
architecture.md defines how to implement it, the order of implementation, the testing requirements, and the rules for moving between phases.

Both documents must be followed.

The agent must not implement the entire project in a single step.

Critical rule: Complete one phase, test it, report the results, and stop. Do not begin the next phase until the project owner explicitly approves it.

The project owner will review and manually test each phase before giving approval to continue.

2. Project Summary

Project name: BeforePay

Tagline: Investigate before you pay.

BeforePay is an AI-powered web application that helps users investigate Instagram sellers before making a payment.

The application retrieves available seller profile information, searches for product image matches, compares prices against cheaper comparable online listings, and searches for public complaints or discussions.

It combines the collected evidence into a clear investigation report using a locally running AI model.

The application presents evidence to help users make their own decisions. It must not declare a seller definitively safe or fraudulent.

Primary goals
Build a reliable, working application.
Integrate SerpApi meaningfully into the investigation workflow.
Use a local Ollama model through LangChain for evidence analysis.
Deliver a polished, professional frontend.
Keep the architecture simple enough for one developer to understand.
Test every phase before proceeding.
Complete the MVP without introducing unapproved features.
3. Mandatory Technology Stack

Use the following stack.

Layer	Technology	Responsibility
Frontend framework	Next.js	Application pages and routing
UI library	React	Reusable interface components
Programming language	TypeScript	Frontend, backend, and data types
Styling	Tailwind CSS	Responsive styling and design system
Backend	Next.js Route Handlers	API requests and investigation coordination
Search data	SerpApi	Seller, image, shopping, and reputation research
AI framework	LangChain.js	Integration with the local language model
Local model runtime	Ollama	Running the model locally
Language model	Gemma 3 4B	Evidence summarization and report generation
Version control	Git and GitHub	Source control and public repository
Architecture restrictions
Use LangChain.js, not Python LangChain.
Do not use LangGraph.
Do not create a separate Express backend.
Do not introduce a database.
Do not add authentication.
Do not add a vector database or RAG pipeline.
Do not introduce a complex multi-agent architecture.
Do not add paid LLM services.
Do not add external services or dependencies without a clear requirement and project-owner approval.
Do not implement features outside the approved PRD.

Use normal TypeScript functions and asynchronous operations to coordinate the investigation.

4. Documentation Research Requirements

Before implementing any external API integration, consult the official documentation.

4.1 SerpApi documentation

Main API catalogue:

https://serpapi.com/search-engine-apis?utm_source=india_hackathon_26

SERP API explanation:

https://you.com/resources/what-is-a-serp-api

The You.com resource provides general background on SERP APIs. SerpApi's own documentation must be treated as the implementation reference for SerpApi endpoints and parameters.

Relevant API documentation to investigate:

Google Search API: https://serpapi.com/search-api
Google Shopping API: https://serpapi.com/google-shopping-api
Google Lens API: https://serpapi.com/google-lens-api
Google News API: https://serpapi.com/google-news-api
Google Forums API: https://serpapi.com/google-forums-api
Instagram Profile API: https://serpapi.com/instagram-profile-api

If a URL redirects or a particular endpoint is unavailable, locate the current documentation through the official SerpApi API catalogue.

4.2 LangChain.js documentation

https://docs.langchain.com/oss/javascript/langchain/overview

Research the current JavaScript/TypeScript integration and supported model interfaces before implementation.

4.3 Ollama documentation

https://docs.ollama.com/

Verify the local API, model availability, configuration, and supported request format.

4.4 Next.js documentation

https://nextjs.org/docs

Use the current documentation relevant to App Router, Route Handlers, file uploads, and server-side environment variables.

Documentation research rules

Before implementing an integration, the agent must:

Read the relevant official documentation.
Identify the required endpoint, parameters, and authentication method.
Understand the expected request format.
Identify the actual response fields needed by BeforePay.
Understand input restrictions, especially for Google Lens image searches.
Implement only what the documented API supports.
Test the integration using a real request whenever credentials and service availability permit.
Record any limitation that prevents implementation or testing.

Do not invent endpoint parameters, response fields, or successful API results.

If an endpoint cannot support a required operation, explain the limitation and stop for project-owner approval before changing the design.

5. Environment and API Key Rules

The project already has a SERPAPI_API_KEY entry in its environment configuration.

The agent must inspect the existing configuration before changing it.

Requirements
Reuse the existing SERPAPI_API_KEY environment variable.
Do not ask the user to paste the key into chat.
Do not print the key in terminal output, logs, screenshots, responses, or documentation.
Do not copy the actual key into source code.
Do not expose the key to the browser.
Access the key only from server-side code.
Do not overwrite the existing environment file unnecessarily.
If the key is missing or invalid, report the problem without displaying its value.
Create or maintain .env.example with placeholder values only.
Add environment files containing real credentials to .gitignore.

For the local Ollama model, inspect the existing installation and configuration. Reuse the locally available Gemma 3 4B model if it is installed and working.

If Ollama is not running or the model is missing, report the exact setup requirement rather than switching to a paid hosted model.

6. High-Level Application Architecture

The application must use a simple request-response architecture.

                    USER
                      |
                      v
             NEXT.JS FRONTEND
                      |
                      v
            INVESTIGATION FORM
                      |
                      v
            NEXT.JS ROUTE HANDLER
                      |
                      v
          INPUT VALIDATION & COORDINATION
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
       SELLER       PRODUCT      PRICE
       PROFILE      IMAGE        CHECK
       CHECK        CHECK
          |           |           |
          v           v           v
       INSTAGRAM    GOOGLE      GOOGLE
       PROFILE      LENS        SHOPPING
       API          API         API
          |           |           |
          +-----------+-----------+
                      |
                      v
              REPUTATION SEARCH
                      |
             +--------+--------+
             |        |        |
             v        v        v
           GOOGLE  GOOGLE   GOOGLE
           SEARCH  FORUMS   NEWS
             |        |        |
             +--------+--------+
                      |
                      v
             STRUCTURED EVIDENCE
                      |
                      v
             LANGCHAIN.JS
                      |
                      v
              LOCAL OLLAMA
               GEMMA 3 4B
                      |
                      v
              FINAL REPORT DATA
                      |
                      v
              NEXT.JS RESULTS UI

The four investigation checks should be separate TypeScript functions.

Independent checks may run concurrently when their required inputs are available. The backend must handle failures individually so one failed search does not unnecessarily destroy successful results from other checks.

Do not introduce a graph framework to implement this architecture.

7. Frontend Design and Quality Requirements

The frontend is a major part of the hackathon submission. It must look like a carefully designed, professional product rather than a generic AI-generated dashboard.

Visual quality must be developed throughout the project, not postponed until the final phase.

7.1 Design direction

Create a modern, trustworthy consumer web application with an editorial investigation feel.

The interface should communicate:

Clarity.
Confidence in the evidence presentation.
Transparency about uncertainty.
Simplicity for non-technical users.
Professional visual consistency.

Use a restrained colour palette, readable typography, consistent spacing, subtle borders, clear hierarchy, and carefully designed cards.

Use colour to distinguish informational, cautionary, successful, and failed states. Never use colour alone to communicate meaning.

Avoid excessive gradients, unnecessary animations, random decorative icons, and generic AI-dashboard layouts.

Do not add visual elements that reduce readability or make the report look more certain than the evidence supports.

7.2 Landing and investigation experience

The main experience should clearly explain the product's purpose.

It must include:

A clear product name and tagline.
A short explanation of what the investigation checks.
An easy-to-find investigation form.
A seller handle or supported profile URL field.
A product image upload field.
A product name or description field.
The quoted Instagram price field in INR.
Clear required and optional field indicators.
A prominent investigation button.
Helpful input examples and validation messages.
A concise explanation that results are evidence-based and not a guarantee.

Do not add unrelated landing-page features or unnecessary navigation.

7.3 Image upload interface

The upload area should be visually clear and easy to use.

Where supported, provide:

A clear upload button or drop area.
An image preview before submission.
A way to remove or replace the selected image.
Supported file-type and size information.
Friendly validation and error messages.

The browser upload experience must match the backend's actual supported image-processing method.

7.4 Investigation progress

While a real investigation is running:

Show a clear loading state.
Display the checks that are actually being executed.
Show success, no-results, or failure states when their outcomes are known.
Avoid fake progress percentages.
Do not mark a check complete before receiving its result.
Prevent accidental duplicate submissions while a request is in progress.
7.5 Results page

The results page is the most important part of the product.

Design it as a structured investigation report rather than a long block of AI-generated text.

It must contain:

Investigation Summary.
Seller Profile Signals.
Product Image Matches.
Cheaper Comparable Listings.
Public Complaints and Discussions.
Before You Pay Checklist.
Sources.

Use clear section headings, compact evidence cards, useful metadata, price comparison layouts, source links, and visible labels for unavailable data.

7.6 Visual evidence presentation

Seller profile cards

Display the available profile statistics and public details in a clean, readable layout. Do not turn follower counts or other individual metrics into a numerical trust score.

Image match cards

Display matching images when available, titles, source websites, and links. Make it easy to distinguish a source result from the application's interpretation.

Price comparison cards

Show the quoted Instagram price prominently. List only cheaper qualifying comparable products, with their prices, merchant names, and original listing links when available.

Clearly distinguish exact product matches from approximate alternatives.

Reputation evidence cards

Show the result title, source, available snippet, original link, and relevant context. Keep allegations distinct from established facts.

Investigation summary

Present the overall findings in concise language, followed by the evidence supporting those findings.

Do not use a numerical scam probability, an unsupported risk percentage, or a definitive safe/scam badge.

7.7 Responsive design and accessibility

The interface must work on desktop, tablet, and mobile screens.

Requirements:

Consistent spacing and component sizing.
Accessible colour contrast.
Visible keyboard focus states.
Proper labels for form controls.
Semantic headings and buttons.
Readable text sizes.
Appropriate loading, empty, error, and success states.
No horizontal overflow at common mobile widths.
No broken images or overflowing URLs.
7.8 Component quality

Use reusable React components where they provide genuine value.

Examples include:

InvestigationForm.
ImageUploader.
InvestigationProgress.
SellerProfileCard.
ImageMatchCard.
PriceComparisonCard.
ReputationResultCard.
EvidenceSection.
InvestigationSummary.
SourceLink.

These are implementation suggestions, not a requirement to create a separate file for every small UI element.

Avoid overengineering the component hierarchy.

7.9 Frontend quality gate

At the end of every phase that changes the UI, verify:

The page renders without runtime errors.
The layout remains consistent with the established design.
Loading and error states are visible and understandable.
The layout is responsive.
The browser console has no newly introduced errors.
No placeholder content is presented as real investigation evidence.

Use real data for successful integration tests. Clearly labelled fixtures may be used in isolated UI development or automated tests, but they must never be confused with live results.

8. Phased Implementation Plan
Phase 0 — Project Inspection and Planning
Goal

Understand the existing project and environment before modifying files.

Tasks
Read PRD.md completely.
Read architecture.md completely.
Inspect the existing project structure.
Identify whether Next.js, TypeScript, and Tailwind CSS are already configured.
Inspect the existing environment configuration without printing secret values.
Confirm whether SERPAPI_API_KEY is available to the server.
Check whether Ollama is installed and running.
Check whether the Gemma 3 4B model is available locally.
Review the official documentation listed in Section 4.
Identify any existing implementation that should be preserved.
Testing
Confirm the project structure is understood.
Confirm the current application can be started if an application already exists.
Confirm environment variables can be checked without exposing their values.
Record missing prerequisites.
Deliverables
A concise project inspection report.
A list of existing working components.
A list of missing prerequisites or blockers.
A proposed implementation sequence that follows the phases in this document.
Phase completion gate

STOP. Do not begin Phase 1 until the project owner approves the inspection report and any necessary setup changes.

Do not rewrite an existing project simply because a fresh scaffold would be easier.

Phase 1 — Application Foundation and Frontend Design System
Goal

Establish the application foundation and create the initial polished frontend.

Tasks
Configure or verify Next.js with App Router.
Configure or verify TypeScript.
Configure or verify Tailwind CSS.
Establish the project's global styling and typography.
Create a consistent colour palette and spacing system.
Build the main BeforePay page.
Implement the main investigation form layout.
Add the seller handle, product image, product description, and quoted price inputs.
Implement client-side validation and clear input feedback.
Add a responsive image preview and replace/remove controls where practical.
Add the main investigation button.
Add a clear introductory explanation of the product.
Build reusable UI elements only where needed.
Create a basic responsive results-page layout using clearly labelled development placeholders if necessary.
Frontend requirements
Remove Unnecessary files

The first phase must establish the visual quality expected from the finished application.

The result should feel like a real consumer product, with:

A strong visual hierarchy.
A clear investigation form.
Professional typography and spacing.
Consistent cards and controls.
Thoughtful empty states.
Responsive desktop and mobile layouts.

Do not spend this phase building fake backend functionality.

Testing

The agent must:

Run the application.
Check for TypeScript errors.
Run the available lint checks.
Test form validation.
Test invalid price input.
Test image type and size validation where implemented.
Inspect the desktop and mobile layouts.
Check the browser console.
Fix issues introduced during this phase.
Deliverables
Working Next.js application.
Initial design system.
Responsive investigation form.
Initial results layout.
Updated setup instructions if required.
Phase completion gate

Report the changed files, tests executed, results, and any known limitations.

STOP. Wait for the project owner's approval before starting Phase 2.

Phase 2 — SerpApi Integration Foundation
Goal

Establish a reliable, secure, reusable server-side integration with SerpApi.

Tasks
Recheck the existing SERPAPI_API_KEY configuration.
Verify that the key is accessed only by server-side code.
Create a small reusable SerpApi request utility.
Use documented request parameters and supported endpoints.
Implement response validation.
Implement basic timeout and error handling.
Handle authentication errors and quota exhaustion.
Ensure API credentials never appear in browser-visible responses.
Define a consistent internal format for successful and failed searches.
Document how the API integration is configured.
Internal result format

Use a predictable result structure, adapted to the actual needs of each check.

For example:

type CheckStatus =
  | "success"
  | "no_results"
  | "failed"
  | "not_run";

type CheckResult<T> = {
  status: CheckStatus;
  data: T | null;
  message?: string;
};

This is a suggested internal contract. Refine it where needed, but keep the structure simple and consistently typed.

Testing
Verify server-side environment variable access without printing its value.
Make a documented test request when valid credentials are available.
Verify successful responses are parsed correctly.
Test invalid input and API error handling.
Confirm that secret values are not returned to the frontend.
Confirm that failed API requests cannot be mistaken for successful results.

Do not consume the free API quota with repeated unnecessary requests.

Deliverables
Reusable SerpApi request utility.
Environment configuration validation.
Typed error and result handling.
Tests for successful and unsuccessful API requests where feasible.
Phase completion gate

Report the real test outcomes, including whether a live request succeeded.

STOP. Wait for approval before starting Phase 3.

Phase 3 — Instagram Seller Profile Check
Goal

Implement the first complete investigation capability.

Tasks
Review the official Instagram Profile API documentation.
Confirm the supported request parameters and response fields.
Implement a dedicated TypeScript seller-profile function.
Accept the supported seller handle or public profile URL.
Normalize and validate the user input.
Retrieve the available public profile information.
Map the actual response into a typed internal data structure.
Handle invalid, unavailable, private, or unsupported profiles appropriately.
Connect the result to the frontend.
Build the seller profile evidence card using the established design system.
Frontend output

Show available profile details such as:

Username.
Follower count.
Following count.
Post count.
Profile description or other relevant returned details.

Display only information supported by the actual response.

Do not add a trust score or invent profile metrics.

Testing
Test a valid supported public profile when available.
Test invalid input.
Test an unavailable or unsupported profile.
Test an API failure.
Confirm that the frontend displays the real returned data.
Confirm that unavailable fields are handled gracefully.
Test the card on desktop and mobile layouts.
Deliverables
Working seller profile integration.
Typed profile data.
Profile evidence card.
Tests and documented limitations.
Phase completion gate

The seller profile check must work end to end, and the agent must report which tests passed or failed.

STOP. Wait for approval before starting Phase 4.

Phase 4 — Product Image Investigation with Google Lens
Goal

Allow the user to investigate a product image and display relevant visual matches.

Tasks
Review the official Google Lens API documentation.
Determine the supported image input methods.
Select the simplest supported image submission method.
Implement input validation and safe image handling.
Implement the Google Lens request function.
Parse the actual response fields.
Map results into a typed image-match structure.
Preserve original source URLs.
Connect the function to the investigation workflow.
Build the image-match evidence cards.
Image input constraint

Do not assume that a browser File object or local filesystem path can be sent directly to Google Lens.

Inspect the documented API requirements and implement a supported method.

If the endpoint requires a publicly accessible image URL, use a compatible approach only if it fits the approved privacy and cost constraints.

Do not introduce an unnecessary paid image-hosting service.

If the supported input method cannot be implemented within the existing scope and cost constraints, stop and explain the issue before changing the design.

Frontend output

Display:

The user's selected image preview.
Relevant returned visual matches.
Available match titles and source websites.
Available matching images.
Original source links.
A clear no-results state.

Do not claim image theft solely because an image appears on another website.

Testing
Test a supported image input.
Verify the actual request format.
Test a successful Lens response when available.
Test an empty response.
Test an invalid image.
Test an API error.
Confirm that source URLs are preserved.
Confirm that the interface handles missing thumbnails.
Check responsive image-match cards.
Deliverables
Working Google Lens integration.
Image-match data types.
Responsive image-match UI.
Error handling and tests.
Phase completion gate

The image investigation must work with a real supported request when the service is available.

STOP. Wait for approval before starting Phase 5.

Phase 5 — Product Price Comparison with Google Shopping
Goal

Compare the Instagram seller's quoted price against cheaper comparable online listings.

Tasks
Review the official Google Shopping API documentation.
Implement a dedicated shopping search function.
Accept product details, Image and the quoted price.
Normalize prices into a numeric comparison format where parsing is reliable.
Retrieve available product titles, prices, merchant names, ratings, and original listing URLs.
Determine which listings are cheaper than the quoted Instagram price.
Filter out listings equal to or more expensive than the quoted price.
Avoid treating unrelated products as exact matches.
Connect the function to the results page.
Build the price comparison UI if not done.
Required filtering behaviour

If the Instagram seller asks ₹1,999:

Listing price	Display in cheaper alternatives?
₹1,499	Yes
₹1,699	Yes
₹1,999	No
₹2,199	No

Use actual prices returned by SerpApi. The table above is only an example of the required filtering behaviour.

Do not invent missing prices or assume different product variants are identical.

Frontend output

Show:

The quoted Instagram price.
Cheaper qualifying listings.
Available merchant names.
Available product titles and images.
Original listing links.
Relevant product identity information.
If already implemented these just double check and map the api correctly

If no qualifying listings are found, show an informative empty state.

Testing
Test the price filtering logic using controlled unit-test fixtures.
Test that equal and higher prices are excluded.
Test missing and unparseable prices.
Test different currency formats where relevant.
Test real Google Shopping responses when available.
Verify that the actual quoted price is compared correctly.
Confirm that the interface labels comparable products accurately.
Deliverables
Working Google Shopping integration.
Correct cheaper-listing filtering.
Typed shopping results.
Responsive comparison UI.
Unit and integration tests where feasible.
Phase completion gate

The price filtering tests must pass, and the agent must verify the integration with actual returned data when available.

STOP. Wait for approval before starting Phase 6.

Phase 6 — Public Reputation Search
Goal

Find relevant public complaints, reviews, discussions, and news about the investigated seller.

Tasks
Review the official Google Search API documentation.
Review Google Forums and Google News support and response formats.
Confirm the correct API engine and parameters for each supported search.
Implement a reputation search function.
Generate focused search queries using the seller's available identifying information.
Search for terms such as scam, complaint, review, fraud, refund, and not delivered.
Retrieve available titles, snippets, sources, dates, and URLs.
Filter clearly irrelevant results where possible.
Avoid counting duplicate pages as independent complaints.
Preserve source URLs and distinguish search evidence from conclusions.
Build the reputation evidence cards.
Query examples
"seller handle" scam
"seller handle" complaint
"seller handle" review
"seller handle" fraud
"seller handle" refund
"seller handle" "not delivered"

Adapt queries to the actual seller details. Do not automatically search every possible variation if it would waste the API quota.

Reputation rules
Do not assume similar usernames belong to the same seller.
Do not describe allegations as proven facts.
Do not treat search snippets as independently verified evidence.
Do not treat the absence of search results as proof of safety.
Do not imply complete coverage of the internet.
Preserve the original URLs for user verification.
Testing
Test successful search responses.
Test no-results responses.
Test irrelevant or ambiguous search results.
Test duplicate-result handling.
Test missing URLs and snippets.
Test API errors.
Confirm that allegations are labelled appropriately in the UI.
Deliverables
Working reputation search integration.
Typed reputation results.
Source-linked evidence cards.
Error handling and tests.
Phase completion gate

Confirm that the supported search types work, or explicitly document any API or quota limitations.

STOP. Wait for approval before starting Phase 7.

Phase 7 — Evidence Aggregation and Local AI Analysis
Goal

Combine the results from all four investigation checks and use the local AI model to produce a readable, evidence-based report.

Tasks
Define a single typed investigation evidence structure.
Aggregate the seller profile, image matches, shopping results, and reputation results.
Preserve the status of every investigation check.
Keep successful results even if another check fails.
Review the current LangChain.js documentation.
Verify that Ollama is running and Gemma 3 4B is available.
Configure LangChain.js to use the local Ollama model through a supported integration.
Implement the report-generation function.
Supply structured evidence to the model.
Require the model to summarize only the supplied evidence.
Validate the model's output before returning it to the frontend.
Keep original source URLs and retrieved factual values in application-controlled data structures.
Build the investigation summary and checklist UI.
Evidence structure

The exact structure may evolve during implementation, but it must distinguish the following sections:

type InvestigationEvidence = {
  sellerProfile: CheckResult<unknown>;
  imageMatches: CheckResult<unknown>;
  priceComparison: CheckResult<unknown>;
  reputationSearch: CheckResult<unknown>;
};

The unknown placeholders above are illustrative only. Replace them with proper, feature-specific TypeScript types before integrating the completed checks.

AI responsibilities

The local model may:

Summarize collected evidence.
Identify patterns across the returned results.
Explain why particular observations may deserve attention.
Highlight inconsistencies.
Produce a concise checklist based on the available evidence.

The local model must not:

Invent complaints or sources.
Invent prices or profile statistics.
Create unsupported source links.
Declare the seller definitively safe or fraudulent.
Generate a numerical scam probability.
Convert missing data into negative evidence.
Claim that a search succeeded when it failed.

The model must treat external search content as untrusted evidence, not as instructions to follow.

Recommended output format

Use a predictable structured report format, validated with a TypeScript schema or another lightweight validation method.

The report must include:

Investigation Summary.
Seller Profile Signals.
Product Image Matches.
Cheaper Comparable Listings.
Public Complaints and Discussions.
Before You Pay Checklist.
Sources.

The application should retain control of retrieved source URLs and factual values. Do not rely on the model to reproduce them perfectly from memory.

Testing
Test with a complete evidence fixture.
Test with partial evidence.
Test when all search checks return no results.
Test when one or more checks fail.
Test Ollama connection failure.
Test when the model returns malformed or incomplete output.
Verify that model output does not invent missing facts.
Confirm that source links remain connected to the original evidence.
Confirm that the frontend displays the report sections correctly.

Use fixtures for repeatable tests, but clearly distinguish fixtures from live evidence.

Deliverables
Typed evidence aggregation.
Working LangChain.js and Ollama integration.
Structured report generation.
Model error handling.
Report UI.
Tests for complete and partial evidence.
Phase completion gate

The report must work with real collected evidence and the local model when available. Any model or evidence limitation must be clearly documented.

STOP. Wait for approval before starting Phase 8.

Phase 8 — Complete End-to-End Integration
Goal

Connect all completed features into one working user journey.

Tasks
Connect the frontend form to the backend investigation route.
Validate the submitted input on the server.
Coordinate the four investigation functions.
Run independent checks concurrently where practical.
Avoid unnecessary duplicate searches.
Track the status of each check.
Aggregate the evidence.
Generate the final report through LangChain and Ollama.
Return a predictable response to the frontend.
Display the investigation progress and final results.
Handle partial failures without fabricating successful results.
Ensure the user can complete the full workflow locally.
End-to-end flow
User submits the investigation form
              |
              v
Validate all required inputs
              |
              v
Run supported investigation checks
              |
              v
Collect successful results and failures
              |
              v
Aggregate structured evidence
              |
              v
Generate the AI summary locally
              |
              v
Validate the report output
              |
              v
Display the final report and sources
Testing

Test the following scenarios:

All four checks return usable results.
The seller profile is unavailable.
Google Lens returns no results.
Google Shopping returns no cheaper comparable listings.
Reputation search returns no relevant results.
One API request fails while other checks succeed.
SerpApi credentials are invalid or the quota is exhausted.
Ollama is not running.
The local model returns invalid output.
The user submits invalid form data.
The user submits an unsupported image.
The user submits the form multiple times.
The report renders correctly on desktop and mobile.
Deliverables
Fully connected investigation workflow.
Complete report rendering.
Error and empty states.
End-to-end tests or a documented manual test report.
Updated README.
Phase completion gate

The application must complete the full local workflow using real API responses and the local model, subject to service availability.

STOP. Wait for approval before starting Phase 9.

Phase 9 — Quality Assurance and Hackathon Readiness
Goal

Verify that the completed MVP is reliable, polished, and ready to demonstrate.

Tasks
Review the application against every requirement in PRD.md.
Review the implementation against this architecture.
Remove unused code and unnecessary dependencies introduced during development.
Check for exposed credentials.
Check the .gitignore configuration.
Verify the .env.example file contains placeholders only.
Run TypeScript checks.
Run lint checks.
Run available automated tests.
Manually test the full investigation workflow.
Review the visual design on desktop and mobile.
Verify loading, error, empty, and partial-success states.
Confirm that source links work and lead to the returned sources.
Confirm that no fake data appears as live evidence.
Update the README with setup and execution instructions.
Document the role of SerpApi and why it is essential to the project.
Document the local Ollama/Gemma 3 4B requirement.
Record any known limitations.
Frontend quality review

The finished interface should feel cohesive from the first screen to the final report.

Check:

Visual consistency.
Typography and spacing.
Responsive layouts.
Input validation.
Image upload and preview.
Investigation progress.
Evidence card hierarchy.
Price comparison readability.
Source link visibility.
Error and empty states.
Keyboard accessibility.
Browser console errors.

Do not add unnecessary features during this phase. Improve the existing experience within the approved scope.

Final acceptance criteria

The project is ready when:

All required PRD features have been implemented.
All completed features have been tested.
Known failures and limitations are documented.
The local application starts using the documented instructions.
The API key remains server-side.
The four investigation checks are connected to the report.
The report uses the actual evidence collected.
The interface is polished and responsive.
The README is suitable for the public repository.
No unapproved features have been added.
Phase completion gate

Provide a final acceptance report listing:

Features completed.
Tests executed and their outcomes.
Tests that could not be executed and why.
Known limitations.
Required environment configuration.
Exact commands for running the project locally.

STOP. The MVP is complete only after the project owner reviews and approves the final result.

9. Rules for Every Phase

These rules apply throughout the project.

9.1 One phase at a time

The agent must never begin a later phase automatically.

After completing the current phase:

Summarize the work completed.
List the files created or changed.
Report the tests executed.
Report which tests passed or failed.
Identify any limitations or unresolved issues.
Provide the manual testing steps for the project owner.
Stop and wait for explicit approval.

Approval means the project owner has reviewed the results and explicitly instructed the agent to continue.

9.2 Test before reporting completion

Do not claim a feature works merely because code has been generated.

Run the relevant checks and report the actual results.

If a live API test cannot run because credentials, quota, network access, or service availability are missing, state the limitation. Do not substitute a fixture and claim that the live integration succeeded.

9.3 Preserve working code

Before changing an existing implementation:

Inspect the relevant files.
Understand the current behavior.
Avoid unnecessary rewrites.
Keep changes limited to the current phase.
Avoid breaking previously approved functionality.
9.4 No unapproved scope expansion

Do not add features because they appear useful or easy to implement.

If a requirement cannot be met with the approved architecture:

Explain the limitation.
Describe the smallest viable alternative.
Explain any cost, privacy, or complexity impact.
Ask the project owner for approval.
Wait for approval before implementing a scope change.
9.5 Keep the implementation understandable

Use clear names, small functions, typed data structures, and straightforward error handling.

Do not introduce abstractions that are more complex than the problem they solve.

9.6 Use real data responsibly

Fixtures are acceptable for unit tests and isolated frontend development.

However:

Never present fixtures as real API results.
Never invent source links.
Never claim that an API request succeeded when it did not.
Preserve original evidence and distinguish it from model-generated interpretation.
9.7 Manage SerpApi quota
Reuse results within the current investigation where appropriate.
Avoid repeated identical requests.
Run only searches required by the current workflow.
Use the smallest sufficient number of search requests.
Record which search operations are performed.
Do not waste quota repeatedly testing the same successful endpoint.
9.8 Protect credentials

Never reveal the actual API key in source code, browser output, logs, screenshots, test reports, or documentation.

The agent must use the existing server-side environment configuration.

9.9 Maintain the phase record

Maintain a concise development record, such as IMPLEMENTATION_STATUS.md, containing:

Current phase.
Completed phases.
Tests executed.
Test results.
Known limitations.
Current blockers.
The last phase explicitly approved by the project owner.

Update this file at the end of a phase. Updating the record does not grant permission to begin the next phase.

10. Required Response Format at the End of Each Phase

At the end of every phase, the agent must respond using this format:

Phase [Number] — Completion Report

Objective: What the phase was supposed to achieve.

Implemented:

List the completed work.

Files changed:

List the created or modified files.

Tests executed:

List the actual checks and test commands.

Test results:

Passed.
Failed.
Not run, with reasons.

Manual verification:

Give the project owner clear steps to verify the feature.

Known issues:

List unresolved problems and limitations.

Scope confirmation:

Confirm whether any unapproved dependencies or features were added.

Next phase: State the next phase number, but do not begin it.

Status: Awaiting project-owner approval.

The agent must not start another phase in the same response or continue implementing it in the background.

11. Initial Instruction to the AI Coding Agent

Read PRD.md and architecture.md completely before doing any implementation work.

You are responsible for building BeforePay according to these documents, using the specified technology stack and phase gates.

Start with Phase 0 only.

Inspect the existing project, environment configuration, available local Ollama model, and relevant documentation. Do not expose the API key or print its value.

Do not modify application code until the Phase 0 inspection and plan are ready for review.

Report your findings, identify blockers, and stop for approval.

After the project owner approves Phase 0, implement Phase 1 only. Test it, report the results, and stop again.

Repeat this process for every subsequent phase.

Never skip a phase, never move ahead without approval, never claim untested functionality works, and never add features outside the approved PRD.

The goal is a reliable, evidence-based, visually polished BeforePay MVP that can be demonstrated locally and explained clearly to a non-technical audience.