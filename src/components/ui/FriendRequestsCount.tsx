'use client'
import { pusherClient } from '@/lib/pusher'
import { pusherKeyHelper } from '@/lib/utils'
import { User } from 'lucide-react'
import Link from 'next/link'
import { FC, useState, useEffect } from 'react'

interface FriendRequestsCountProps {
    sessionId: string
    initUnseenReqCount: number
}

const FriendRequestsCount: FC<FriendRequestsCountProps> = ({ initUnseenReqCount, sessionId }) => {
    const [unseenRequestsCount, setUnseenRequestsCount] = useState<number>(initUnseenReqCount)

    useEffect(() => {
        pusherClient.subscribe(pusherKeyHelper(`user:${sessionId}:incoming_friend_requests`))
        pusherClient.subscribe(pusherKeyHelper(`user:${sessionId}:friends`))

        const friendRequestHandler = ({ senderId, senderEmail }: IncomingFriendRequest) => {
            setUnseenRequestsCount((prev) => prev + 1)
        }

        const addedFriendHandler = () => {
            setUnseenRequestsCount(prev => prev - 1)
        }

        pusherClient.bind('incoming_friend_requests', friendRequestHandler)
        pusherClient.bind('new_friend', addedFriendHandler)

        return () => {
            pusherClient.unsubscribe(pusherKeyHelper(`user:${sessionId}:incoming_friend_requests`))
            pusherClient.unsubscribe(pusherKeyHelper(`user:${sessionId}:friends`))
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
            pusherClient.unbind('new_friend', addedFriendHandler)
        }
    }, [sessionId])


    return (
        <Link href='/dashboard/requests' className='text-gray-700 hover:text-[#5A189A] hover:bg-gray-50 group flex items-center gap-x-3 rounded-md px-2 py-1 leading-6 font-semibold'>
            <div className='text-gray-400 border-gray-200 group-hover:border-[#5A189A] group-hover:text-[#5A189A] flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-[0.625rem] font-medium bg-white'>
                <User className='h-6 w-6' />
            </div>
            <p className="truncate">Friend Requests</p>

            {unseenRequestsCount > 0 ? <div className='rounded-full w-6 h-6 p-1 text-sm flex justify-center items-center text-white bg-[#5A189A]'>{unseenRequestsCount}</div> : null}
        </Link>
    )
}

export default FriendRequestsCount