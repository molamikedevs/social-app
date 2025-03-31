import { useState } from 'react'
import { useUserContext } from '../../context/AuthContext'
import { useGetNotifications } from '../../lib/react-query/queriesAndMutation'
import { Models } from 'appwrite'
import clsx from 'clsx'
import Notifications from './Notifications'

type NotificationToggleProps = {
	position?: 'desktop' | 'mobile'
}

const NotificationToggle = ({
	position = 'desktop',
}: NotificationToggleProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const { user } = useUserContext()
	const { data: notifications, isLoading } = useGetNotifications(user?.id)

	const unreadCount =
		notifications?.documents?.filter((n: Models.Document) => !n.isRead)
			.length || 0

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={clsx(
					'p-2 rounded-full hover:bg-dark-3 relative',
					position === 'mobile' ? 'bg-dark-4' : ''
				)}
				aria-label="Notifications">
				<svg
					className="w-6 h-6 text-primary-500"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					fill="none"
					viewBox="0 0 24 24">
					<path
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M12 5.365V3m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175 0 .593 0 1.292-.538 1.292H5.538C5 18 5 17.301 5 16.708c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 12 5.365ZM8.733 18c.094.852.306 1.54.944 2.112a3.48 3.48 0 0 0 4.646 0c.638-.572 1.236-1.26 1.33-2.112h-6.92Z"
					/>
				</svg>

				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
						{unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div
					className={clsx(
						'absolute bg-dark-2 rounded-lg shadow-lg border border-dark-4 z-50',
						position === 'desktop'
							? 'left-0 mt-2 w-80'
							: 'right-0 bottom-full mb-2 w-72'
					)}>
					<div className="p-4 border-b border-dark-4">
						<h3 className="text-light-1 font-semibold">Notifications</h3>
					</div>
					<Notifications
						notifications={notifications?.documents || []}
						onClose={() => setIsOpen(false)}
						isLoading={isLoading}
						position={position}
					/>
				</div>
			)}
		</div>
	)
}

export default NotificationToggle
