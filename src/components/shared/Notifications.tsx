import { Models } from 'appwrite'
import { Link } from 'react-router-dom'
import { useMarkAsRead } from '../../lib/react-query/queriesAndMutation'
import { timeAgo } from '../../lib/utils'
import clsx from 'clsx'

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
	const { mutate: markAsRead } = useMarkAsRead()

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

	if (isLoading)
		return (
			<div className="p-4 text-center text-light-3">
				Loading notifications...
			</div>
		)

	if (!notifications.length)
		return (
			<div className="p-4 text-center text-light-3">No notifications yet</div>
		)

	return (
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
	)
}

export default Notifications
