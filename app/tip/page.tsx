import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tip Jar | Solana Colombia',
  description: '¡Apoya mi trabajo con Solana Colombia!',
  openGraph: {
    title: 'Tip Jar | Solana Colombia',
    description: '¡Apoya mi trabajo con Solana Colombia!',
    images: ['/tipjar.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tip Jar | Solana Colombia',
    description: '¡Apoya mi trabajo con Solana Colombia!',
    images: ['/tipjar.png']
  }
}

export default function TipPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Tip Jar</h1>
        <p className="mt-4">¡Apoya mi trabajo con Solana Colombia!</p>
        <img 
          src="/tipjar.png" 
          alt="Tip Jar"
          className="mx-auto mt-8 w-32 h-32"
        />
      </div>
    </main>
  )
}