import { ID, Query } from 'appwrite'
import { appwriteConfig, account, databases, storage, avatars } from './config'
import {
	CommentWithUser,
	INewPost,
	INewUser,
	IUpdatePost,
	IUpdateUser,
} from '../../types'
/**
 * Creates a new user account in Appwrite authentication and saves user details in the database.
 * @param {INewUser} user - Object containing user details (email, password, name, and optional username).
 * @returns {Promise<any>} - The created user record from the database.
 * @throws {Error} - If user creation or database storage fails.
 */
export async function createUserAccount(user: INewUser) {
	try {
		// Create a new user account in Appwrite authentication
		const newAccount = await account.create(
			ID.unique(), // Generate a unique user ID
			user.email, // User email for authentication
			user.password, // User password
			user.name || '' // User's full name (optional, default to empty string)
		)

		// Ensure the user account creation was successful
		if (!newAccount) throw new Error('Failed to create user account')

		// Generate an avatar using user's initials
		const avatarUrl = avatars.getInitials(user.name)

		// Save user details to the database, including generated avatar
		const newUser = await saveUserToDB({
			accountId: newAccount.$id, // Appwrite account ID
			email: newAccount.email, // User email
			name: newAccount.name, // User full name
			imageUrl: avatarUrl, // Generated avatar URL
			username: user.username, // Optional username
		})

		// Return the saved user record from the database
		return newUser
	} catch (error) {
		console.log(error) // Log error details for debugging
		throw new Error('Failed to create user account') // Provide a generic error message
	}
}

/**
 * Saves the user details in the Appwrite database.
 * @param {Object} user - The user object to be stored in the database.
 * @param {string} user.accountId - Unique Appwrite account ID.
 * @param {string} user.email - User email address.
 * @param {string} user.name - User's full name.
 * @param {URL} user.imageUrl - URL of the user's avatar image.
 * @param {string} [user.username] - Optional username.
 * @returns {Promise<any>} - The stored user document from the database.
 * @throws {Error} - If database insertion fails.
 */
export const saveUserToDB = async (user: {
	accountId: string
	email: string
	name: string
	imageUrl: URL
	username?: string
}) => {
	try {
		// Save the user data into the specified Appwrite collection
		const newUser = await databases.createDocument(
			appwriteConfig.databaseId, // Database ID where users are stored
			appwriteConfig.userCollectionId, // Collection ID for user records
			ID.unique(), // Generate a unique document ID for the user
			user // The user object containing necessary details
		)

		// Return the saved user document
		return newUser
	} catch (error) {
		console.log(error) // Log error for debugging
		throw new Error('Failed to save user to database') // Generic error message
	}
}

// Function to sign in a user with email and password
export async function signInAccount(user: { email: string; password: string }) {
	try {
		// Attempt to create a session using the provided email and password
		const session = await account.createEmailSession(user.email, user.password)
		return session
	} catch (error) {
		console.log(error)
		throw new Error('Failed to sign in')
	}
}

// Function to sign out the current user
export async function signOutAccount() {
	try {
		// Delete the current user session
		await account.deleteSession('current')
		return true
	} catch (error) {
		console.log(error)
		throw new Error('Failed to sign out')
	}
}

// Function to retrieve the currently logged-in user
export async function getCurrentUser() {
	try {
		// Fetch the currently authenticated account
		const currentAccount = await account.get()
		if (!currentAccount) throw new Error('No account found')

		// Retrieve user details from the database based on account ID
		const currentUser = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			[Query.equal('accountId', currentAccount.$id)]
		)

		if (!currentUser) throw new Error('No user found')
		return currentUser.documents[0]
	} catch (error) {
		console.log(error)
		throw new Error('Failed to get current user')
	}
}

