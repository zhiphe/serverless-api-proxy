export default {
  async function fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === '/' || pathname === '/index.html') {
      return new Response('service is running!', {
        status: 200,
        headers: {
          'Content-Type': 'text/html'
        }
      });
    } 
    if(pathname === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    if (request.cf?.colo === 'HKG') {
      return await fetch(request.url, {
        body: request.body,
        method: request.method,
        headers: request.headers,
      })
    }

    const apiMapping = {
      '/discord': 'https://discord.com/api',
      '/telegram': 'https://api.telegram.org',
      '/openai': 'https://api.openai.com',
      '/claude': 'https://api.anthropic.com',
      '/gemini': 'https://generativelanguage.googleapis.com',
      '/meta': 'https://www.meta.ai/api',
      '/groq': 'https://api.groq.com',
      '/x': 'https://api.x.ai',
      '/cohere': 'https://api.cohere.ai',
      '/huggingface': 'https://api-inference.huggingface.co',
      '/together': 'https://api.together.xyz',
      '/novita': 'https://api.novita.ai',
      '/portkey': 'https://api.portkey.ai',
      '/fireworks': 'https://api.fireworks.ai',
      '/openrouter': 'https://openrouter.ai/api'
    }
  
    const [prefix, rest] = extractPrefixAndRest(pathname, Object.keys(apiMapping));
    if (prefix) {
      const baseApiUrl = apiMapping[prefix];
      const targetUrl = `${baseApiUrl}${rest}`;
  
      try {
        const newRequest = new Request(targetUrl, {
          method: request.method,
          headers: new Headers(request.headers),
          body: request.body
        });
  
        const response = await fetch(newRequest);
        return response;
      } catch (error) {
        console.error('Failed to fetch:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }
  }
}

function extractPrefixAndRest(pathname, prefixes) {
  for (const prefix of prefixes) {
    if (pathname.startsWith(prefix)) {
      return [prefix, pathname.slice(prefix.length)];
    }
  }
  return [null, null];
}
