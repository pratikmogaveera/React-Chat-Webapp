'use client'
import { classNames, pusherKeyHelper } from '@/lib/utils'
import { Message } from '@/lib/validations/messages'
import { FC, useRef, useState, useEffect } from 'react'
import { format } from 'date-fns'
import Image from 'next/image'
import { pusherClient } from '@/lib/pusher'

interface MessagesProps {
    initialMessages: Message[]
    sessionId: string
    chatId: string
    sessionImg: string | null | undefined
    chatPartner: User
}

const Messages: FC<MessagesProps> = ({ initialMessages, sessionId, chatId, chatPartner, sessionImg, }) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        pusherClient.subscribe(pusherKeyHelper(`chat:${chatId}`))

        const messageHandler = (message: Message) => {
            setMessages((prev) => [message, ...prev])
        }

        pusherClient.bind('incoming_message', messageHandler)

        return () => {
            pusherClient.unsubscribe(pusherKeyHelper(`chat:${chatId}`))
            pusherClient.unbind('incoming_message', messageHandler)
        }
    }, [chatId])

    return (
        <div className='flex h-full flex-1 flex-col-reverse gap-2 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrolbar-w-2 scrolling-touch'>
            <div ref={scrollDownRef} />

            {messages.map((msg, index) => {
                // Checking who is the sender of the message.
                const isCurrentUser = msg.senderId === sessionId

                // Checking if next message is from the same user.
                const hasNextMessage = messages[index - 1]?.senderId === msg.senderId

                // Formatting the date.
                const formattedTimestamp = format(msg.timestamp, 'HH:mm')

                return (
                    <div
                        key={`${msg.id}-${msg.timestamp}`}
                        className='chat-message'
                    >
                        <div className={classNames('flex items-end', { 'justify-end': isCurrentUser })}>
                            <div className={classNames('flex flex-col gap-y-2 text-base max-w-xs mx-2',
                                {
                                    'order-1 items-end': isCurrentUser,
                                    'order-2 items-end': !isCurrentUser
                                })}>
                                <span className={classNames('px-4 py-1.5 rounded-lg inline-block',
                                    {
                                        'bg-[#5A189A] text-white': isCurrentUser,
                                        'bg-white text-gray-900': !isCurrentUser,
                                        'bg-[#e9d2fb] text-gray-900': !isCurrentUser,
                                        'rounded-br-none': hasNextMessage && isCurrentUser,
                                        'rounded-bl-none': hasNextMessage && !isCurrentUser,
                                        // 'mb-2': !hasNextMessage
                                    })}>
                                    {msg.text}{' '}
                                    {/* <span className='ml-2 text-xs text-gray-400'>{formattedTimestamp}</span> */}
                                </span>
                            </div>
                            <div className={classNames('relative w-6 h-6', {
                                'order-2': isCurrentUser,
                                'order-1': !isCurrentUser,
                                'invisible': hasNextMessage
                            })}>
                                <Image
                                    fill
                                    src={isCurrentUser ? (sessionImg as string) : chatPartner.image}
                                    alt='Sender Photo'
                                    referrerPolicy='no-referrer'
                                    className='rounded-full'
                                />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div >
    )
}

export default Messages