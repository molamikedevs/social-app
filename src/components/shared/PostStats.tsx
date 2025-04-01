import React, { useState, useEffect } from 'react'
import {
	useCreateNotification,
	useDeleteSavedPost,
	useGetCurrentUser,
	useLikePost,
	useSavePost,
} from '../../lib/react-query/queriesAndMutation'
import { Models } from 'appwrite'
import { checkIsLiked } from '../../lib/utils'
import { useLocation } from 'react-router-dom'
import { MessageSquare, Share2, Heart, Bookmark } from 'lucide-react'

type PostStatsProps = {
	post: Models.Document
	userId: string
}

const PostStats = ({ post, userId }: PostStatsProps) => {
	const { mutateAsync: createNotification } = useCreateNotification()
	const location = useLocation()
	const likesList = post.likes?.map((user: Models.Document) => user.$id) || []

	const [likes, setLikes] = useState<string[]>(likesList)
	const [isSaved, setIsSaved] = useState(false)
	const [showShareOptions, setShowShareOptions] = useState(false) // For share dropdown

	const { mutate: likePost } = useLikePost()
	const { mutate: savePost } = useSavePost()
	const { mutate: deleteSavePost } = useDeleteSavedPost()

	const { data: currentUser, isLoading } = useGetCurrentUser()

	const savedPostRecord =
		currentUser?.save?.find(
			(record: Models.Document) => record?.post?.$id === post.$id
		) || null

	useEffect(() => {
		if (currentUser) {
			setIsSaved(!!savedPostRecord)
		}
	}, [currentUser])

	const handleLikePost = async (
		e: React.MouseEvent<SVGSVGElement, MouseEvent>
	) => {
		e.stopPropagation()
		let likesArray = [...likes]
		const hasLiked = likesArray.includes(userId)

		if (hasLiked) {
			likesArray = likesArray.filter(Id => Id !== userId)
		} else {
			likesArray.push(userId)
		}

		setLikes(likesArray)
		try {
			await likePost({ postId: post.$id || '', likesArray })
			if (!hasLiked) {
				await createNotification({
					userId: post.creator.$id,
					senderId: userId,
					type: 'like',
					postId: post.$id,
				})
			}
		} catch (error) {
			console.error('Error handling like:', error)
			setLikes(
				hasLiked
					? [...likesArray, userId]
					: likesArray.filter(Id => Id !== userId)
			)
		}
	}

	const handleSavePost = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
		e.stopPropagation()
		if (savedPostRecord) {
			setIsSaved(false)
			return deleteSavePost(savedPostRecord.$id)
		}
		savePost({ userId: userId, postId: post.$id || '' })
		setIsSaved(true)
	}

	const containerStyles = location.pathname.startsWith('/profile')
		? 'w-full'
		: ''

	if (isLoading) return null

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
						onClick={e => {
							e.stopPropagation()
							handleLikePost(e) // No type assertion needed
						}}
					/>
					<p className="small-medium lg:base-medium">{likes.length}</p>
				</div>

				{/* Comment Button */}
				<div className="flex gap-2 items-center">
					<MessageSquare
						className="w-5 h-5 cursor-pointer text-gray-600 hover:text-primary-500"
						onClick={e => {
							e.stopPropagation()
							// Comment logic will go here later
						}}
					/>
					<p className="small-medium lg:base-medium">
						{post.comments?.length || 0}
					</p>
				</div>

				{/* Share Button */}
				<div className="relative flex gap-2 items-center">
					<Share2
						className="w-5 h-5 cursor-pointer text-gray-600 hover:text-primary-500"
						onClick={e => {
							e.stopPropagation()
							setShowShareOptions(!showShareOptions)
						}}
					/>
					{/* Share dropdown remains unchanged */}
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
					onClick={e => {
						e.stopPropagation()
						handleSavePost(e)
					}}
				/>
			</div>
		</div>
	)
}

export default PostStats