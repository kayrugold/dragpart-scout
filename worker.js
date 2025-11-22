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
      const apiKey = env.API_KEY || ""; 
      
      // Replace the placeholder in the window.CF_CONFIG object
      text = text.replace(/__CLOUDFLARE_API_KEY__/g, apiKey);
      
      // Create new headers to add debug info
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Debug-Key-Status', apiKey ? 'Key_Found' : 'Key_Missing');
      // Security: Only log the keys names (not values) to debug what vars exist
      newHeaders.set('X-Env-Keys', Object.keys(env).join(','));

      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    return response;
  },
};