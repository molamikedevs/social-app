import React, { useEffect, useState } from 'react'
import { Models } from 'appwrite'
import { checkIsLiked } from '../../lib/utils'
import { useLocation } from 'react-router-dom'
import { MessageSquare, Share2, Heart, Bookmark } from 'lucide-react'
import {
	useCreateNotification,
	useDeleteSavedPost,
	useGetCurrentUser,
	useLikePost,
	useSavePost,
} from '../../lib/react-query/queriesAndMutation'

type PostStatsProps = {
	post: Models.Document
	userId: string
	onCommentClick?: (e: React.MouseEvent) => void
	onShareClick?: (e: React.MouseEvent) => void
	commentCount?: number
}

const PostStats = ({
	post,
	userId,
	onCommentClick,
	onShareClick,
	commentCount,
}: PostStatsProps) => {
	const { mutateAsync: createNotification } = useCreateNotification()
	const location = useLocation()
	const likesList = post.likes?.map((user: Models.Document) => user.$id) || []

	const [likes, setLikes] = useState<string[]>(likesList)
	const [isSaved, setIsSaved] = useState(false)

	const { mutate: likePost } = useLikePost()
	const { mutate: savePost } = useSavePost()
	const { mutate: deleteSavePost } = useDeleteSavedPost()

	const { data: currentUser } = useGetCurrentUser()

	const savedPostRecord = currentUser?.save?.find(
		(record: Models.Document) => record?.post?.$id === post.$id
	)

	useEffect(() => {
		setIsSaved(!!savedPostRecord)
	}, [currentUser])

	const handleLikePost = async (e: React.MouseEvent) => {
		e.stopPropagation()
		let likesArray = [...likes]
		const hasLiked = likesArray.includes(userId)

		likesArray = hasLiked
			? likesArray.filter(id => id !== userId)
			: [...likesArray, userId]

		setLikes(likesArray)
		try {
			await likePost({ postId: post.$id, likesArray })
			if (!hasLiked && post.creator.$id !== userId) {
				await createNotification({
					userId: post.creator.$id,
					senderId: userId,
					type: 'like',
					postId: post.$id,
				})
			}
		} catch (error) {
			console.error('Error handling like:', error)
			setLikes(likes)
		}
	}

	const handleSavePost = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (savedPostRecord) {
			setIsSaved(false)
			deleteSavePost(savedPostRecord.$id)
		} else {
			savePost({ userId, postId: post.$id })
			setIsSaved(true)
		}
	}

	const containerStyles = location.pathname.startsWith('/profile')
		? 'w-full'
		: ''

	return (
		<div
			className={`flex justify-between items-center z-20 ${containerStyles}`}>
			<div className="flex gap-4">
				{/* Like Button */}
				<div className="flex gap-2 items-center">
					<Heart
						className={`w-5 h-5 cursor-pointer ${
							checkIsLiked(likes, userId)
								? 'text-rose-500 fill-rose-500'
								: 'text-primary-500 hover:text-primary-600'
						}`}
						onClick={handleLikePost}
					/>
					<p className="small-medium lg:base-medium">{likes.length || ''}</p>
				</div>

				{/* Comment Button */}
				<div className="flex gap-2 items-center">
					<MessageSquare
						className="w-5 h-5 cursor-pointer text-primary-500 hover:text-primary-600"
						onClick={e => {
							e.stopPropagation()
							onCommentClick?.(e)
						}}
					/>
					<p className="small-medium lg:base-medium">
						{commentCount ?? post.comments?.length ?? ''}
					</p>
				</div>

				{/* Share Button */}
				<div className="flex gap-2 items-center">
					<Share2
						className="w-5 h-5 cursor-pointer text-primary-500 hover:text-primary-600"
						onClick={e => {
							e.stopPropagation()
							onShareClick?.(e)
						}}
					/>
				</div>
			</div>

			{/* Save Button */}
			<div className="flex gap-2">
				<Bookmark
					className={`w-5 h-5 cursor-pointer ${
						isSaved
							? 'text-primary-500 fill-primary-500'
							: 'text-primary-500 hover:text-primary-600'
					}`}
					onClick={handleSavePost}
				/>
			</div>
		</div>
	)
}

export default PostStats