// ============================== CREATE POST
export async function createPost(post: INewPost) {
	try {
		// Upload file to appwrite storage
		const uploadedFile = await uploadFile(post.file[0])

		if (!uploadedFile) throw Error

		// Get file url
		const fileUrl = getFilePreview(uploadedFile.$id)
		if (!fileUrl) {
			await deleteFile(uploadedFile.$id)
			throw Error
		}

		// Convert tags into array
		const tags = post.tags?.replace(/ /g, '').split(',') || []

		// Create post
		const newPost = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			ID.unique(),
			{
				creator: post.userId,
				caption: post.caption,
				imageUrl: fileUrl,
				imageId: uploadedFile.$id,
				location: post.location,
				tags: tags,
			}
		)

		if (!newPost) {
			await deleteFile(uploadedFile.$id)
			throw Error
		}

		return newPost
	} catch (error) {
		console.log(error)
	}
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
	const hasFileToUpdate = post.file.length > 0

	try {
		let image = {
			imageUrl: post.imageUrl,
			imageId: post.imageId,
		}

		if (hasFileToUpdate) {
			// Upload new file to appwrite storage
			const uploadedFile = await uploadFile(post.file[0])
			if (!uploadedFile) throw Error

			// Get new file url
			const fileUrl = getFilePreview(uploadedFile.$id)
			if (!fileUrl) {
				await deleteFile(uploadedFile.$id)
				throw Error
			}

			image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
		}

		// Convert tags into array
		const tags = post.tags?.replace(/ /g, '').split(',') || []

		//  Update post
		const updatedPost = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			post.postId,
			{
				caption: post.caption,
				imageUrl: image.imageUrl,
				imageId: image.imageId,
				location: post.location,
				tags: tags,
			}
		)

		// Failed to update
		if (!updatedPost) {
			// Delete new file that has been recently uploaded
			if (hasFileToUpdate) {
				await deleteFile(image.imageId)
			}

			// If no new file uploaded, just throw error
			throw Error
		}

		// Safely delete old file after successful update
		if (hasFileToUpdate) {
			await deleteFile(post.imageId)
		}

		return updatedPost
	} catch (error) {
		console.log(error)
	}
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
	if (!postId || !imageId) return

	try {
		const statusCode = await databases.deleteDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId
		)

		if (!statusCode) throw Error

		await deleteFile(imageId)

		return { status: 'Ok' }
	} catch (error) {
		console.log(error)
	}
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
	try {
		const uploadedFile = await storage.createFile(
			appwriteConfig.storageId,
			ID.unique(),
			file
		)

		return uploadedFile
	} catch (error) {
		console.log(error)
		throw new Error('error uploading file')
	}
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
	try {
		const fileUrl = storage.getFilePreview(
			appwriteConfig.storageId,
			fileId,
			2000,
			2000,
			'top',
			100
		)

		if (!fileUrl) throw Error

		return fileUrl
	} catch (error) {
		console.log(error)
	}
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
	try {
		await storage.deleteFile(appwriteConfig.storageId, fileId)

		return { status: 'ok' }
	} catch (error) {
		console.log(error)
	}
}

// ============================== GET RECENT POSTS
export async function getRecentPosts() {
	try {
		const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			[Query.orderDesc('$createdAt'), Query.limit(20)]
		)

		if (!posts) throw Error

		return posts
	} catch (error) {
		console.log(error)
	}
}

// ============================== LIKE POST
export async function likePost(postId: string, likesArray: string[]) {
	try {
		const updatedPost = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId,
			{ likes: likesArray }
		)

		if (!updatedPost) throw Error

		return updatedPost
	} catch (error) {
		console.log(error)
	}
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
	try {
		const updatedPost = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.savesCollectionId,
			ID.unique(),
			{
				user: userId,
				post: postId,
			}
		)

		if (!updatedPost) throw Error

		return updatedPost
	} catch (error) {
		console.log(error)
	}
}

// ============================== DELETE POST
export async function deleteSavedPost(savedRecordId: string) {
	try {
		const statusCode = await databases.deleteDocument(
			appwriteConfig.databaseId,
			appwriteConfig.savesCollectionId,
			savedRecordId
		)

		if (!statusCode) throw Error

		return { status: 'Ok' }
	} catch (error) {
		console.log(error)
	}
}

//============================== GET POST BY ID
export async function getPostById(postId?: string) {
	if (!postId) throw new Error('Post ID is required')

	// Validate the postId
	const isValidId = /^[a-zA-Z0-9][a-zA-Z0-9_]{0,35}$/.test(postId)
	if (!isValidId) {
		throw new Error('Invalid Post ID')
	}

	try {
		const post = await databases.getDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId
		)

		if (!post) throw new Error('Post not found')

		return post
	} catch (error) {
		console.log(error)
		throw error // Re-throw the error to be handled by the query
	}
}

