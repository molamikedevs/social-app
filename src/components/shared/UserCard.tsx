import { useUserContext } from '../../context/AuthContext'
import { Models } from 'appwrite'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import {
	useCreateNotification,
	useFollowStatus,
	useFollowUser,
	useUnfollowUser,
} from '../../lib/react-query/queriesAndMutation'

type UserCardProps = {
	user: Models.Document
}

const UserCard = ({ user }: UserCardProps) => {
	const { user: currentUser } = useUserContext()
	const { mutateAsync: followUser } = useFollowUser()
	const { mutateAsync: unfollowUser } = useUnfollowUser()
	const { mutateAsync: createNotification } = useCreateNotification()
	const {
		data: following,
		isLoading,
		refetch,
	} = useFollowStatus(currentUser?.id, user.$id)

	const handleFollowToggle = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (!currentUser?.id) return

		try {
			if (following) {
				await unfollowUser({
					followerId: currentUser.id,
					followingId: user.$id,
				})
			} else {
				await followUser({
					followerId: currentUser.id,
					followingId: user.$id,
				})
				// Send follow notification
				await createNotification({
					userId: user.$id, // Notify the user being followed
					senderId: currentUser.id, // Current user
					type: 'follow',
				})
			}
			await refetch()
		} catch (error) {
			console.error('Follow toggle error:', error)
		}
	}

	return (
		<Link to={`/profile/${user.$id}`} className="user-card">
			<img
				src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
				alt="creator"
				className="rounded-full w-14 h-14"
			/>

			<div className="flex-center flex-col gap-1">
				<p className="base-medium text-light-1 text-center line-clamp-1">
					{user.name}
				</p>
				<p className="small-regular text-light-3 text-center line-clamp-1">
					@{user.username}
				</p>
			</div>

			{currentUser?.id !== user.$id && (
				<Button
					type="button"
					size="sm"
					className={`shad-button_primary px-5 ${isLoading ? 'opacity-50' : ''}`}
					onClick={handleFollowToggle}
					disabled={isLoading}>
					{following ? 'Unfollow' : 'Follow'}
				</Button>
			)}
		</Link>
	)
}

export default UserCard
