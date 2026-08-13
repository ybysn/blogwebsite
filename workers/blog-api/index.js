const worker = {
  async fetch(request) {
    const url = new URL(request.url);

    // CORS headers
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    if (url.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response('ok', { headers: { ...cors, 'Content-Type': 'text/plain' } });
    }

    // Short link redirects
    if (url.pathname.startsWith('/go/')) {
      const slug = url.pathname.replace('/go/', '');
      const links = {
        github: 'https://github.com/ybysn',
        blog: 'https://blog.ybysn.org',
        rss: 'https://blog.ybysn.org/feed.xml',
        twitter: 'https://x.com/ybysn',
      };
      const target = links[slug];
      if (target) {
        return Response.redirect(target, 302);
      }
      return new Response('Link not found', { status: 404, headers: cors });
    }

    // Default: redirect to blog
    return Response.redirect('https://blog.ybysn.org', 302);
  },
};

export default worker;
