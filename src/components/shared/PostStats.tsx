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

	const { mutate: likePost } = useLikePost()
	const { mutate: savePost } = useSavePost()
	const { mutate: deleteSavePost } = useDeleteSavedPost()

	const { data: currentUser, isLoading } = useGetCurrentUser()

	// Prevent accessing properties if currentUser is null or undefined
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
		e: React.MouseEvent<HTMLImageElement, MouseEvent>
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

			// Send notification if this is a new like
			if (!hasLiked) {
				await createNotification({
					userId: post.creator.$id, // Notify post author
					senderId: userId, // Current user
					type: 'like',
					postId: post.$id,
				})
			}
		} catch (error) {
			console.error('Error handling like:', error)
			// Revert UI if API call fails
			setLikes(
				hasLiked
					? [...likesArray, userId]
					: likesArray.filter(Id => Id !== userId)
			)
		}
	}

	const handleSavePost = (
		e: React.MouseEvent<HTMLImageElement, MouseEvent>
	) => {
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

	if (isLoading) return null // Prevent errors while data is loading

	return (
		<div
			className={`flex justify-between items-center z-20 ${containerStyles}`}>
			<div className="flex gap-2 mr-5">
				<img
					src={`${
						checkIsLiked(likes, userId)
							? '/assets/icons/liked.svg'
							: '/assets/icons/like.svg'
					}`}
					alt="like"
					width={20}
					height={20}
					onClick={handleLikePost}
					className="cursor-pointer"
				/>
				<p className="small-medium lg:base-medium">{likes.length}</p>
			</div>

			<div className="flex gap-2">
				<img
					src={isSaved ? '/assets/icons/saved.svg' : '/assets/icons/save.svg'}
					alt="save"
					width={20}
					height={20}
					className="cursor-pointer"
					onClick={handleSavePost}
				/>
			</div>
		</div>
	)
}

export default PostStats