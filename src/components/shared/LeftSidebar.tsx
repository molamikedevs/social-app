import { useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useSignOutAccount } from '../../lib/react-query/queriesAndMutation'
import { useUserContext } from '../../context/AuthContext'
import { sidebarLinks } from '../../constants'

const LeftSidebar = () => {
	const { user } = useUserContext()
	const { pathname } = useLocation()
	const { mutate: signOut, isSuccess } = useSignOutAccount()
	const navigate = useNavigate()

	useEffect(() => {
		if (isSuccess) navigate(0)
	}, [isSuccess])
	return (
		<nav className="leftSide-bar">
			<div className="flex flex-col gap-11">
				<Link to="/" className="flex gap-3 items-center">
					<h3 className="flex text-3xl font-bold">
						<p className="text-primary-500 mr-1">@</p>
						<span>Yu</span>Soc<span className="text-primary-500">ial</span>
					</h3>
				</Link>

				<Link to={`/profile/${user?.id}`} className="flex-center gap-3">
					<img
						src={user.imageUrl || '/assets/images/avatar.svg'}
						alt="user profile"
						className="h-10 w-10 rounded-full"
					/>
					<div className="flex flex-col">
						<p className="body-bold">{user.name}</p>
						<p className="small-regular text-light-3">@${user.email}</p>
					</div>
				</Link>

				<ul className="flex flex-col gap-6">
					{sidebarLinks.map(navItem => {
						const isActive = pathname === navItem.route
						return (
							<li
								key={navItem.label}
								className={`leftSide-bar-link group ${isActive && 'bg-primary-500'}`}>
								<NavLink
									className="flex gap-4 items-center p-4"
									to={navItem.route}>
									<img
										src={navItem.imgURL}
										alt={navItem.label}
										className={`group-hover:invert-white ${isActive && 'invert-white'}`}
									/>
									{navItem.label}
								</NavLink>
							</li>
						)
					})}
				</ul>
			</div>
			<Button
				variant="ghost"
				className="shad-button_ghost"
				onClick={() => signOut()}>
				<img src="/assets/icons/logout.svg" alt="logout" />
				<div className="small-medium lg:base-medium">Logout</div>
			</Button>
		</nav>
	)
}

export default LeftSidebar
