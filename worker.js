export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. Attempt to fetch the asset (HTML, JS, CSS, Image)
    const response = await env.ASSETS.fetch(request);

    // 2. If the file exists (200) or is a redirect (304), return it immediately
    if (response.ok || response.status === 304) {
      return response;
    }

    // 3. SPA Fallback: If it's a 404 and NOT a file (doesn't have a dot extension), 
    // serve index.html so React can handle the route.
    if (response.status === 404 && !url.pathname.includes('.')) {
      return await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }

    // 4. Otherwise return the original response (e.g. a true 404 for a missing image)
    return response;
  },
};