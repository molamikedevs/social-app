import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Models } from 'appwrite'

import { Button } from '../../components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import { Textarea } from '../ui/textarea'
import FileUploader from '../shared/FileUploader'
import { postValidation } from '../../lib/validation'
import { useCreatePost, useUpdatePost } from '../../lib/react-query/queriesAndMutation'
import { useUserContext } from '../../context/AuthContext'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import Loader from '../shared/Loader'

type PostFormProps = {
	post?: Models.Document;
	action: 'Create' | 'Update';
}

const PostForm = ({ post, action }: PostFormProps) => {
	const navigate = useNavigate()
	const { user } = useUserContext()
	const { mutateAsync: createPost, isLoading: isCreatingPost } = useCreatePost()
	const { mutateAsync: updatePost, isLoading: isUpdatingPost } = useUpdatePost()


	// 1. Define your form.
	const form = useForm<z.infer<typeof postValidation>>({
		resolver: zodResolver(postValidation),
		defaultValues: {
			caption: post ? post.caption : '',
			file: [],
			location: post ? post.location : '',
			tags: post ? post.tags.join(',') : '',
		},
	})

	// 2. Define a submit handler.
	const onSubmit = async (values: z.infer<typeof postValidation>) => {
		if (post && action === 'Update') {
			const updatedPost = await updatePost({
                ...values,
                postId: post.$id,
                imageId: post?.imageId,
                imageUrl: post?.imageUrl,
                file: [], // Clear existing file for now, might add it later.
            })

			if (!updatedPost) {
                toast.error('Failed to update post. Please try again.')
            }
			return navigate('/posts/${post.$id}')
		}
		const newPost = await createPost({
			...values,
			userId: user.id,
		})

		if (!newPost) {
			toast.error('Failed to create post. Please try again.')
			return
		}

		navigate('/')
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-9 w-full max-w-5xl">
				<FormField
					control={form.control}
					name="caption"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="shad-form_label">Caption</FormLabel>
							<FormControl>
								<Textarea
									className="shad-textarea custom-scrollbar"
									{...field}
								/>
							</FormControl>
							<FormMessage className="shad-form_message" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="file"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="shad-form_label">Add Photos</FormLabel>
							<FormControl>
								<FileUploader
									fieldChange={field.onChange}
									mediaUrl={post?.imageUrl}
									{...field}
								/>
							</FormControl>
							<FormMessage className="shad-form_message" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="location"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="shad-form_label">Add Location</FormLabel>
							<FormControl>
								<Input
									type="text"
									className="shad-input"
									placeholder="Art, Expression, Learn, Tech"
									{...field}
								/>
							</FormControl>
							<FormMessage className="shad-form_message" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="tags"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="shad-form_label">
								Add Tags(separated by comma " ,")
							</FormLabel>
							<FormControl>
								<Input type="text" className="shad-input" {...field} />
							</FormControl>
							<FormMessage className="shad-form_message" />
						</FormItem>
					)}
				/>

				<div className="flex gap-4 items-center justify-end">
					<Button type="button" className="shad-button_dark_4">
						Cancel
					</Button>
					<Button
						type="submit"
						className="shad-button_primary whitespace-nowrap" disabled={isCreatingPost || isUpdatingPost}>
							{isCreatingPost || isUpdatingPost && <Loader />}
						{action} post
					</Button>
				</div>
			</form>
		</Form>
	)
}

export default PostForm
