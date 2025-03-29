import { Models } from 'appwrite'
import Loader from './Loader'
import UserCard from './UserCard'
import { useGetFollowingList } from '../../lib/react-query/queriesAndMutation'

type FollowingListProps = {
  userId: string
}

const FollowingList = ({ userId }: FollowingListProps) => {
  const { data: following, isLoading, isError } = useGetFollowingList(userId)

  if (isLoading) return <Loader />

  if (isError) return <div className="text-light-4">Failed to load following</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {following?.map((user: Models.Document) => (
        <UserCard key={user.$id} user={user} />
      ))}
    </div>
  )
}

export default FollowingList