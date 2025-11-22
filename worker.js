export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. Attempt to fetch the asset (HTML, JS, CSS, Image)
    let response = await env.ASSETS.fetch(request);

    // 2. SPA Fallback: If it's a 404 and NOT a file (doesn't have a dot extension), 
    // serve index.html so React can handle the route.
    if (response.status === 404 && !url.pathname.includes('.')) {
      response = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }

    // 3. Runtime Injection: If serving HTML, inject the API Key from the Environment
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('text/html')) {
      let text = await response.text();
      
      // Get the key from Cloudflare Secrets/Variables
      // If missing, we inject a specific string so the UI knows it was a server config issue
      const apiKey = env.API_KEY || "MISSING_ON_SERVER"; 
      
      // Replace the placeholder in the window.CF_CONFIG object
      text = text.replace(/__CLOUDFLARE_API_KEY__/g, apiKey);
      
      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }

    return response;
  },
};