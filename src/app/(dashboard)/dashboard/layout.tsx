import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FC, ReactNode } from 'react'
import { Icon, Icons } from '@/components/Icons'
import Image from 'next/image'
import SignOutButton from '@/components/ui/SignOutButton'
import FriendRequestsCount from '@/components/ui/FriendRequestsCount'
import { fetchRedis } from '@/helpers/redis'
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import SidebarChatList from '@/components/ui/SidebarChatList'
import MobileChatLayout from '@/components/ui/MobileChatLayout'
import { SideBarOption } from '@/types/typing'

interface LayoutProps {
    children: ReactNode
}



const sideBarOptions: SideBarOption[] = [
    {
        id: 1,
        name: 'Add Friend',
        href: '/dashboard/add',
        Icon: 'UserPlus'
    }
]

const Layout = async ({ children }: LayoutProps) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        notFound()
    }

    const friends = await getFriendsByUserId(session.user.id)

    const unseenRequestCount = (await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as User[]).length

    return <div className='w-full flex h-screen '>
        <div className='md:hidden'>
            <MobileChatLayout
                friends={friends}
                session={session}
                sidebarOptions={sideBarOptions}
                unseenRequestCount={unseenRequestCount}
            />
        </div>
        <div className='hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r-2 border-gray-200 bg-white px-6'>
            <Link href='/dashboard' className='flex h-16 shrink-0 items-center'>
                <Icons.Logo className='h-8 w-auto' />
            </Link>

            {friends.length ?
                (
                    <div className='font-semibold leading-6 text-2xl text-gray-400'>
                        <h2>Friends</h2>
                    </div>
                ) : null
            }

            <nav className='flex flex-col flex-1'>
                <ul role='list' className='flex flex-col flex-1 gap-y-5'>
                    <li>
                        <SidebarChatList sessionUserId={session.user.id} friends={friends} />
                    </li>

                    <li>
                        <div className='font-semibold leading-6 text-gray-400'>
                            Overview
                        </div>

                        <ul role='list' className='-mx-2 mt-2 gap-y-1'>
                            {sideBarOptions.map(opt => {
                                const Icon = Icons[opt.Icon]
                                return (
                                    <li key={opt.id}>
                                        <Link href={opt.href}
                                            className='text-gray-700 font-semibold hover:text-[#5A189A] hover:bg-gray-50 group flex gap-3 rounded-md px-2 py-1 leading-6 items-center'
                                        >
                                            <span className='text-gray-400 border-gray-200 group-hover:border-[#5A189A] group-hover:text-[#5A189A] flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-[0.625rem] font-medium bg-white'>
                                                <Icon className='h-6 w-6' />
                                            </span>
                                            <span className='truncate'>
                                                {opt.name}
                                            </span>
                                        </Link>
                                    </li>
                                )
                            })}

                            <li>
                                <FriendRequestsCount initUnseenReqCount={unseenRequestCount} sessionId={session.user.id} />
                            </li>
                        </ul>
                    </li>



                    <li className='-mx-6 mt-auto flex items-center'>
                        <div className='flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-5 text-gray-900'>
                            <div className='relative h-8 w-8 bg-gray-50'>
                                <Image
                                    fill
                                    referrerPolicy='no-referrer'
                                    className='rounded-full'
                                    src={session.user.image || ''}
                                    alt='Your Profile Picture'
                                />
                            </div>
                            <div className='flex flex-col'>
                                <span aria-hidden={true}>{session.user.name}</span>
                                <span className='text-zinc-400 text-xs' aria-hidden={true}>{session.user.email}</span>
                            </div>
                        </div>
                        <SignOutButton className='h-full aspect-square flex items-center justify-center' />
                        {/* <SignOutButton className='h-full aspect-square' /> */}
                    </li>

                </ul>
            </nav>

        </div>
        {/* md:py-12 py-4 */}
        <aside className='max-h-screen container w-full py-16 md:py-4'>
            {children}
        </aside>
    </div >
}

export default Layout