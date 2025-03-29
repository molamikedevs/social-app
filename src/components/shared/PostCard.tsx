import { useUserContext } from '../../context/AuthContext'
import { Models } from 'appwrite'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import PostStats from './PostStats'
import {
	useFollowStatus,
	useFollowUser,
	useUnfollowUser,
} from '../../lib/react-query/queriesAndMutation'

type PostCardProps = {
	post: Models.Document
}

const PostCard = ({ post }: PostCardProps) => {
	const { user } = useUserContext()
	const followMutation = useFollowUser()
	const unfollowMutation = useUnfollowUser()
	const { data: following, isLoading } = useFollowStatus(
		user?.id,
		post.creator?.$id
	)

	if (!post?.creator) return null

	const handleFollowToggle = () => {
		if (!user?.id) return

		if (following) {
			unfollowMutation.mutate({
				followerId: user.id,
				followingId: post.creator.$id,
			})
		} else {
			followMutation.mutate({
				followerId: user.id,
				followingId: post.creator.$id,
			})
		}
	}

	return (
		<div className="post-card">
			<div className="flex-between">
				<div className="flex items-center gap-3">
					<Link to={`/profile/${post.creator.$id}`}>
						<img
							src={post.creator?.imageUrl || '/assets/icons/avatar.svg'}
							alt="creator"
							className="w-12 lg:h-12 rounded-full"
						/>
					</Link>

					<div className="flex flex-col">
						<p className="base-medium lg:body-bold text-light-1">
							{post.creator.name}
						</p>
						<div className="flex-center gap-2 text-light-3">
							<p className="subtle-semibold lg:small-regular">
								{new Date(post.$createdAt).toLocaleDateString()}
							</p>
							-
							<p className="subtle-semibold lg:small-regular">
								{post.location}
							</p>
						</div>
					</div>
				</div>

				{user?.id !== post.creator.$id && (
					<Button
						type="button"
						size="sm"
						className={`shad-button_primary px-5 ${isLoading ? 'opacity-50' : ''}`}
						onClick={handleFollowToggle}
						disabled={isLoading}>
						{following ? 'Unfollow' : 'Follow'}
					</Button>
				)}
			</div>

			<Link to={`/posts/${post.$id}`}>
				<div className="small-medium lg:base-medium py-5">
					<p>{post.caption}</p>
					<ul className="flex gap-1 mt-2">
						{post.tags.map((tag: string) => (
							<li key={tag} className="text-light-3">
								#{tag}
							</li>
						))}
					</ul>
				</div>

				<img
					src={post.imageUrl || '/assets/icons/avatar.svg'}
					alt="post image"
					className="post-card_img"
				/>
			</Link>

			<PostStats post={post} userId={user.id} />
		</div>
	)
}

export default PostCard
