import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { pusherKeyHelper } from "@/lib/utils"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { z } from "zod"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { id: idToAccept } = z.object({ id: z.string() }).parse(body)

        const session = await getServerSession(authOptions)
        if (!session) {
            return new Response('Unauthorized.', { status: 401 })
        }

        // Both users are not already friends
        const isAlreadyFriend = await fetchRedis(
            'sismember',
            `user:${session.user.id}:friends`,
            idToAccept
        ) as 0 | 1

        if (isAlreadyFriend) {
            return new Response('Already friends.', { status: 400 })
        }

        // Check if friend request is received
        const hasReceivedRequest = await fetchRedis(
            'sismember',
            `user:${session.user.id}:incoming_friend_requests`,
            idToAccept
        )

        if (!hasReceivedRequest) {
            return new Response('Request is not received', { status: 400 })
        }

        const [userRaw, friendRaw] = (await Promise.all([
            fetchRedis('get', `user:${session.user.id}`),
            fetchRedis('get', `user:${idToAccept}`)
        ])) as [string, string]

        const user = JSON.parse(userRaw) as User
        const friend = JSON.parse(friendRaw) as User

        // Notifyig that user is added

        await Promise.all([
            pusherServer.trigger(pusherKeyHelper(`user:${session.user.id}:friends`), 'new_friend', friend),
            pusherServer.trigger(pusherKeyHelper(`user:${idToAccept}:friends`), 'new_friend', user),

            // Adding users to both users' friend list
            db.sadd(`user:${session.user.id}:friends`, idToAccept),
            db.sadd(`user:${idToAccept}:friends`, session.user.id),

            // Removing the friend request from the DataBase
            db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAccept)
        ])

        return new Response('OK')

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload', { status: 422 })
        }

        return new Response('Invalid request', { status: 400 })
    }
}