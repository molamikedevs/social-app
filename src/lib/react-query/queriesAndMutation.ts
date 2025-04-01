import { INewPost, INewUser, IUpdatePost, IUpdateUser } from '@/types'
import { QUERY_KEYS } from '../../lib/react-query/queryKeys'
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import {
	createPost,
	createUserAccount,
	deletePost,
	deleteSavedPost,
	getCurrentUser,
	getInfinitePosts,
	getPostById,
	getRecentPosts,
	getSearchPosts,
	likePost,
	savePost,
	signInAccount,
	signOutAccount,
	updatePost,
	getUserById,
	getUsers,
	updateUser,
	followUser,
	unfollowUser,
	isFollowing,
	getFollowingCount,
	getFollowersCount,
	getFollowingList,
	getFollowersList,
	getNotifications,
	notifyUser,
	markAsRead,
	clearAllNotifications,
	markAllNotificationsAsRead,
	createComment,
	deleteComment,
	updateComment,
	getPostComments,
	sharePost,
} from '../appwrite/api'

//userCreateUserAccountMutation
export const useCreateUserAccount = () => {
	return useMutation({
		mutationFn: (user: INewUser) => createUserAccount(user),
	})
}

//useSignInAccount
export const useSignInAccount = () => {
	return useMutation({
		mutationFn: (user: { email: string; password: string }) =>
			signInAccount(user),
	})
}

export const useSignOutAccount = () => {
	return useMutation({
		mutationFn: signOutAccount,
	})
}

export const useCreatePost = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (post: INewPost) => createPost(post),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			})
		},
	})
}

//useGetRecentPosts
export const useGetRecentPosts = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
		queryFn: getRecentPosts,
	})
}

//useLikePost
export const useLikePost = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({
			postId,
			likesArray,
		}: {
			postId: string
			likesArray: string[]
		}) => likePost(postId, likesArray),
		onSuccess: data => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
			})
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			})
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POSTS],
			})
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			})
		},
	})
}

//useSavePost
export const useSavePost = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
			savePost(userId, postId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			})
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POSTS],
			})
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			})
		},
	})
}

//useDeleteSavedPost
export const useDeleteSavedPost = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			})
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POSTS],
			})
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			})
		},
	})
}

//useGetCurrentUser
export const useGetCurrentUser = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_CURRENT_USER],
		queryFn: () => getCurrentUser(),
	})
}

// ============================== USE GET POST BY ID
export const useGetPostById = (postId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
		queryFn: () => getPostById(postId),
		enabled: !!postId, // Only run the query if postId is truthy
	})
}

export const useUpdatePost = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (post: IUpdatePost) => updatePost(post),
		onSuccess: data => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
			})
		},
	})
}

export const useDeletePost = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
			deletePost(postId, imageId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			})
		},
	})
}

// =============================== USE GET POSTS
export const useGetPosts = () => {
	return useInfiniteQuery({
		queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
		queryFn: getInfinitePosts as any,
		getNextPageParam: (lastPage: any) => {
			// If there's no data, there are no more pages.
			if (lastPage && lastPage.documents.length === 0) {
				return null
			}

			// Use the $id of the last document as the cursor.
			const lastId = lastPage.documents[lastPage.documents.length - 1].$id
			return lastId
		},
	})
}

// =============================== USE SEARCH POSTS
export const useSearchPosts = (searchTerm: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
		queryFn: () => getSearchPosts(searchTerm),
		enabled: !!searchTerm,
	})
}

// =============================== USE GET USER BY ID
export const useGetUserById = (userId: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
		queryFn: () => getUserById(userId),
		enabled: !!userId,
	})
}

// =============================== USE GET USERS
export const useGetUsers = (limit?: number) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_USERS],
		queryFn: () => getUsers(limit),
	})
}

// =============================== USE UPDATE USER
export const useUpdateUser = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (user: IUpdateUser) => updateUser(user),
		onSuccess: data => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			})
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
			})
		},
	})
}

