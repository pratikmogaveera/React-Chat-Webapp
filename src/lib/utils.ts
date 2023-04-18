import { clsx, ClassValue } from "clsx";
import { twMerge } from 'tailwind-merge'

export function classNames(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function chatHrefConstructor(id1: string, id2: string) {
    return [id1, id2].sort().join('--')
}

export function pusherKeyHelper(key: string){
    return key.replace(/:/g, '__')
}