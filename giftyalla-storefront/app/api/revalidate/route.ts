import { createHmac, timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'

// Point Shopify webhooks (products/update, products/create, products/delete, collections/update)
// at  https://YOUR-SITE/api/revalidate  so edits in Shopify appear on the site within seconds.
export async function POST(req: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  const body = await req.text()
  const sent = req.headers.get('x-shopify-hmac-sha256') ?? ''
  if (!secret) return new Response('Not configured', { status: 501 })
  const expected = createHmac('sha256', secret).update(body).digest('base64')
  const a = Buffer.from(sent)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return new Response('Unauthorized', { status: 401 })

  const topic = req.headers.get('x-shopify-topic') ?? ''
  const payload = JSON.parse(body) as { handle?: string }
  if (topic.startsWith('products/')) {
    revalidateTag('products', 'max')
    if (payload.handle) revalidateTag(`product:${payload.handle}`, 'max')
  }
  if (topic.startsWith('collections/')) {
    revalidateTag('collections', 'max')
    if (payload.handle) revalidateTag(`collection:${payload.handle}`, 'max')
  }
  return Response.json({ ok: true })
}
