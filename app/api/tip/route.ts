// This file implements a Solana Action API endpoint for a tip jar application
// It allows users to send SOL tokens to a specified recipient address

import { NextResponse } from 'next/server'
import { ActionGetResponse } from '@solana/actions'
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'

// Recipient wallet address that will receive the tips
const RECIPIENT_ADDRESS = new PublicKey('AczLKrdS6hFGNoTWg9AaS9xhuPfZgVTPxL2W8XzZMDjH') 

// Initialize Solana connection, fallback to devnet if no RPC URL provided
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com')

// CORS headers required for cross-origin requests (needed for Solana Actions to work)
// These headers allow the API to be called from any domain (*)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Encoding, Accept-Encoding',
  'X-Action-Version': '1',          // Required by Solana Actions spec
  'X-Blockchain-Ids': 'solana'      // Identifies this as a Solana blockchain action
}

// GET endpoint - Returns metadata about the tip jar action
// This is called first to display information to the user
export async function GET() {
  const response: ActionGetResponse = {
    type: 'action',                 // Identifies this as an action that can be performed
    icon: '/tipjar.png',           // Icon to display in UI
    title: 'Dar propina',          // Action title (Spanish: "Give tip")
    description: '¡Apoya mi trabajo con Solana Colombia!', // Action description
    label: 'Enviar',               // Button label (Spanish: "Send")
    links: {
      // Define available tip amounts as separate actions
      actions: [
        {
          type: 'post',            // This action requires a POST request
          label: '0.01 SOL',       // Display amount
          href: '/api/tip?amount=0.01' // Endpoint with amount parameter
        },
        {
          type: 'post',
          label: '0.1 SOL', 
          href: '/api/tip?amount=0.1'
        },
      ]
    }
  }

  return NextResponse.json(response, { headers: corsHeaders })
}

// POST endpoint - Creates and returns a Solana transaction for the tip
// This is called when user selects an amount to tip
export async function POST(request: Request) {
  try {
    console.log('POST request started')
    // Extract sender's wallet address from request body
    const body = await request.json()
    console.log('Request body:', body)
    
    // Validate sender's address
    const senderAddress = new PublicKey(body.account)
    if (senderAddress.equals(SystemProgram.programId)) {
      throw new Error("Invalid sender address")
    }

    console.log('Sender address:', senderAddress.toString())
    
    // Get tip amount from URL parameters
    const url = new URL(request.url)
    const amountStr = url.searchParams.get('amount')
    console.log('Amount string:', amountStr)
    
    // Validate amount parameter
    if (!amountStr || amountStr === '{amount}') {
      throw new Error("Amount parameter is required")
    }

    const amount = parseFloat(amountStr)
    console.log('Parsed amount:', amount)
    
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount")
    }
    
    // Convert SOL amount to lamports (1 SOL = 1e9 lamports)
    const lamports = Math.round(amount * LAMPORTS_PER_SOL)
    console.log('Lamports:', lamports)

    // Create Solana transaction for the tip
    const transaction = new Transaction()
    // Add transfer instruction from sender to recipient
    const instruction = SystemProgram.transfer({
      fromPubkey: senderAddress,
      toPubkey: RECIPIENT_ADDRESS,
      lamports
    })
    
    transaction.add(instruction)
    transaction.feePayer = senderAddress // Sender pays transaction fee
    
    // Get latest blockhash for transaction validity window
    const latestBlockhash = await connection.getLatestBlockhash()
    transaction.recentBlockhash = latestBlockhash.blockhash

    // Serialize transaction without signatures (user will sign it)
    const serializedTransaction = transaction.serialize({ 
      requireAllSignatures: false,
      verifySignatures: false
    })

    // Return base64 encoded transaction for wallet to sign
    return NextResponse.json({
      transaction: Buffer.from(serializedTransaction).toString('base64'),
      message: `Gracias por tu propina de ${amount} SOL!` // Thank you message
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('POST Error:', error)
    // Return user-friendly error message
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// OPTIONS endpoint - Required for CORS preflight requests
// Browsers make this request before POST to check if cross-origin requests are allowed
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}