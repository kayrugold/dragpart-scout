import { GoogleGenAI } from "@google/genai";
import { CarProfile, SearchResult } from "../types";

export const findCarParts = async (
  car: CarProfile, 
  partQuery: string,
  category: string = "All Categories"
): Promise<Omit<SearchResult, 'id' | 'timestamp'>> => {
  
  const isBrowsing = !partQuery || partQuery.trim() === "";
  const categoryContext = category && category !== 'All Categories'
    ? `Focus specifically on parts within the "${category}" category.`
    : '';

  const vehicleStr = `${car.year} ${car.make} ${car.model}`;

  let prompt = `
    I am building a drag racing car. 
    Vehicle: ${vehicleStr} with a ${car.engine} engine.
  `;

  if (isBrowsing) {
    // Browsing Mode Prompt
    prompt += `
    I am looking for recommendations in the "${category}" category to improve my car's drag racing performance.

    Please identify 5-6 of the most effective upgrades or replacement parts for this specific vehicle platform in the ${category} system.

    For each recommended part type, provide a bulleted list item with the following structure:

    *   **Part Name**: [Common name for the upgrade]
    *   **Action**: [Scout Options for {Part Name}](search:{Part Name})
    *   **Performance Benefit**: Why it helps in drag racing.
    *   **Estimated Price**: Cost range.

    Sort by impact. 
    STRICTLY DO NOT USE TABLES. Use standard bulleted lists.
    `;
  } else {
    // Specific Search Prompt
    prompt += `
    Part needed: ${partQuery}.
    ${categoryContext}

    Please search for this part available for sale online for my ${vehicleStr}.
    
    1. Find 6-8 distinct, real-world options from a broad range of sellers.
       - CHECK BOTH: The hardcoded vendors below AND any other reputable performance shops found via Google Search (e.g., DragRacingWheels, Holley, AmericanMuscle, etc.).
    
    2. **NO BROKEN LINKS RULE (CRITICAL)**: 
       - **NEVER** output a direct product page URL (e.g., do NOT use 'summitracing.com/parts/...' or 'realtruck.com/p/...'). These links break too easily.
       - **INSTEAD**: You MUST construct a **SEARCH URL**.

    **SEARCH LINK CONSTRUCTION RULES**:
    
    A) **For Known Vendors (Use these templates)**:
    - Summit Racing: \`https://www.summitracing.com/search?keyword=${encodeURIComponent(vehicleStr)} {Part Name}\`
    - JEGS: \`https://www.jegs.com/webapp/wcs/stores/servlet/SearchResultsPageCmd?storeId=10001&catalogId=10002&langId=-1&q=${encodeURIComponent(vehicleStr)} {Part Name}\`
    - RealTruck: \`https://www.realtruck.com/search/?q=${encodeURIComponent(vehicleStr)} {Part Name}\`
    - Speedway Motors: \`https://www.speedwaymotors.com/Search?query=${encodeURIComponent(vehicleStr)} {Part Name}\`
    - eBay Motors: \`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(vehicleStr)} {Part Name}\`
    - Temu: \`https://www.temu.com/search_result.html?search_key=${encodeURIComponent(vehicleStr)} {Part Name}\`
    - LKQ Online: \`https://www.lkqonline.com/?q=${encodeURIComponent(vehicleStr)} {Part Name}\`

    B) **For Discovered Vendors (Universal Site Search)**:
    - If you find a great part at a store not listed above (e.g. dragracingwheels.com), USE IT.
    - **Link Format**: \`https://www.google.com/search?q=site:{domain}%20${encodeURIComponent(vehicleStr)}%20{Part Name}\`
    - *Example*: \`https://www.google.com/search?q=site:dragracingwheels.com%201969%20Camaro%20Drag%20Wheels\`

    3. **Format the Output**:
       For each option, provide a bullet point with:
       - **Product**: The specific brand and part name (e.g., "EBC Greenstuff 6000 Brake Kit").
       - **Link**: \`[Find at {Store Name}]({Search URL from rules above})\`
         **IMPORTANT**: Do NOT put a space between ']' and '('. Example: [Link](URL).
       - **Price**: Estimated Price.
       - **Notes**: Key spec or quality note.
    
    4. Sort by Price (Low to High).
    
    STRICTLY DO NOT USE TABLES. Use standard bulleted lists.
    `;
  }

  // API Key Priority:
  // 1. Runtime Injection (Cloudflare Production via worker.js)
  // 2. Build-time Environment Variable (Standard Vite)
  const cfKey = window.CF_CONFIG?.API_KEY;
  const localKey = import.meta.env.VITE_API_KEY;

  // DEBUGGING LOGS
  console.log("[Gemini Service] CF Key detected:", cfKey && cfKey !== "__CLOUDFLARE_API_KEY__");
  console.log("[Gemini Service] Local Key detected:", !!localKey);
  
  let apiKey = (cfKey && cfKey !== "__CLOUDFLARE_API_KEY__") ? cfKey : localKey;

  if (!apiKey || apiKey === "__CLOUDFLARE_API_KEY__" || apiKey === "__VITE_API_KEY__") {
    console.error("API Key Failure. CF_CONFIG:", window.CF_CONFIG, "Env:", import.meta.env);
    throw new Error("API Key is missing. The Cloudflare Worker did not inject the key correctly.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        systemInstruction: "You are an expert drag racing mechanic and parts scout. Your highest priority is ensuring part COMPATIBILITY for the specific vehicle engine and chassis. Your second priority is ensuring links DO NOT 404 (link to search pages only). Be specific with part names. Include results from budget options (Temu) to premium race shops (Summit, JEGS).",
        temperature: 0.3,
      },
    });

    // Extract text
    const text = response.text || "No details found.";

    // Extract grounding chunks (URLs)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      car,
      partQuery: isBrowsing ? `Browse: ${category}` : partQuery,
      aiResponseText: text,
      // Map to our internal type to be safe
      groundingChunks: groundingChunks.map((chunk: any) => ({
        web: chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : undefined
      })).filter((c: any) => c.web !== undefined)
    };

  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};