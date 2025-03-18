import { ID, Query } from 'appwrite'
import { INewUser } from '../../types'
import { account, appwriteConfig, avatars, databases } from './config'

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
		const session = await account.createEmailSession(user.email, user.password);
		return session;
	} catch (error) {
		console.log(error);
		throw new Error('Failed to sign in');
	}
}

// Function to sign out the current user
export async function signOutAccount() {
	try {
		// Delete the current user session
		await account.deleteSession('current');
		return true;
	} catch (error) {
		console.log(error);
		throw new Error('Failed to sign out');
	}
}

// Function to retrieve the currently logged-in user
export async function getCurrentUser() {
	try {
		// Fetch the currently authenticated account
		const currentAccount = await account.get();
		if (!currentAccount) throw new Error('No account found');

		// Retrieve user details from the database based on account ID
		const currentUser = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			[Query.equal('accountId', currentAccount.$id)]
		);

		if (!currentUser) throw new Error('No user found');
		return currentUser.documents[0];
	} catch (error) {
		console.log(error);
		throw new Error('Failed to get current user');
	}
}
