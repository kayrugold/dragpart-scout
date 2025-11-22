# DragPart Scout 🏎️💨

A smart assistant for drag racers to find, compare, and track car parts across the web using AI-powered search grounding. Built with React, Tailwind CSS, and the Google Gemini API.

## Features

*   **AI-Powered Search**: Uses Gemini 2.5 Flash to understand drag racing context and specific part requirements.
*   **Smart Browsing**: Suggests upgrades based on vehicle platform (e.g., "LS3 Swap").
*   **Real-time Grounding**: Fetches live search results from reputable vendors (Summit, JEGS, eBay Motors, etc.).
*   **Garage Profile**: Saves your car details so you don't have to re-type them for every search.
*   **Search History**: Keeps track of your previous scouts.

## Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/dragpart-scout.git
    cd dragpart-scout
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key (Local Development)**
    *   Create a file named `.env` in the root directory.
    *   Add your Google GenAI API Key:
        ```env
        API_KEY=your_google_api_key_here
        ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## Deployment (Cloudflare Pages)

When deploying to **Cloudflare Pages**, you must add your API key in the dashboard:

1.  Go to your Project Settings in Cloudflare Pages.
2.  Click **Environment Variables**.
3.  Add a new variable:
    *   **Variable Name**: `API_KEY`
    *   **Value**: *(Paste your actual Google API Key here)*
4.  Redeploy your site.

### Troubleshooting Deployment

**Error: "Missing: @esbuild/win32-x64..."**
If your build fails on Cloudflare with an error about missing platform dependencies (like `win32-x64` or `darwin`), it means your `package-lock.json` is synced to your local OS but conflicts with Cloudflare's Linux servers.

**Fix:**
Run this command in your terminal to regenerate a neutral lockfile:
```bash
npm run fix-deps
```
Then commit and push the changes.

### How to Update the App on Cloudflare
To push your latest code changes to the live site:

1.  **Commit your changes** to git:
    ```bash
    git add .
    git commit -m "Updated app features"
    ```
2.  **Push to your repository**:
    ```bash
    git push origin main
    ```
3.  **Automatic Build**: Cloudflare Pages detects the push and will automatically rebuild and deploy your site (usually takes 1-2 minutes).

## Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **AI**: Google Gemini API (`@google/genai`)
*   **Icons**: Lucide React