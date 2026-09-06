const SUPABASE_ORIGIN = 'https://nbxxknkecpnscirfnov.supabase.co'

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info,x-supabase-api-version',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  }
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '*'

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    const incoming = new URL(request.url)
    const target = new URL(SUPABASE_ORIGIN)
    target.pathname = incoming.pathname
    target.search = incoming.search

    const headers = new Headers(request.headers)
    headers.delete('host')

    const upstream = await fetch(target.toString(), {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual'
    })

    const responseHeaders = new Headers(upstream.headers)
    for (const [key, value] of Object.entries(corsHeaders(origin))) {
      responseHeaders.set(key, value)
    }

    // OAuth authorize can return a Location header. Preserve it so the browser
    // can continue to Google and then return to the Living India redirect URL.
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders
    })
  }
}
