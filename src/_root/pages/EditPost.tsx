import { useGetPostById } from '../../lib/react-query/queriesAndMutation'
import PostForm from '../../components/forms/PostForm'
import { useParams } from 'react-router-dom'
import Loader from '../../components/shared/Loader'

const EditPost = () => {
	const { id } = useParams()
	const { data: post, isLoading: isEditing } = useGetPostById(id || '')

	if (isEditing) return <Loader />

	return (
		<div className="flex flex-1">
			<div className="common-container">
				<div className="max-w-5xl flex-start gap-3 justify-start w-full">
					<img
						src="/assets/icons/add-post.svg"
						alt="add"
						width={36}
						height={36}
					/>
					<h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
				</div>

				{/* Your post creation form goes here */}
				<PostForm action="Update" post={post} />
			</div>
		</div>
	)
}

export default EditPost
