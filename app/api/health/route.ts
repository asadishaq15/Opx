export async function GET() {
  return Response.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'ScrollTrigger 3D Website Template API is running'
  })
}
