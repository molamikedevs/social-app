import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Models } from 'appwrite'
import { useUserContext } from '../../context/AuthContext'
import { Button } from '../../components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import {
	useCreateComment,
	useDeleteComment,
	useGetComments,
	useUpdateComment,
} from '../../lib/react-query/queriesAndMutation'
import { timeAgo } from '../../lib/utils'
import Loader from '../../components/shared/Loader'
import { useCreateNotification } from '../../lib/react-query/queriesAndMutation'

type CommentWithUser = Models.Document & {
	user: Models.Document
}

const CommentSection = ({ postId }: { postId: string }) => {
	const { user } = useUserContext()
	const [commentText, setCommentText] = useState('')
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
	const [editText, setEditText] = useState('')

	const { data: comments, isLoading } = useGetComments(postId)
	const { mutate: createComment, isLoading: isCreating } = useCreateComment()
	const { mutate: updateComment, isLoading: isUpdating } = useUpdateComment()
	const { mutate: deleteComment, isLoading: isDeleting } = useDeleteComment()
	const { mutateAsync: createNotification } = useCreateNotification()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (commentText.trim()) {
			createComment(
				{ postId, userId: user.id, content: commentText },
				{
					onSuccess: newComment => {
						// Send notification to post owner
						if (newComment.post?.creator?.$id !== user.id) {
							createNotification({
								userId:
									newComment.post?.creator?.$id || newComment.post.creator,
								senderId: user.id,
								type: 'comment',
								postId: postId,
							})
						}
						setCommentText('')
					},
				}
			)
		}
	}

	const handleSaveEdit = (commentId: string) => {
		if (editText.trim()) {
			updateComment(
				{ commentId, content: editText },
				{
					onSuccess: () => {
						setEditingCommentId(null)
					},
				}
			)
		}
	}

	const handleDelete = (commentId: string) => {
		deleteComment(commentId)
	}

	if (isLoading) return <Loader />

	return (
		<div className="mt-6 border-t border-dark-4 pt-4">
			<h3 className="body-bold mb-4">Comments</h3>

			{/* Comment Input */}
			<form onSubmit={handleSubmit} className="flex gap-2 mb-6">
				<input
					type="text"
					value={commentText}
					onChange={e => setCommentText(e.target.value)}
					placeholder="Add a comment..."
					className="bg-dark-3 rounded-lg px-4 py-2 flex-1 text-light-1"
					disabled={isCreating}
				/>
				<Button
					type="submit"
					disabled={!commentText.trim() || isCreating}
					className="shad-button_primary whitespace-nowrap px-4">
					{isCreating ? 'Posting...' : 'Post'}
				</Button>
			</form>

			{/* Comments List */}
			<div className="space-y-4">
				{(comments as CommentWithUser[])?.map(comment => (
					<div key={comment.$id} className="flex gap-3 group">
						{/* Clickable Avatar */}
						<Link
							to={`/profile/${comment.user?.$id}`}
							className="flex-shrink-0 hover:ring-2 hover:ring-primary-500 rounded-full transition-all"
							onClick={e => e.stopPropagation()}>
							<img
								src={
									comment.user?.imageUrl ||
									'/assets/icons/profile-placeholder.svg'
								}
								alt={comment.user?.name || 'User'}
								className="w-8 h-8 rounded-full object-cover"
							/>
						</Link>

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								{/* Clickable Username */}
								<Link
									to={`/profile/${comment.user?.$id}`}
									className="small-semibold hover:text-primary-500 hover:underline truncate"
									title={comment.user?.name || 'User'}>
									{comment.user?.name || 'Unknown User'}
								</Link>
								<p className="subtle-semibold text-light-3 text-xs whitespace-nowrap">
									{timeAgo(comment.$createdAt)}
								</p>
							</div>

							{/* Comment Content */}
							{editingCommentId === comment.$id ? (
								<div className="flex gap-2 mt-1">
									<input
										value={editText}
										onChange={e => setEditText(e.target.value)}
										className="bg-dark-3 rounded px-2 py-1 text-light-1 flex-1"
										disabled={isUpdating}
									/>
									<Button
										size="sm"
										onClick={() => handleSaveEdit(comment.$id)}
										disabled={isUpdating}>
										{isUpdating ? 'Saving...' : 'Save'}
									</Button>
								</div>
							) : (
								<p className="text-light-2 break-words mt-1">
									{comment.content}
								</p>
							)}
						</div>

						{/* Edit/Delete Buttons */}
						{comment.userId === user.id && (
							<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									onClick={() => {
										setEditingCommentId(comment.$id)
										setEditText(comment.content)
									}}
									className="text-light-3 hover:text-light-1"
									disabled={isUpdating || isDeleting}>
									<Edit size={16} />
								</button>
								<button
									onClick={() => handleDelete(comment.$id)}
									className="text-light-3 hover:text-rose-500"
									disabled={isDeleting}>
									{isDeleting ? 'Deleting...' : <Trash2 size={16} />}
								</button>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	)
}

export default CommentSection