import { useState } from 'react'
import { Models } from 'appwrite'
import { Link } from 'react-router-dom'
import { useUserContext } from '../../context/AuthContext'
import {
	useMarkAsRead,
	useMarkAllAsRead,
	useClearAllNotifications,
} from '../../lib/react-query/queriesAndMutation'
import { timeAgo } from '../../lib/utils'
import clsx from 'clsx'
import ConfirmModal from './ConfirmModal'


interface NotificationsProps {
	notifications: Models.Document[]
	isLoading?: boolean
	onClose?: () => void
	position?: 'desktop' | 'mobile'
}

const Notifications = ({
	notifications,
	isLoading,
	onClose,
	position = 'desktop',
}: NotificationsProps) => {
	const { user } = useUserContext()
	const { mutate: markAsRead } = useMarkAsRead()
	const { mutate: markAllAsRead, isLoading: isMarkingAll } = useMarkAllAsRead()
	const { mutate: clearAll, isLoading: isClearing } = useClearAllNotifications()
	const [showConfirm, setShowConfirm] = useState(false)

	const unreadCount = notifications.filter(n => !n.isRead).length

	const getImageUrl = (notification: Models.Document) => {
		if (notification.type === 'like') {
			return notification.post?.imageUrl || '/assets/icons/post-placeholder.svg'
		}
		return (
			notification.sender?.imageUrl || '/assets/icons/profile-placeholder.svg'
		)
	}

	const handleClick = (notification: Models.Document) => {
		if (!notification.isRead) markAsRead(notification.$id)
		onClose?.()
	}

	const handleMarkAllAsRead = () => {
		if (!user?.id || unreadCount === 0) return
		markAllAsRead(user.id)
	}

	const handleClearAll = () => {
		if (!user?.id || notifications.length === 0) return
		setShowConfirm(true)
	}

	const handleConfirmClear = () => {
		clearAll(user.id)
		setShowConfirm(false)
	}

	if (isLoading) {
		return (
			<div className="p-4 text-center text-light-3">
				Loading notifications...
			</div>
		)
	}

	if (!notifications.length) {
		return (
			<div className="p-4 text-center text-light-3">No notifications yet</div>
		)
	}

	return (
		<>
			<div
				className={clsx(
					'absolute bg-dark-2 rounded-lg shadow-lg border border-dark-4 z-50',
					position === 'desktop'
						? 'left-0 mt-2 w-80'
						: 'right-0 bottom-full mb-2 w-72'
				)}>
				{/* Single clean header section */}
				<div className="p-4 border-b border-dark-4">
					<div className="flex justify-between items-center">
						<h3 className="text-light-1 font-semibold">Notifications</h3>
						<div className="flex gap-3">
							<button
								onClick={handleMarkAllAsRead}
								disabled={unreadCount === 0 || isMarkingAll}
								className={clsx(
									'text-xs hover:underline',
									unreadCount === 0
										? 'text-light-4 cursor-not-allowed'
										: 'text-primary-500 hover:text-primary-600',
									isMarkingAll && 'opacity-50'
								)}>
								{isMarkingAll ? 'Processing...' : 'Mark all as read'}
							</button>
							<button
								onClick={handleClearAll}
								disabled={isClearing}
								className={clsx(
									'text-xs hover:underline',
									isClearing
										? 'text-light-4'
										: 'text-rose-500 hover:text-rose-600',
									isClearing && 'opacity-50'
								)}>
								{isClearing ? 'Clearing...' : 'Clear all'}
							</button>
						</div>
					</div>
				</div>

				{/* Notifications list */}
				<div
					className={clsx(
						'space-y-2',
						position === 'desktop'
							? 'max-h-[70vh] overflow-y-auto'
							: 'max-h-[60vh] overflow-y-auto'
					)}>
					{notifications.map(notification => (
						<Link
							key={notification.$id}
							to={
								notification.type === 'like'
									? `/posts/${notification.postId}`
									: `/profile/${notification.senderId}`
							}
							className={clsx(
								'flex items-start p-4 transition-colors',
								!notification.isRead ? 'bg-dark-3' : 'hover:bg-dark-3'
							)}
							onClick={() => handleClick(notification)}>
							<div className="flex-shrink-0 mr-3">
								<img
									src={getImageUrl(notification)}
									alt={notification.type === 'like' ? 'Post' : 'Profile'}
									className="h-10 w-10 rounded-full object-cover"
									onError={e => {
										;(e.target as HTMLImageElement).src =
											notification.type === 'like'
												? '/assets/icons/post-placeholder.svg'
												: '/assets/icons/profile-placeholder.svg'
									}}
								/>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm text-light-1 truncate">
									<span className="font-semibold">
										{notification.sender?.name || 'User'}
									</span>{' '}
									{notification.type === 'like'
										? 'liked your post'
										: 'started following you'}
								</p>
								{notification.type === 'like' && notification.post?.caption && (
									<p className="text-xs text-light-3 mt-1 truncate">
										"{notification.post.caption}"
									</p>
								)}
								<p className="text-xs text-light-3 mt-1">
									{timeAgo(notification.$createdAt)}
								</p>
							</div>
						</Link>
					))}
				</div>
			</div>

			<ConfirmModal
				isOpen={showConfirm}
				onClose={() => setShowConfirm(false)}
				onConfirm={handleConfirmClear}
				title="Clear All Notifications"
				description="Are you sure you want to clear all notifications? This action cannot be undone."
				confirmText="Clear All"
			/>
		</>
	)
}

export default Notifications
