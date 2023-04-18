import { FC } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


const loading = () => {
    return (
        <div className='flex flex-col flex-1 justify-between h-full max-h-[calc(100vh-6rem)]'>
            <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
                <div className='relative flex items-center gap-x-4'>
                    <div className='relative'>
                        <div className='relative w-8 h-8 sm:w-12 sm:h-12 rounded-full'>
                            <Skeleton height={52} width={52} circle={true} />
                        </div>
                    </div>
                    <div className='flex flex-col leading-tight'>
                        <div className='text-xl flex items-center'>
                            <span className='text-gray-700 mr-3 font-semibold'>
                                <Skeleton height={30} width={200}/>
                            </span>
                        </div>
                        <span className='text-gray-600'><Skeleton height={30} width={300} /></span>
                    </div>
                </div>
            </div>
            <Skeleton height={100} width='100%' />
        </div>
    )
}

export default loading