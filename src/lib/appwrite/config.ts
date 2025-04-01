import { Client, Account, Databases, Storage, Avatars } from 'appwrite'

/**
 * Configuration object for Appwrite services.
 * This stores environment variables required to connect to Appwrite.
 */
export const appwriteConfig = {
	url: import.meta.env.VITE_APPWRITE_URL, // API endpoint URL for Appwrite
	projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID, // Project ID for Appwrite
	databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID, // Database ID for storing structured data
	storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID, // Storage ID for managing files
	userCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID, // Collection ID for user records
	postCollectionId: import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID, // Collection ID for posts
	savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID, // Collection ID for saved items
	followsCollectionId: import.meta.env.VITE_APPWRITE_FOLLOWS_COLLECTION_ID, // Collection ID for follows
	notificationCollectionId: import.meta.env
		.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID, // Collection ID for notifications
	sharesCollectionId: import.meta.env.VITE_APPWRITE_SHARES_COLLECTION_ID, // Collection ID for shares
	commentsCollectionId: import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID, // Collection ID for comments
}

/**
 * Initialize the Appwrite client with the API endpoint and project ID.
 * This client is used to interact with Appwrite services.
 */
export const client = new Client()
	.setEndpoint(appwriteConfig.url) // Set the API endpoint from the config
	.setProject(appwriteConfig.projectId) // Set the project ID

// Log the configuration to ensure environment variables are loaded correctly

/**
 * Instance of the Account service to handle user authentication.
 */
export const account = new Account(client)

/**
 * Instance of the Databases service to manage structured data.
 */
export const databases = new Databases(client)

/**
 * Instance of the Storage service to handle file uploads.
 */
export const storage = new Storage(client)

/**
 * Instance of the Avatars service to generate user avatars.
 */
export const avatars = new Avatars(client)
