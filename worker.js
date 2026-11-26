export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      if (url.hostname === 'api.bisile.co.za') return new Response('Not Found', { status: 404 });
      return env.ASSETS.fetch(request);
    }

    const upstream = new URL(env.API_UPSTREAM_URL);
    upstream.pathname = url.pathname;
    upstream.search = url.search;

    const upstreamRequest = new Request(upstream, request);
    upstreamRequest.headers.delete('host');
    upstreamRequest.headers.delete('origin');
    upstreamRequest.headers.delete('referer');
    return fetch(upstreamRequest);
  },
};
