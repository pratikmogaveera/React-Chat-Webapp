'use client'

import axios, { AxiosError } from 'axios'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from './Button'
import { addFriendValidator } from '@/lib/validations/add-friend'

interface AddFriendButtonProps { }

type FormData = z.infer<typeof addFriendValidator>

const AddFriendButton: FC<AddFriendButtonProps> = ({ }) => {
    const [showSuccess, setShowSuccess] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(addFriendValidator)
    })

    const addFriend = async (email: string) => {
        try {
            const validatedEmail = addFriendValidator.parse({ email })

            await axios.post('/api/friends/add', {
                email: validatedEmail
            })

            setShowSuccess(true)
        } catch (error) {
            if (error instanceof z.ZodError) {
                setError('email', { message: error.message })
                return
            }

            if (error instanceof AxiosError) {
                setError('email', { message: error.response?.data })
                return
            }

            setError('email', { message: 'Something went wrong' })
        } finally {
            setTimeout(() => {setShowSuccess(false)}, 5000)
        }
    }

    const onSubmit = (data: FormData) => {
        addFriend(data.email)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm' >
            <label
                htmlFor="email"
                className='block font-semibold leading-6 text-gray-900'>
                Add friend by E-mail
            </label>

            <div className='mt-2 flex gap-4'>
                <input
                    {...register('email')}
                    type="text"
                    className='w-full outline-none rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#5A189A] sm:leading-6'
                    placeholder='you@example.com'
                />
                <Button>Add</Button>
            </div>
            <p className='mt-1 text-red-600'>{errors.email?.message}</p>
            {showSuccess ? <p className='mt-1 text-green-600'>Friend request sent!</p> : null}

        </form>
    )
}

export default AddFriendButton