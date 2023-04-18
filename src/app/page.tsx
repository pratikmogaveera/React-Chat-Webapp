import './globals.css'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import Button from '@/components/ui/Button'
import { db } from '@/lib/db'

const inter = Inter({ subsets: ['latin'] })

export default async function Home() {


    return (
        <div className='flex justify-center items-center gap-2 h-[100vh] w-full bg-red-400'>
            <Button size='lg'>Hello</Button>
        </div>
    )
}
