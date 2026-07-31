const CONVEX_SITE = 'https://terrific-octopus-580.convex.site'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': 'https://traceability.ucollect.dev',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Vary': 'Origin',
}

export async function onRequest(context: { request: Request; params: { path: string | string[] } }) {
  const { request, params } = context
  const subpath = Array.isArray(params.path) ? params.path.join('/') : (params.path ?? '')
  const url = new URL(request.url)
  const target = `${CONVEX_SITE}/api/auth/${subpath}${url.search}`

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const proxied = new Request(target, {
    method: request.method,
    headers: request.headers,
    body: request.body ?? undefined,
    redirect: 'follow',
  })

  const res = await fetch(proxied)
  const headers = new Headers(res.headers)

  Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v))

  // Strip Domain= from Set-Cookie so cookie scopes to traceability.ucollect.dev
  const rawCookie = res.headers.get('set-cookie')
  if (rawCookie) {
    headers.set('set-cookie', rawCookie.replace(/;\s*Domain=[^;]*/gi, ''))
  }

  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
}
