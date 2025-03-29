import { Models } from 'appwrite'
import Loader from './Loader'
import UserCard from './UserCard'
import { useGetFollowersList } from '../../lib/react-query/queriesAndMutation'

type FollowersListProps = {
	userId: string
}

const FollowersList = ({ userId }: FollowersListProps) => {
	const { data: followers, isLoading, isError } = useGetFollowersList(userId)

	if (isLoading) return <Loader />

	if (isError)
		return <div className="text-light-4">Failed to load followers</div>

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
			{followers?.map((user: Models.Document) => (
				<UserCard key={user.$id} user={user} />
			))}
		</div>
	)
}

export default FollowersList

