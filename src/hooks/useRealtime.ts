// hooks/useRealtime.ts
import { client } from '../lib/appwrite/config'
import { useEffect } from 'react'

const useRealtime = (channel: string, callback: (payload: any) => void) => {
	useEffect(() => {
		let unsubscribe: () => void
		let reconnectAttempts = 0
		const maxReconnectAttempts = 5

		const subscribe = () => {
			unsubscribe = client.subscribe(channel, payload => {
				reconnectAttempts = 0 // Reset on successful message
				callback(payload)
			})
		}

		const handleDisconnect = () => {
			if (reconnectAttempts < maxReconnectAttempts) {
				const delay = Math.min(1000 * reconnectAttempts, 5000)
				setTimeout(() => {
					reconnectAttempts++
					subscribe()
				}, delay)
			}
		}

		subscribe()

		// Handle disconnection
		const disconnectHandler = () => handleDisconnect()
		client.addEventListener('disconnect', disconnectHandler)

		return () => {
			if (unsubscribe) unsubscribe()
			client.removeEventListener('disconnect', disconnectHandler)
		}
	}, [channel, callback])
}

export default useRealtime
