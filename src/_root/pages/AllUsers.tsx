import UserCard from '../../components/shared/UserCard'
import Loader from '../../components/shared/Loader'
import { useGetUsers } from '../../lib/react-query/queriesAndMutation'
import { toast } from 'sonner'

const AllUsers = () => {
	const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers()

	if (isErrorCreators) {
		toast('Something went wrong.')

		return
	}

	return (
		<div className="common-container">
			<div className="user-container">
				<h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
				{isLoading && !creators ? (
					<Loader />
				) : (
					<ul className="user-grid">
						{creators?.documents.map(creator => (
							<li key={creator?.$id} className="flex-1 min-w-[200px] w-full  ">
								<UserCard user={creator} />
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	)
}

export default AllUsers
