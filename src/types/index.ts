import { Models } from 'appwrite'

export type INavLink = {
	imgURL: string
	route: string
	label: string
}

export type IUpdateUser = {
	userId: string
	name: string
	bio: string
	imageId: string
	imageUrl: URL | string
	file: File[]
}

export type IContextType = {
	user: IUser
	isAuthenticated: boolean
	isLoading: boolean
	setUser: React.Dispatch<React.SetStateAction<IUser>>
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
	checkAuthUser: () => Promise<boolean>
}

export type INewPost = {
	userId: string
	caption: string
	file: File[]
	location?: string
	tags?: string
}

export type IUpdatePost = {
	postId: string
	caption: string
	imageId: string
	imageUrl: URL
	file: File[]
	location?: string
	tags?: string
}

export type IUser = {
	id: string
	name: string
	username: string
	email: string
	imageUrl: string
	bio: string
}

export type INewUser = {
	name: string
	email: string
	username: string
	password: string
}

// types.ts (or your types file)
export type NotificationType = 'follow' | 'like'

export interface CreateNotificationParams {
	userId: string
	senderId: string
	type: NotificationType
	postId?: string
}

export type CommentWithUser = Models.Document & {
	user: Models.Document
}
