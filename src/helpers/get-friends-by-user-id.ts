import { fetchRedis } from "./redis"

export const getFriendsByUserId = async (userId: string) => {
    // Retrieve friends for current user.

    const friendsIds = await fetchRedis('smembers', `user:${userId}:friends`) as string[]
    const friends = await Promise.all(
        friendsIds.map(async (friendId: string) => {
            const friend = await fetchRedis('get', `user:${friendId}`) as string
            return JSON.parse(friend)
        })
    )

    return friends
}