import GridPostList from '../../components/shared/GridPostList'
import Loader from '../../components/shared/Loader'
import { Button } from '../../components/ui/button'
import { useUserContext } from '../../context/AuthContext'
import {
	Route,
	Routes,
	Link,
	Outlet,
	useParams,
	useLocation,
} from 'react-router-dom'
import LikedPosts from './LikedPost'
import FollowersList from '../../components/shared/FollowersList'
import FollowingList from '../../components/shared/FollowingList'
import { useGetUserById } from '../../lib/react-query/queriesAndMutation'
import {
	useGetFollowersCount,
	useGetFollowingCount,
} from '../../lib/react-query/queriesAndMutation'
import {
	useFollowStatus,
	useFollowUser,
	useUnfollowUser,
} from '../../lib/react-query/queriesAndMutation'

interface StabBlockProps {
	value: string | number
	label: string
}

const StatBlock = ({ value, label }: StabBlockProps) => (
	<div className="flex-center gap-2">
		<p className="small-semibold lg:body-bold text-primary-500">{value}</p>
		<p className="small-medium lg:base-medium text-light-2">{label}</p>
	</div>
)

const Profile = () => {
	const { id } = useParams()
	const { user } = useUserContext()
	const { pathname } = useLocation()

	const { data: currentUser } = useGetUserById(id || '')

	// Follow functionality
	const { mutateAsync: followUser, isLoading: isFollowing } = useFollowUser()
	const { mutateAsync: unfollowUser, isLoading: isUnfollowing } =
		useUnfollowUser()
	const { data: isFollowingUser, isLoading: isFollowStatusLoading } =
		useFollowStatus(user.id, currentUser?.$id || '')

	// Follower/following counts
	const { data: followersCount = 0 } = useGetFollowersCount(
		currentUser?.$id || ''
	)
	const { data: followingCount = 0 } = useGetFollowingCount(
		currentUser?.$id || ''
	)

	const handleFollowToggle = async () => {
		if (!user?.id || !currentUser?.$id) return

		try {
			if (isFollowingUser) {
				await unfollowUser({
					followerId: user.id,
					followingId: currentUser.$id,
				})
			} else {
				await followUser({
					followerId: user.id,
					followingId: currentUser.$id,
				})
			}
		} catch (error) {
			console.error('Error toggling follow status:', error)
		}
	}

	if (!currentUser)
		return (
			<div className="flex-center w-full h-full">
				<Loader />
			</div>
		)

	return (
		<div className="profile-container">
			<div className="profile-inner_container">
				<div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
					<img
						src={
							currentUser.imageUrl || '/assets/icons/profile-placeholder.svg'
						}
						alt="profile"
						className="w-20 h-20 lg:h-36 lg:w-36 rounded-full"
					/>
					<div className="flex flex-col flex-1 justify-between md:mt-2">
						<div className="flex flex-col w-full">
							<h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
								{currentUser.name}
							</h1>
							<p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
								@{currentUser.username}
							</p>
						</div>

						<div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
							<Link to={`/profile/${id}`}>
								<StatBlock value={currentUser.posts.length} label="Posts" />
							</Link>
							<Link to={`/profile/${id}/followers`}>
								<StatBlock value={followersCount} label="Followers" />
							</Link>
							<Link to={`/profile/${id}/following`}>
								<StatBlock value={followingCount} label="Following" />
							</Link>
						</div>

						<p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
							{currentUser.bio}
						</p>
					</div>

					<div className="flex justify-center gap-4">
						<div className={`${user.id !== currentUser.$id && 'hidden'}`}>
							<Link
								to={`/update-profile/${currentUser.$id}`}
								className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${
									user.id !== currentUser.$id && 'hidden'
								}`}>
								<img
									src={'/assets/icons/edit.svg'}
									alt="edit"
									width={20}
									height={20}
								/>
								<p className="flex whitespace-nowrap small-medium">
									Edit Profile
								</p>
							</Link>
						</div>
						<div className={`${user.id === id && 'hidden'}`}>
							<Button
								type="button"
								className="shad-button_primary px-8"
								onClick={handleFollowToggle}
								disabled={
									isFollowStatusLoading || isFollowing || isUnfollowing
								}>
								{isFollowingUser ? 'Unfollow' : 'Follow'}
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div className="flex flex-wrap sm:flex-row max-w-5xl w-full">
				<Link
					to={`/profile/${id}`}
					className={`profile-tab sm:rounded-l-lg ${
						pathname === `/profile/${id}` && '!bg-dark-3'
					}`}>
					<div className="flex items-center">
						<img
							src={'/assets/icons/posts.svg'}
							alt="posts"
							width={20}
							height={20}
							className="mr-2"
						/>
						<span className="text-sm">Posts</span>
					</div>
				</Link>
				<Link
					to={`/profile/${id}/followers`}
					className={`profile-tab ${
						pathname === `/profile/${id}/followers` && '!bg-dark-3'
					}`}>
					<div className="flex items-center">
						<svg
							className="w-5 h-5 text-primary-500 dark:text-white mr-2"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24">
							<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeWidth="2"
								d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3.05A2.5 2.5 0 1 1 9 5.5M19.5 17h.5a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-1m0-3.05a2.5 2.5 0 1 0-2-4.45m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3 1 1 0 0 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
							/>
						</svg>
						<span className="text-sm">Followers</span>
					</div>
				</Link>
				<Link
					to={`/profile/${id}/following`}
					className={`profile-tab ${
						pathname === `/profile/${id}/following` && '!bg-dark-3'
					}`}>
					<div className="flex items-center">
						<svg
							className="w-5 h-5 text-primary-500 dark:text-white mr-2"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24">
							<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
						</svg>
						<span className="text-sm">Following</span>
					</div>
				</Link>
				{currentUser.$id === user.id && (
					<Link
						to={`/profile/${id}/liked-posts`}
						className={`profile-tab sm:rounded-r-lg ${
							pathname === `/profile/${id}/liked-posts` && '!bg-dark-3'
						}`}>
						<div className="flex items-center">
							<img
								src={'/assets/icons/like.svg'}
								alt="like"
								width={20}
								height={20}
								className="mr-2"
							/>
							<span className="text-sm">Liked Posts</span>
						</div>
					</Link>
				)}
			</div>

			<Routes>
				<Route
					index
					element={<GridPostList posts={currentUser.posts} showUser={false} />}
				/>
				<Route
					path="/followers"
					element={<FollowersList userId={currentUser.$id} />}
				/>
				<Route
					path="/following"
					element={<FollowingList userId={currentUser.$id} />}
				/>
				{currentUser.$id === user.id && (
					<Route path="/liked-posts" element={<LikedPosts />} />
				)}
			</Routes>
			<Outlet />
		</div>
	)
}

export default Profile