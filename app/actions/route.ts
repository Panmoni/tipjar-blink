// app/actions/route.ts

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    rules: [
      {
        pathPattern: "/tip",
        apiPath: "/api/tip"
      }
    ]
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json'
    }
  })
}