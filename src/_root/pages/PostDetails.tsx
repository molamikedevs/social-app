import { useState, useEffect } from 'react'
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import Loader from '../../components/shared/Loader'
import { multiFormatDateString } from '../../lib/utils'
import { useUserContext } from '../../context/AuthContext'
import PostStats from '../../components/shared/PostStats'
import CommentSection from '../../components/shared/CommentSection'
import {
	useDeletePost,
	useGetComments,
	useGetPostById,
} from '../../lib/react-query/queriesAndMutation'

const PostDetails = () => {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	const { state } = useLocation()
	const { user } = useUserContext()
	const [showComments, setShowComments] = useState(false)
	const [showShareMenu, setShowShareMenu] = useState(false)

	const { data: post, isLoading } = useGetPostById(id || '')
	const { mutate: deletePost } = useDeletePost()
	const { data: comments } = useGetComments(id || '')

	useEffect(() => {
		if (state?.focusComment) {
			setShowComments(true)
			window.history.replaceState({}, document.title)
		}
	}, [state])

	const handleDeletePost = () => {
		if (!id || !post?.imageId) return
		deletePost({ postId: id, imageId: post.imageId })
		navigate(-1)
	}

	if (isLoading || !post) return <Loader />

	return (
		<div className="post_details-container">
			<div className="hidden md:flex max-w-5xl w-full">
				<Button
					onClick={() => navigate(-1)}
					variant="ghost"
					className="shad-button_ghost">
					<img src="/assets/icons/back.svg" alt="back" width={24} height={24} />
					<p className="small-medium lg:base-medium">Back</p>
				</Button>
			</div>

			<div className="post_details-card">
				<img src={post.imageUrl} alt="post" className="post_details-img" />

				<div className="post_details-info">
					<div className="flex-between w-full">
						<Link
							to={`/profile/${post.creator.$id}`}
							className="flex items-center gap-3">
							<img
								src={
									post.creator.imageUrl ||
									'/assets/icons/profile-placeholder.svg'
								}
								alt="creator"
								className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
							/>
							<div className="flex gap-1 flex-col">
								<p className="base-medium lg:body-bold text-light-1">
									{post.creator.name}
								</p>
								<div className="flex-center gap-2 text-light-3">
									<p className="subtle-semibold lg:small-regular">
										{multiFormatDateString(post.$createdAt)}
									</p>
									•
									<p className="subtle-semibold lg:small-regular">
										{post.location}
									</p>
								</div>
							</div>
						</Link>

						<div className="flex-center gap-4">
							<Link
								to={`/update-post/${post.$id}`}
								className={`${user.id !== post.creator.$id && 'hidden'}`}>
								<img
									src="/assets/icons/edit.svg"
									alt="edit"
									width={24}
									height={24}
								/>
							</Link>

							<Button
								onClick={handleDeletePost}
								variant="ghost"
								className={`${user.id !== post.creator.$id && 'hidden'}`}>
								<img
									src="/assets/icons/delete.svg"
									alt="delete"
									width={24}
									height={24}
								/>
							</Button>
						</div>
					</div>

					<hr className="border w-full border-dark-4/80" />

					<div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
						<p>{post.caption}</p>
						<ul className="flex gap-1 mt-2">
							{post.tags.map((tag: string, index: number) => (
								<li
									key={`${tag}${index}`}
									className="text-light-3 small-regular">
									#{tag}
								</li>
							))}
						</ul>
					</div>

					<div className="w-full relative">
						<PostStats
							post={post}
							userId={user.id}
							onCommentClick={() => setShowComments(!showComments)}
							onShareClick={() => setShowShareMenu(!showShareMenu)}
							commentCount={comments?.length}
						/>

						{showShareMenu && (
							<div className="absolute right-15 mt-2 w-48 bg-dark-3 rounded-md shadow-lg z-10 p-2">
								<button
									className="block w-full text-left px-4 py-2 hover:bg-dark-4 rounded"
									onClick={() => {
										navigator.clipboard.writeText(
											`${window.location.origin}/posts/${id}`
										)
										setShowShareMenu(false)
									}}>
									Copy Link
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{showComments && <CommentSection postId={id || ''} />}
		</div>
	)
}

export default PostDetails
