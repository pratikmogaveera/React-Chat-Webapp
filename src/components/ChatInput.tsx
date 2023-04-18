'use client'

import { FC, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Button from './ui/Button'
import axios from 'axios'
import { toast } from 'react-hot-toast'

interface ChatInputProps {
    chatPartner: User
    chatId: string
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
    const [input, setInput] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const sendMessage = async () => {
        if (!input) return
        setIsLoading(true)
        try {
            await axios.post('/api/message/send', { text: input, chatId })
            console.log('Message Sent')
        } catch (error) {
            toast.error('Something went wrong. Please try again later')
        } finally {
            setInput('')
            textAreaRef.current?.focus()
            setIsLoading(false)
        }
    }

    return (
        <div className='border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0'>
            <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-[#5A189A]'>
                <TextareaAutosize
                    ref={textAreaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Send a message to ${chatPartner.name}`}
                    className='block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:leading-6'

                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                        }
                    }}
                />
                <div onClick={() => textAreaRef.current?.focus()} className='py-2'>
                    <div className='py-px'>
                        <div className='h-9' />
                    </div>
                </div>

                <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
                    <div className='flex-shrink-0'>
                        <Button
                            onClick={sendMessage}
                            type='submit'
                            className='font-semibold bg-[#5A189A] hover:bg-[#9D4EDD]'
                            isLoading={isLoading}
                        >
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatInput