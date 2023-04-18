import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Message, messageValidator } from "@/lib/validations/messages"
import { getServerSession } from "next-auth"
import { nanoid } from 'nanoid'
import { pusherServer } from "@/lib/pusher"
import { pusherKeyHelper } from "@/lib/utils"

export async function POST(req: Request) {
    try {
        const { text, chatId }: { text: string, chatId: string } = await req.json()
        const session = await getServerSession(authOptions)

        if (!session)
            return new Response('Unauthorized', { status: 401 })

        const [userId1, userId2] = chatId.split('--')
        if (session.user.id !== userId1 && session.user.id !== userId2)
            return new Response('Unauthorized', { status: 401 })

        const friendId = session.user.id === userId1 ? userId2 : userId1
        const isFriend = await fetchRedis('sismember', `user:${session.user.id}:friends`, friendId) as 0 | 1


        if (!isFriend)
            return new Response('Unauthorized', { status: 401 })

        const sender = JSON.parse(
            await fetchRedis('get', `user:${session.user.id}`) as string
        ) as User

        const timestamp = Date.now()
        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp
        }
        const message = messageValidator.parse(messageData)

        // Notify all connected chat room clients

        pusherServer.trigger(
            pusherKeyHelper(`chat:${chatId}`),
            'incoming_message',
            message
        )

        pusherServer.trigger(
            pusherKeyHelper(`user:${friendId}:chats`),
            'new_message',
            {
                ...message,
                senderImage: sender.image,
                senderName: sender.name
            }
        )

        // All validations done. Send Message.
        await db.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message)
        })

        return new Response('OK')

    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 })
        }

        return new Response('Internal server eror', { status: 500 })
    }
}