'use client'
import { Check, UserPlus, X } from 'lucide-react'
import { FC, useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { pusherClient } from '@/lib/pusher'
import { pusherKeyHelper } from '@/lib/utils'

interface FriendRequestsProps {
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({ incomingFriendRequests, sessionId }) => {
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests)
    const router = useRouter()

    useEffect(() => {
        pusherClient.subscribe(pusherKeyHelper(`user:${sessionId}:incoming_friend_requests`))
        const friendRequestHandler = ({ senderId, senderEmail }: IncomingFriendRequest) => {
            setFriendRequests((prev) => [...prev, { senderId, senderEmail }])
        }

        pusherClient.bind('incoming_friend_requests', friendRequestHandler)

        return () => {
            pusherClient.unsubscribe(pusherKeyHelper(`user:${sessionId}:incoming_friend_requests`))
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
        }
    }, [sessionId])

    const acceptFriendRequest = async (senderId: string) => {
        await axios.post(`/api/friends/accept`, { id: senderId })
        setFriendRequests(prev => prev.filter(req => req.senderId !== senderId))

        router.refresh()
    }

    const declineFriendRequest = async (senderId: string) => {
        await axios.post(`/api/friends/decline`, { id: senderId })
        setFriendRequests(prev => prev.filter(req => req.senderId !== senderId))

        router.refresh()
    }


    return (
        <>
            {friendRequests.length === 0 ? (
                <p className='text-2xl text-zinc-500'>Nothing to show here.</p>
            ) : (
                friendRequests.map(req => (
                    <div key={req.senderId} className='flex gap-4 w-full items-center justify-between bg-gray-50 rounded-md py-2 px-4'>
                        <div className='flex gap-2 items-center'>
                            <UserPlus className='text-black' />
                            <p className='font-medium text-lg'>{req.senderEmail}</p>
                        </div>
                        <div className='flex gap-2 items-center'>
                            <button
                                onClick={() => acceptFriendRequest(req.senderId)}
                                className='w-8 h-8 bg-[#5A189A] grid place-items-center rounded-full transition hover:shadow-md'>
                                <Check className='font-semibold text-white w-3/4 h-3/4' />
                            </button>
                            <button
                                onClick={() => declineFriendRequest(req.senderId)}
                                className='w-8 h-8 bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'>
                                <X className='font-semibold text-white w-3/4 h-3/4' />
                            </button>
                        </div>

                    </div >))

            )
            }
        </>
    )
}

export default FriendRequests