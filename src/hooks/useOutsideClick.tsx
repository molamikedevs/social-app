import { useEffect, useRef } from 'react'

export const useOutsideClick = (handler: () => void, listenCapturing = true) => {
    const ref = useRef<HTMLElement>(null)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                handler()
            }
        }

        document.addEventListener('click', handleClick, listenCapturing)

        return () =>
            document.removeEventListener('click', handleClick, listenCapturing)
    }, [handler, listenCapturing])

    return { ref }
}