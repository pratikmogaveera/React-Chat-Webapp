'use client'
import { pusherClient } from '@/lib/pusher'
import { chatHrefConstructor, pusherKeyHelper } from '@/lib/utils'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import UnseenChatToast from './UnseenChatToast'

interface SidebarChatListProps {
    friends: User[]
    sessionUserId: string
}

interface ExtendedMessage extends Message {
    senderImage: string
    senderName: string
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionUserId }) => {
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    const [activeChats, setActiveChats] = useState<User[]>(friends)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        pusherClient.subscribe(pusherKeyHelper(`user:${sessionUserId}:chats`))
        pusherClient.subscribe(pusherKeyHelper(`user:${sessionUserId}:friends`))

        const chatHandler = (message: ExtendedMessage) => {
            const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionUserId, message.senderId)}`
            if (!shouldNotify) return

            // Should be notified
            toast.custom((t) => (
                <UnseenChatToast t={t} sessionId={sessionUserId} senderId={message.senderId} senderImage={message.senderImage} senderName={message.senderName} text={message.text} />
            ))

            setUnseenMessages(prev => [...prev, message])
        }

        const newFriendHandler = (newFriend: User) => {
            console.log(newFriend)
            setActiveChats(prev => [...prev, newFriend])
        }

        pusherClient.bind('new_message', chatHandler)
        pusherClient.bind('new_friend', newFriendHandler)

        return () => {
            pusherClient.unsubscribe(pusherKeyHelper(`user:${sessionUserId}:chats`))
            pusherClient.unsubscribe(pusherKeyHelper(`user:${sessionUserId}:friends`))
            pusherClient.unbind('new_message', chatHandler)
            pusherClient.unbind('new_friend', newFriendHandler)
        }
    }, [pathname, sessionUserId, router])

    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenMessages(prev =>
                prev.filter(msg => !pathname.includes(msg.senderId))
            )
        }
    }, [pathname])

    return (
        <ul
            role='list'
            className='max-h-[25rem] overflow-y-auto -mx-2 gap-y-1'
        >
            {activeChats.sort().map(friend => {
                const unseenMessagesCount = unseenMessages.filter(unsnMsg =>
                    unsnMsg.senderId === friend.id
                ).length

                return (
                    <li key={friend.id}>
                        <a
                            href={`/dashboard/chat/${chatHrefConstructor(sessionUserId, friend.id)}`}
                            className='text-gray-700 hover:text-[#5A189A] hover:bg-gray-50 group flex items-center gap-x-3 rounded-md px-2 py-1 leading-6 font-semibold w-full'
                        >
                            <p className="truncate">{friend.name}</p>

                            {unseenMessagesCount > 0 ? <div className='rounded-full w-6 h-6 p-1 text-sm flex justify-center items-center text-white bg-[#5A189A] justify-self-end'>{unseenMessagesCount}</div> : null}

                        </a>
                    </li>
                )
            })}
        </ul>
    )
}

export default SidebarChatList