// ============================== GET INFINITE POST
export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
	const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(9)]

	if (pageParam) {
		queries.push(Query.cursorAfter(pageParam.toString()))
	}

	try {
		const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			queries
		)

		if (!posts) throw Error

		return posts
	} catch (error) {
		console.log(error)
	}
}

// ============================== GET SEARCH POSTS
export async function getSearchPosts(searchTerm: string) {
	try {
		const [captionResults, tagResults] = await Promise.all([
			databases.listDocuments(
				appwriteConfig.databaseId,
				appwriteConfig.postCollectionId,
				[Query.equal('caption', searchTerm)]
			),
			databases.listDocuments(
				appwriteConfig.databaseId,
				appwriteConfig.postCollectionId,
				[Query.equal('tags', searchTerm)]
			),
		])

		// Merge results and remove duplicates
		const uniqueDocuments = [
			...new Map(
				[...captionResults.documents, ...tagResults.documents].map(doc => [
					doc.$id,
					doc,
				])
			).values(),
		]

		return { documents: uniqueDocuments }
	} catch (error) {
		console.log('Search Error:', error)
		return { documents: [] }
	}
}

// ============================== GET SAVED POSTS
export async function getSavedPosts(userId: string) {
	try {
		const savedPosts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.savesCollectionId,
			[Query.equal('user', userId)]
		)

		if (!savedPosts) throw Error

		return savedPosts
	} catch (error) {
		console.log(error)
	}
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
	try {
		const user = await databases.getDocument(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			userId
		)

		if (!user) throw Error

		return user
	} catch (error) {
		console.log(error)
	}
}

// ============================== GET USERS
export async function getUsers(limit?: number) {
	const queries: any[] = [Query.orderDesc('$createdAt')]

	if (limit) {
		queries.push(Query.limit(limit))
	}

	try {
		const users = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			queries
		)

		if (!users) throw Error

		return users
	} catch (error) {
		console.log(error)
	}
}

// ============================== REMOVE SAVE POSTS
export const removeSavedPosts = async (postId: string) => {
	try {
		// Fetch all users who saved this post
		const usersWithSavedPost = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			[Query.search('save', postId)] // Find users who saved this post
		)

		// Loop through users and remove the deleted post from their saved list
		for (const user of usersWithSavedPost.documents) {
			const updatedSavedList = user.save.filter(
				(savedPost: any) => savedPost !== postId
			)

			// Update the user's saved list
			await databases.updateDocument(
				appwriteConfig.databaseId,
				appwriteConfig.userCollectionId,
				user.$id,
				{ save: updatedSavedList }
			)
		}
	} catch (error) {
		console.error('Failed to remove saved posts:', error)
	}
}

// ============================== DELETE USER
export const deleteUser = async (userId: string) => {
	try {
		const user = await account.deleteIdentity(userId)

		if (!user) throw Error

		return user
	} catch (error) {
		console.log(error)
	}
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
	const hasFileToUpdate = user.file.length > 0
	try {
		let image = {
			imageUrl: user.imageUrl,
			imageId: user.imageId,
		}

		if (hasFileToUpdate) {
			// Upload new file to appwrite storage
			const uploadedFile = await uploadFile(user.file[0])
			if (!uploadedFile) throw Error

			// Get new file url
			const fileUrl = getFilePreview(uploadedFile.$id)
			if (!fileUrl) {
				await deleteFile(uploadedFile.$id)
				throw Error
			}

			image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
		}

		//  Update user
		const updatedUser = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			user.userId,
			{
				name: user.name,
				bio: user.bio,
				imageUrl: image.imageUrl,
				imageId: image.imageId,
			}
		)

		// Failed to update
		if (!updatedUser) {
			// Delete new file that has been recently uploaded
			if (hasFileToUpdate) {
				await deleteFile(image.imageId)
			}
			// If no new file uploaded, just throw error
			throw Error
		}

		// Safely delete old file after successful update
		if (user.imageId && hasFileToUpdate) {
			await deleteFile(user.imageId)
		}

		return updatedUser
	} catch (error) {
		console.log(error)
	}
}

// ============================== FOLLOW USER
export const followUser = async (followerId: string, followingId: string) => {
	try {
		const response = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.followsCollectionId,
			ID.unique(),
			{
				followerId,
				followingId,
				createdAt: new Date().toISOString(),
			}
		)
		return response
	} catch (error) {
		console.error('Follow Error:', error)
		throw error
	}
}

