import './globals.css'
import { Roboto_Mono } from 'next/font/google'
const inter = Roboto_Mono({ subsets: ['latin'] })
import Navbar from './components/Navbar'


export const metadata = {
  title: 'MOTION',
  description: 'Stay In MOTION',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
<Navbar/>
        <main className=''>
        {children}
        </main>
        

      </body>

    </html>
  )
}
