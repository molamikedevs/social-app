import { ID, Query } from 'appwrite'
import { appwriteConfig, account, databases, storage, avatars } from './config'
import { INewPost, INewUser, IUpdatePost } from '../../types'
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

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
	if (!postId) throw Error

	try {
		const post = await databases.getDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId
		)

		if (!post) throw Error

		return post
	} catch (error) {
		console.log(error)
	}
}