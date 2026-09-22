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
    const response = await fetch(parsed, { redirect: 'follow', signal: AbortSignal.timeout(8000), headers: { 'user-agent':'Oikos metadata bot' } })
    const html = await response.text(); const get = (key:string) => new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i').exec(html)?.[1]
    return Response.json({ title:get('og:title') ?? /<title[^>]*>([^<]+)/i.exec(html)?.[1]?.trim(), image_url:get('og:image'), description:get('og:description'), site_name:get('og:site_name') ?? parsed.hostname }, { headers: corsHeaders })
  } catch (error) { return Response.json({ error: error.message }, { status: 400, headers: corsHeaders }) }
})
