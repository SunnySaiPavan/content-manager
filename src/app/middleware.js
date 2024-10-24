import { NextResponse } from 'next/server'
import { supabase } from '@/src/supabase'

export async function middleware(request) {
  // Exclude auth routes from middleware
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }

  // Extract the token
  const token = authHeader.split(' ')[1]
  
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid authorization header format' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }

  try {
    // Verify the JWT token using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      )
    }

    // Add user information to the request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication error' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }
}

export const config = {
  matcher: '/api/:path*',
}
