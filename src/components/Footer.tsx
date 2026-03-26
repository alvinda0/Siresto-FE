import React from 'react'
import { Oswald } from 'next/font/google'

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

interface FooterProps {
  companyName?: string
  year?: string
  version?: string
}

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer
      className={`backdrop-blur-xl px-8 py-2 ${oswald.className} md:block hidden border-t-0 shadow-lg`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(0,123,255,0.08) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.3)',
      }}
    >
      <div className="flex items-center justify-end max-w-full">
        {/* Empty footer - content removed */}
      </div>
    </footer>
  )
}

export default Footer