// ============================== UNFOLLOW USER
export const unfollowUser = async (followerId: string, followingId: string) => {
	try {
		const query = [
			Query.equal('followerId', followerId),
			Query.equal('followingId', followingId),
		]
		const followDocs = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.followsCollectionId,
			query
		)

		if (followDocs.documents.length > 0) {
			await databases.deleteDocument(
				appwriteConfig.databaseId,
				appwriteConfig.followsCollectionId,
				followDocs.documents[0].$id
			)
		}
	} catch (error) {
		console.error('Unfollow Error:', error)
		throw error
	}
}

// ============================== CHECK IF FOLLOWING
export const isFollowing = async (followerId: string, followingId: string) => {
	try {
		const query = [
			Query.equal('followerId', followerId),
			Query.equal('followingId', followingId),
		]
		const followDocs = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.followsCollectionId,
			query
		)
		return followDocs.documents.length > 0
	} catch (error) {
		console.error('Check Follow Error:', error)
		return false
	}
}

// ============================== GET FOLLOWERS COUNT
export async function getFollowersCount(userId: string) {
	try {
		// Query all documents where the user is being followed (followingId = userId)
		const response = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.followsCollectionId,
			[
				Query.equal('followingId', userId),
				Query.select(['$id']), // We only need the count, not the full documents
			]
		)

		return response.total
	} catch (error) {
		console.error('Error getting followers count:', error)
		return 0 // Return 0 if there's an error
	}
}

// ============================== GET FOLLOWING COUNT
export async function getFollowingCount(userId: string) {
	try {
		// Query all documents where the user is following others (followerId = userId)
		const response = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.followsCollectionId,
			[
				Query.equal('followerId', userId),
				Query.select(['$id']), // We only need the count, not the full documents
			]
		)

		return response.total
	} catch (error) {
		console.error('Error getting following count:', error)
		return 0 // Return 0 if there's an error
	}
}

// ============================== GET FOLLOWERS LIST
export const getFollowersList = async (userId: string) => {
	try {
		const response = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.followsCollectionId,
			[Query.equal('followingId', userId)]
		)

		// Get user details for each follower
		const followerUsers = await Promise.all(
			response.documents.map(async doc => {
				const user = await databases.getDocument(
					appwriteConfig.databaseId,
					appwriteConfig.userCollectionId,
					doc.followerId
				)
				return user
			})
		)

		return followerUsers
	} catch (error) {
		console.error('Error getting followers list:', error)
		throw error
	}
}

// ============================== GET FOLLOWING LIST
export const getFollowingList = async (userId: string) => {
	try {
		const response = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.followsCollectionId,
			[Query.equal('followerId', userId)]
		)

		// Get user details for each followed user
		const followingUsers = await Promise.all(
			response.documents.map(async doc => {
				const user = await databases.getDocument(
					appwriteConfig.databaseId,
					appwriteConfig.userCollectionId,
					doc.followingId
				)
				return user
			})
		)

		return followingUsers
	} catch (error) {
		console.error('Error getting following list:', error)
		throw error
	}
}

// ============================== NOTIFY USER
export const notifyUser = async (
	userId: string,
	senderId: string,
	type: 'follow' | 'like' | 'comment',
	postId?: string
) => {
	try {
		return await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.notificationCollectionId,
			ID.unique(),
			{
				userId,
				senderId,
				type,
				postId: type === 'like' ? postId : undefined,
				isRead: false,
			}
		)
	} catch (error) {
		console.error('Notification Error:', error)
		throw error
	}
}

// ============================== GET NOTIFICATIONS
export const getNotifications = async (userId: string) => {
	try {
		const notifications = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.notificationCollectionId,
			[Query.equal('userId', userId), Query.orderDesc('$createdAt')]
		)

		const enrichedNotifications = await Promise.all(
			notifications.documents.map(async notification => {
				if (notification.type === 'like' && notification.postId) {
					try {
						const post = await databases.getDocument(
							appwriteConfig.databaseId,
							appwriteConfig.postCollectionId,
							notification.postId
						)
						return { ...notification, post }
					} catch (error) {
						console.error('Error fetching post:', error)
						return notification
					}
				} else if (notification.senderId) {
					try {
						const sender = await databases.getDocument(
							appwriteConfig.databaseId,
							appwriteConfig.userCollectionId,
							notification.senderId
						)
						return { ...notification, sender }
					} catch (error) {
						console.error('Error fetching sender:', error)
						return notification
					}
				}
				return notification
			})
		)

		return { ...notifications, documents: enrichedNotifications }
	} catch (error) {
		console.error('Fetch Notifications Error:', error)
		throw error
	}
}

