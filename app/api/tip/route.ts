import { NextResponse } from 'next/server'
import { ActionGetResponse } from '@solana/actions'
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'

const RECIPIENT_ADDRESS = new PublicKey('AczLKrdS6hFGNoTWg9AaS9xhuPfZgVTPxL2W8XzZMDjH') 
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com')

// Helper function to add CORS headers to response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Encoding, Accept-Encoding',
  'X-Action-Version': '1',
  'X-Blockchain-Ids': 'solana'
}

export async function GET() {
  const response: ActionGetResponse = {
    type: 'action',
    icon: '/tipjar.png',
    title: 'Dar propina',
    description: '¡Apoya mi trabajo con Solana Colombia!',
    label: 'Enviar',
    links: {
      actions: [
        {
          type: 'post',
          label: '0.01 SOL',
          href: '/api/tip?amount=0.01'
        },
        {
          type: 'post',
          label: '0.1 SOL', 
          href: '/api/tip?amount=0.1'
        },
        {
          type: 'post',
          label: 'Cantidad personalizada',
          href: '/api/tip?amount={amount}',
          parameters: [
            {
              name: 'amount',
              label: 'Cantidad en SOL',
              required: true
            }
          ]
        }
      ]
    }
  }

  return NextResponse.json(response, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const senderAddress = new PublicKey(body.account)
    const url = new URL(request.url)
    const amountStr = url.searchParams.get('amount')
    
    if (!amountStr) {
      throw new Error("Amount parameter is required")
    }
 
    const amount = parseFloat(amountStr)
    if (isNaN(amount)) {
      throw new Error("Invalid amount")
    }
    
    const lamports = Math.round(amount * LAMPORTS_PER_SOL)
    const transaction = new Transaction()
    const instruction = SystemProgram.transfer({
      fromPubkey: senderAddress,
      toPubkey: RECIPIENT_ADDRESS,
      lamports
    })
    
    transaction.add(instruction)
    transaction.feePayer = senderAddress
    
    const latestBlockhash = await connection.getLatestBlockhash()
    transaction.recentBlockhash = latestBlockhash.blockhash
 
    const serializedTransaction = transaction.serialize({ 
      requireAllSignatures: false,
      verifySignatures: false
    })
 
    return NextResponse.json({
      transaction: Buffer.from(serializedTransaction).toString('base64'),
      message: `Gracias por tu propina de ${amount} SOL!`
    }, { headers: corsHeaders })
 
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500, headers: corsHeaders }
    )
  }
 }

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}