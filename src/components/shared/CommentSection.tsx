import { useState } from 'react'
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

const CommentSection = ({ postId }: { postId: string }) => {
	const { user } = useUserContext()
	const [commentText, setCommentText] = useState('')
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
	const [editText, setEditText] = useState('')


	const { data: comments } = useGetComments(postId)
	const { mutate: updateComment } = useUpdateComment()
	const { mutate: createComment } = useCreateComment()
	const { mutate: deleteComment } = useDeleteComment()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (commentText.trim()) {
			createComment({ postId, userId: user.id, content: commentText })
			setCommentText('')
		}
	}

	const handleSaveEdit = (commentId: string) => {
		if (editText.trim()) {
			updateComment({ commentId, content: editText })
			setEditingCommentId(null)
		}
	}

	const handleDelete = (commentId: string) => {
		deleteComment(commentId)
	}

	return (
		<div className="mt-6 border-t border-dark-4 pt-4">
			<h3 className="body-bold mb-4">Comment</h3>

			{/* Comment Input */}
			<form onSubmit={handleSubmit} className="flex gap-2 mb-6">
				<input
					type="text"
					value={commentText}
					onChange={e => setCommentText(e.target.value)}
					placeholder="Add a comment..."
					className="bg-dark-3 rounded-lg px-4 py-2 flex-1 text-light-1"
				/>
				<Button
					type="submit"
					disabled={!commentText.trim()}
					className="shad-button_primary whitespace-nowrap px-4">
					Post
				</Button>
			</form>

			{/* Comments List */}
			<div className="space-y-4">
				{comments?.map((comment: Models.Document) => (
					<div key={comment.$id} className="flex gap-3 group">
						<img
							src={
								comment.user?.imageUrl ||
								'/assets/icons/profile-placeholder.svg'
							}
							alt="user"
							className="w-8 h-8 rounded-full"
						/>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<p className="small-semibold">{comment.user?.name}</p>
								<p className="subtle-semibold text-light-3 text-xs">
									{timeAgo(comment.$createdAt)}
								</p>
							</div>
							{editingCommentId === comment.$id ? (
								<div className="flex gap-2 mt-1">
									<input
										value={editText}
										onChange={e => setEditText(e.target.value)}
										className="bg-dark-3 rounded px-2 py-1 text-light-1 flex-1"
									/>
									<Button size="sm" onClick={() => handleSaveEdit(comment.$id)}>
										Save
									</Button>
								</div>
							) : (
								<p className="text-light-2">{comment.content}</p>
							)}
						</div>

						{/*Delete buttons (only show for comment owner) */}
						{comment.userId === user.id && (
							<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									onClick={() => {
										setEditingCommentId(comment.$id)
										setEditText(comment.content)
									}}
									className="text-light-3 hover:text-light-1">
									<Edit size={16} />
								</button>
								<button
									onClick={() => handleDelete(comment.$id)}
									className="text-light-3 hover:text-rose-500">
									<Trash2 size={16} />
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
