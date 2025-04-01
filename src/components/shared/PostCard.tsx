import { useUserContext } from '../../context/AuthContext'
import { Models } from 'appwrite'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import PostStats from './PostStats'
import {
	useCreateNotification,
	useFollowStatus,
	useFollowUser,
	useUnfollowUser,
} from '../../lib/react-query/queriesAndMutation'
import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

type PostCardProps = {
	post: Models.Document
}

const PostCard = ({ post }: PostCardProps) => {
	const [showShareMenu, setShowShareMenu] = useState(false)
	const [showImagePreview, setShowImagePreview] = useState(false)
	const { user } = useUserContext()
	const navigate = useNavigate()
	const followMutation = useFollowUser()
	const { mutateAsync: createNotification } = useCreateNotification()
	const unfollowMutation = useUnfollowUser()
	const { data: following, isLoading } = useFollowStatus(
		user?.id,
		post.creator?.$id
	)

	const handleShareClick = (e: React.MouseEvent) => {
		e.preventDefault()
		setShowShareMenu(!showShareMenu)
	}

	if (!post?.creator) return null

	const handleFollowToggle = async () => {
		if (!user?.id) return

		try {
			if (following) {
				await unfollowMutation.mutateAsync({
					followerId: user.id,
					followingId: post.creator.$id,
				})
			} else {
				await followMutation.mutateAsync({
					followerId: user.id,
					followingId: post.creator.$id,
				})
				await createNotification({
					userId: post.creator.$id,
					senderId: user.id,
					type: 'follow',
				})
			}
		} catch (error) {
			console.error('Follow toggle error:', error)
		}
	}

	const handleCommentClick = (e: React.MouseEvent) => {
		e.preventDefault()
		navigate(`/posts/${post.$id}`, { state: { focusComment: true } })
	}

	const handleImageClick = (e: React.MouseEvent) => {
		e.preventDefault()
		setShowImagePreview(true)
	}

	const closeImagePreview = () => {
		setShowImagePreview(false)
	}

	return (
		<div className="post-card">
			<div className="flex-between">
				<div className="flex items-center gap-3">
					<Link to={`/profile/${post.creator.$id}`}>
						<LazyLoadImage
							src={post.creator?.imageUrl || '/assets/icons/avatar.svg'}
							alt="creator"
							className="w-12 lg:h-12 rounded-full"
							effect="blur"
							width="100%"
							height="100%"
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
						className={`shad-button_primary px-3 ml-2 sm:px-5 ${isLoading ? 'opacity-50' : ''}`}
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

				<div className="relative w-full overflow-hidden rounded-lg">
					<LazyLoadImage
						src={post.imageUrl || '/assets/icons/avatar.svg'}
						alt="post image"
						className="post-card_img object-contain w-full max-h-[500px] rounded-md cursor-pointer"
						effect="blur"
						onClick={handleImageClick}
						width="100%"
						height="auto"
					/>
				</div>
			</Link>

			<div className="post-card relative">
				<PostStats
					post={post}
					userId={user.id}
					onCommentClick={handleCommentClick}
					onShareClick={handleShareClick}
					commentCount={post.comments?.length || ''}
				/>

				{showShareMenu && (
					<div className="absolute right-29 top-16 bg-dark-3 rounded-md shadow-lg z-10 p-2">
						<button
							className="block w-full text-left px-4 py-2 hover:bg-dark-4 rounded"
							onClick={() => {
								navigator.clipboard.writeText(
									`${window.location.origin}/posts/${post.$id}`
								)
								setShowShareMenu(false)
							}}>
							Copy Link
						</button>
					</div>
				)}
			</div>

			{/* Image Preview Modal */}
			{showImagePreview && (
				<div
					className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
					onClick={closeImagePreview}>
					<div className="relative max-w-full max-h-full">
						<img
							src={post.imageUrl}
							alt="post preview"
							className="max-w-full max-h-[90vh] object-contain rounded-md"
							onClick={e => e.stopPropagation()}
						/>
						<button
							className="absolute top-4 right-4 text-white text-2xl bg-dark-4 rounded-full w-10 h-10 flex items-center justify-center"
							onClick={closeImagePreview}>
							×
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default PostCard