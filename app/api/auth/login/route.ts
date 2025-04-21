import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// In a real application, you would:
// 1. Hash passwords before storing
// 2. Use a database to store users
// 3. Implement proper session management
// 4. Use environment variables for sensitive data
const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASSWORD = 'admin123'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create a session token (in a real app, use proper JWT or session management)
    const token = btoa(`${email}:${new Date().getTime()}`)

    // Set the token in cookies
    ;(await
          // Set the token in cookies
          cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // Set expiry to 24 hours
      maxAge: 60 * 60 * 24,
    })

    return NextResponse.json(
      { message: 'Logged in successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}