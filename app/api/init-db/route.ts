import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/init-db'

export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json({ success: true, message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json(
      { success: false, message: 'Error initializing database', error: (error as Error).message },
      { status: 500 }
    )
  }
} 