// ============================== MARK AS READ
export const markAsRead = async (notificationId: string) => {
	try {
		return await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.notificationCollectionId,
			notificationId,
			{ isRead: true }
		)
	} catch (error) {
		console.error('Mark as Read Error:', error)
		throw error
	}
}

// ============================== MARK ALL AS READ
export const markAllNotificationsAsRead = async (userId: string) => {
	try {
		// First get all unread notifications
		const unreadNotifications = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.notificationCollectionId,
			[
				Query.equal('userId', userId),
				Query.equal('isRead', false),
				Query.orderDesc('$createdAt'),
			]
		)

		// Update all unread notifications
		const updatePromises = unreadNotifications.documents.map(notification =>
			databases.updateDocument(
				appwriteConfig.databaseId,
				appwriteConfig.notificationCollectionId,
				notification.$id,
				{ isRead: true }
			)
		)

		await Promise.all(updatePromises)

		// Return the updated count
		return { success: true, count: unreadNotifications.documents.length }
	} catch (error) {
		console.error('Mark All as Read Error:', error)
		throw error
	}
}

// ============================== CLEAR ALL NOTIFICATIONS
export const clearAllNotifications = async (userId: string) => {
	try {
		// Get all user notifications
		const allNotifications = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.notificationCollectionId,
			[Query.equal('userId', userId), Query.orderDesc('$createdAt')]
		)

		// Delete all notifications
		const deletePromises = allNotifications.documents.map(notification =>
			databases.deleteDocument(
				appwriteConfig.databaseId,
				appwriteConfig.notificationCollectionId,
				notification.$id
			)
		)

		await Promise.all(deletePromises)

		return { success: true, count: allNotifications.documents.length }
	} catch (error) {
		console.error('Clear All Notifications Error:', error)
		throw error
	}
}

// ====================== COMMENTS API ======================
export const createComment = async ({
	postId,
	userId,
	content,
}: {
	postId: string
	userId: string
	content: string
}) => {
	return await databases.createDocument(
		appwriteConfig.databaseId,
		appwriteConfig.commentsCollectionId,
		ID.unique(),
		{ postId, userId, content }
	)
}

export const updateComment = async ({
	commentId,
	content,
}: {
	commentId: string
	content: string
}) => {
	return await databases.updateDocument(
		appwriteConfig.databaseId,
		appwriteConfig.commentsCollectionId,
		commentId,
		{ content }
	)
}

export const deleteComment = async (commentId: string) => {
	return await databases.deleteDocument(
		appwriteConfig.databaseId,
		appwriteConfig.commentsCollectionId,
		commentId
	)
}

export const getPostCommentsWithUsers = async (
	postId: string
): Promise<CommentWithUser[]> => {
	// First get the comments
	const comments = await databases.listDocuments(
		appwriteConfig.databaseId,
		appwriteConfig.commentsCollectionId,
		[Query.equal('postId', postId), Query.orderDesc('$createdAt')]
	)

	// Then get user data for each comment
	const commentsWithUsers = await Promise.all(
		comments.documents.map(async comment => {
			const user = await databases.getDocument(
				appwriteConfig.databaseId,
				appwriteConfig.userCollectionId,
				comment.userId
			)
			return {
				...comment,
				user,
			} as CommentWithUser
		})
	)

	return commentsWithUsers
}

// ====================== SHARES ======================
export const sharePost = async ({
	postId,
	userId,
	shareType = 'internal',
	externalLink = '',
}: {
	postId: string
	userId: string
	shareType?: 'internal' | 'external'
	externalLink?: string
}) => {
	return await databases.createDocument(
		appwriteConfig.databaseId,
		appwriteConfig.sharesCollectionId,
		ID.unique(),
		{
			postId,
			userId,
			shareType,
			externalLink: shareType === 'external' ? externalLink : '',
		}
	)
}
