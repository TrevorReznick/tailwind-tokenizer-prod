import type { APIRoute } from "astro"

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.json()
  const { message } = formData
  
  if (message !== 'hello') {
    return new Response(JSON.stringify({ error: 'Messaggio non valido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  return new Response(JSON.stringify({ 
    jobId: 12345, 
    message: 'Conversione avviata' 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
  
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ message: 'Endpoint GET funzionante' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}