// =============================== USE FOLLOW USER
export const useFollowUser = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			followerId,
			followingId,
		}: {
			followerId: string
			followingId: string
		}) => {
			return followUser(followerId, followingId)
		},
		onSuccess: (_, { followingId }) => {
			queryClient.invalidateQueries(['isFollowing', followingId])
		},
	})
}

// =============================== USE UNFOLLOW USER
export const useUnfollowUser = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			followerId,
			followingId,
		}: {
			followerId: string
			followingId: string
		}) => {
			return unfollowUser(followerId, followingId)
		},
		onSuccess: (_, { followingId }) => {
			queryClient.invalidateQueries(['isFollowing', followingId])
		},
	})
}

// =============================== USE FOLLOW STATUS
export const useFollowStatus = (followerId?: string, followingId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_FOLLOW_STATUS, followingId],
		queryFn: () => isFollowing(followerId!, followingId!),
		enabled: !!followerId && !!followingId,
	})
}

// =============================== USE GET FOLLOWERS AND FOLLOWING COUNT
export const useGetFollowersCount = (userId: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_FOLLOWERS_COUNT, userId],
		queryFn: () => getFollowersCount(userId),
		enabled: !!userId,
	})
}

// =============================== USE GET FOLLOWING COUNT
export const useGetFollowingCount = (userId: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_FOLLOWING_COUNT, userId],
		queryFn: () => getFollowingCount(userId),
		enabled: !!userId,
	})
}

// =============================== USE GET FOLLOWERS AND FOLLOWING LIST
export const useGetFollowersList = (userId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_FOLLOWERS_LIST, userId],
		queryFn: () => getFollowersList(userId!),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
}

// =============================== USE GET FOLLOWING LIST
export const useGetFollowingList = (userId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_FOLLOWING_LIST, userId],
		queryFn: () => getFollowingList(userId!),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
}

// =============================== USE GET NOTIFICATIONS
export const useGetNotifications = (userId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, userId],
		queryFn: () => getNotifications(userId!),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
}

// =============================== USE CREATE NOTIFICATION
export const useCreateNotification = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({
			userId,
			senderId,
			type,
			postId,
		}: {
			userId: string
			senderId: string
			type: 'follow' | 'like'
			postId?: string
		}) => notifyUser(userId, senderId, type, postId),
		onSuccess: () => {
			queryClient.invalidateQueries(['notifications'])
		},
	})
}

// =============================== USE MARK AS READ
export const useMarkAsRead = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: markAsRead,
		onSuccess: () => {
			queryClient.invalidateQueries(['notifications'])
		},
	})
}

// ============================== USE MARK ALL AS READ
export const useMarkAllAsRead = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: markAllNotificationsAsRead,
		onSuccess: () => {
			// Invalidate notifications query to refetch
			queryClient.invalidateQueries(['notifications'])
		},
	})
}

// ============================== USE CLEAR ALL NOTIFICATIONS
export const useClearAllNotifications = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: clearAllNotifications,
		onSuccess: () => {
			// Invalidate notifications query to refetch
			queryClient.invalidateQueries(['notifications'])
		},
	})
}

// ====================== COMMENTS ======================
export const useCreateComment = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createComment,
		onSuccess: (_, { postId }) => {
			queryClient.invalidateQueries(['comments', postId])
		},
	})
}

export const useUpdateComment = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: updateComment,
		onSuccess: _ => {
			queryClient.invalidateQueries(['comments'])
		},
	})
}

export const useDeleteComment = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: deleteComment,
		onSuccess: () => {
			queryClient.invalidateQueries(['comments'])
		},
	})
}

export const useGetComments = (postId: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_USER_COMMENTS, postId],
		queryFn: () => getPostComments(postId).then(res => res.documents),
	})
}

// ====================== SHARES ======================
export const useSharePost = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: sharePost,
		onSuccess: (_, { postId }) => {
			queryClient.invalidateQueries(['shares', postId])
		},
	})
}
