export enum QUERY_KEYS {
	// AUTH KEYS
	CREATE_USER_ACCOUNT = 'createUserAccount',

	// USER KEYS
	GET_CURRENT_USER = 'getCurrentUser',
	GET_USERS = 'getUsers',
	GET_USER_BY_ID = 'getUserById',

	// POST KEYS
	GET_POSTS = 'getPosts',
	GET_INFINITE_POSTS = 'getInfinitePosts',
	GET_RECENT_POSTS = 'getRecentPosts',
	GET_POST_BY_ID = 'getPostById',
	GET_USER_POSTS = 'getUserPosts',
	GET_FILE_PREVIEW = 'getFilePreview',

	//  SEARCH KEYS
	SEARCH_POSTS = 'getSearchPosts',

	// FOLLOW AND UNFOLLOW
	GET_FOLLOW_STATUS = 'isFollowing',
	GET_FOLLOWERS_COUNT = 'getFollowersCount',
	GET_FOLLOWING_COUNT = 'getFollowingCount',
	GET_FOLLOWERS_LIST = 'getFollowingList',
	GET_FOLLOWING_LIST = 'getFollowersList',

	// NOTIFICATION KEYS
	GET_NOTIFICATIONS = 'notifications',

	// COMMENT KEYS
	GET_POST_COMMENTS = 'getPostComments',
	GET_USER_COMMENTS = 'getUserComments',
	GET_COMMENT_BY_ID = 'getCommentById',

	// MESSAGE KEYS
	GET_MESSAGE_THREADS = 'getMessageThreads',
	GET_MESSAGE_THREAD_BY_ID = 'getMessageThreadById',
}
