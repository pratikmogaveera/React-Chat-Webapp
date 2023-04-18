import AddFriendButton from '@/components/ui/AddFriendButton'
import { FC } from 'react'

const page = async ({ }) => {
    return (
        <main className='py-8'>
            <h1 className='font-bold text-5xl mb-8'>
                Add a friend
            </h1>
            <AddFriendButton />
        </main>
    )
}

export default page