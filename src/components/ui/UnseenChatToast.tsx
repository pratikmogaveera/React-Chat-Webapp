import { chatHrefConstructor, classNames } from '@/lib/utils'
import Image from 'next/image'
import { FC } from 'react'
import toast, { Toast } from 'react-hot-toast'

interface UnseenChatToastProps {
    t: Toast
    sessionId: string
    senderId: string
    senderImage: string
    senderName: string
    text: string
}

const UnseenChatToast: FC<UnseenChatToastProps> = ({ t, sessionId, senderId, senderImage, senderName, text }) => {
    return (
        <div
            className={classNames('max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5',
                {
                    'animate-enter': t.visible,
                    'animate-leave': !t.visible
                }
            )}
        >
            <a
                className='flex-1 w-0 p-4'
                onClick={() => toast.dismiss(t.id)}
                href={`/dashboard/chat/${chatHrefConstructor(sessionId, senderId)}`}
            >
                <div className='flex items-start'>
                    <div className='flex-shrink-0 pt-0.5'>
                        <div className='relative h-10 w-10'>
                            <Image
                                fill
                                referrerPolicy='no-referrer'
                                className='rounded-full'
                                src={senderImage || ''}
                                alt={`${senderName}'s profile photo`}
                            />
                        </div>
                    </div>

                    <div className='ml-3 flex-1'>
                        <p className='font-medium text-gray-900'>{senderName}</p>
                        <p className='mt-1 text-gray-500'>{text}</p>
                    </div>
                </div>
            </a>
            <div className='flex border-1 border-gray-200'>
                <button
                    className='w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#5a189a] hover:text-[#9D4EDD] focus:outline-none focus:ring-2 focus:ring-[#9D4EDD]'
                    onClick={() => toast.dismiss(t.id)}
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export default UnseenChatToast