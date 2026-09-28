import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36'
type Product = { name: string; price: number; unitPrice?: number; unit?: string; url: string }

const amount = (value: unknown) => Number(String(value ?? '').replace(',', '.'))
const product = (name: unknown, price: unknown, url: unknown, unitPrice?: unknown, unit?: unknown): Product | null => {
  const value = amount(price)
  if (typeof name !== 'string' || !name.trim() || !Number.isFinite(value) || value <= 0 || typeof url !== 'string') return null
  const result: Product = { name: name.trim(), price: value, url }
  const unitValue = amount(unitPrice)
  if (Number.isFinite(unitValue) && unitValue > 0 && typeof unit === 'string') {
    result.unitPrice = unitValue
    result.unit = unit
  }
  return result
}

const extractObject = (html: string, key: string) => {
  const marker = html.indexOf(`"${key}"`)
  if (marker < 0) throw new Error('El catálogo no incluye productos legibles')
  const start = html.indexOf('{', marker)
  let depth = 0
  let quoted = false
  let escaped = false
  for (let index = start; index < html.length; index++) {
    const char = html[index]
    if (quoted) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') quoted = false
    } else if (char === '"') quoted = true
    else if (char === '{') depth++
    else if (char === '}' && --depth === 0) return JSON.parse(html.slice(start, index + 1))
  }
  throw new Error('No se pudo leer el catálogo')
}

async function alcampo(query: string): Promise<Product[]> {
  const response = await fetch(`https://www.compraonline.alcampo.es/search?q=${encodeURIComponent(query)}`, {
    headers: { 'accept': 'text/html,application/xhtml+xml', 'user-agent': userAgent }, signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(`Alcampo respondió con HTTP ${response.status}`)
  const entities = extractObject(await response.text(), 'productEntities') as Record<string, Record<string, any>>
  return Object.values(entities).map(entry => product(entry.name, entry.price?.current?.amount,
    `https://www.compraonline.alcampo.es/products/${encodeURIComponent(entry.retailerProductId)}`,
    entry.price?.unit?.current?.amount, entry.price?.unit?.label)).filter((entry): entry is Product => !!entry).slice(0, 8)
}

async function mercadona(query: string): Promise<Product[]> {
  const app = Deno.env.get('MERCADONA_ALGOLIA_APP') || '7UZJKL1DJ0'
  const key = Deno.env.get('MERCADONA_ALGOLIA_KEY') || '9d8f2e39e90df472b4f2e559a116fe17'
  const warehouse = Deno.env.get('MERCADONA_WAREHOUSE') || 'mad1'
  if (!/^[a-z0-9]+$/i.test(app) || !/^[a-z0-9]+$/i.test(warehouse)) throw new Error('Configuración de Mercadona no válida')
  const response = await fetch(`https://${app}-dsn.algolia.net/1/indexes/products_prod_${warehouse}_es/query`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-algolia-application-id': app, 'x-algolia-api-key': key },
    body: JSON.stringify({ query, hitsPerPage: 8 }), signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(`Mercadona respondió con HTTP ${response.status}`)
  const data = await response.json()
  return (data.hits || []).map((entry: Record<string, any>) => product(entry.display_name, entry.price_instructions?.unit_price,
    entry.share_url, entry.price_instructions?.reference_price, entry.price_instructions?.reference_format))
    .filter((entry: Product | null): entry is Product => !!entry)
}

async function bm(query: string): Promise<Product[]> {
  const response = await fetch(`https://www.online.bmsupermercados.es/api/rest/V1.0/catalog/searcher/products?q=${encodeURIComponent(query)}&limit=8`, {
    headers: { 'accept': 'application/json' }, signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(`BM respondió con HTTP ${response.status}`)
  const data = await response.json()
  const entries = data.catalog?.products
  if (!Array.isArray(entries)) throw new Error('Formato de catálogo BM desconocido')
  return entries.map((entry: Record<string, any>) => {
    const price = entry.priceData?.prices?.find((value: Record<string, unknown>) => value.id === 'PRICE')?.value
    const name = [entry.productData?.brand?.name, entry.productData?.name].filter(Boolean).join(' ')
    return product(name, price?.centAmount, entry.productData?.url,
      price?.centUnitAmount, entry.priceData?.unitPriceUnitType)
  }).filter((entry: Product | null): entry is Product => !!entry)
}

serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  try {
    const { query } = await request.json()
    if (typeof query !== 'string' || !query.trim() || query.length > 80) throw new Error('Producto no válido')
    const providers: Array<[string, (query: string) => Promise<Product[]>]> = [['Alcampo', alcampo], ['Mercadona', mercadona], ['Supermercados BM', bm]]
    const stores = await Promise.all(providers.map(async ([name, search]) => {
      try { return { name, products: await search(query.trim()) } }
      catch (error) { return { name, products: [], error: error instanceof Error ? error.message : 'Consulta no disponible' } }
    }))
    return Response.json({ stores, fetchedAt: new Date().toISOString() }, { headers: corsHeaders })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Solicitud no válida' }, { status: 400, headers: corsHeaders })
  }
})
