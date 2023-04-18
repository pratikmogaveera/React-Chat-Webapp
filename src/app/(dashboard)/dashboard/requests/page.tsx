import FriendRequests from '@/components/ui/FriendRequests'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { FC } from 'react'


const page = async ({ }) => {
    const session = await getServerSession(authOptions)
    if (!session)
        notFound()


    // Ids of people who sent us friend requests.
    const incomingSenderIds = await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as string[]

    const incomingFriendReqs = await Promise.all(
        incomingSenderIds.map(async (senderId) => {
            const sender = JSON.parse(await fetchRedis('get', `user:${senderId}`) as string) as User
            
            return {
                senderId,
                senderEmail: sender.email
            }
        })
    )

    return (
        <main className=' py-8 w-full'>
            <h1 className='font-bold text-5xl mb-8'>
                Friend Requests
            </h1>
            <div className='flex flex-col gap-4'>
                <FriendRequests incomingFriendRequests={incomingFriendReqs} sessionId={session.user.id} />
            </div>
        </main>
    )
}

export default page