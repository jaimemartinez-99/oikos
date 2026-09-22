import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
const blocked = ['localhost','127.0.0.1','0.0.0.0','::1']
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  try {
    const { url } = await req.json(); const parsed = new URL(url)
    if (!['http:','https:'].includes(parsed.protocol) || blocked.includes(parsed.hostname) || parsed.hostname.endsWith('.local')) throw new Error('URL no permitida')
    const response = await fetch(parsed, { redirect: 'follow', signal: AbortSignal.timeout(8000), headers: { 'user-agent':'Mozilla/5.0 (compatible; Oikos/1.0)' } })
    if (!response.ok) throw new Error(`El sitio respondió con HTTP ${response.status}`)
    const html = await response.text()
    const entities: Record<string,string> = { '&amp;':'&', '&quot;':'"', '&#39;':"'", '&lt;':'<', '&gt;':'>' }
    const decode = (value:string) => value.replace(/&(amp|quot|#39|lt|gt);/g, token => entities[token] ?? token)
    const get = (key:string) => { for (const tag of html.match(/<meta\s+[^>]*>/gi) ?? []) { const attr=(name:string)=>new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`,'i').exec(tag)?.[2]; if ((attr('property')||attr('name'))?.toLowerCase()===key.toLowerCase()) return decode(attr('content')||'') } }
    const rawImage = get('og:image') ?? get('twitter:image')
    const image_url = rawImage ? new URL(rawImage, response.url).href : undefined
    return Response.json({ title:get('og:title') ?? get('twitter:title') ?? /<title[^>]*>([^<]+)/i.exec(html)?.[1]?.trim(), image_url, description:get('og:description') ?? get('description'), site_name:get('og:site_name') ?? new URL(response.url).hostname }, { headers: corsHeaders })
  } catch (error) { return Response.json({ error: error.message }, { status: 400, headers: corsHeaders }) }
})
