import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useSignOutAccount } from '../../lib/react-query/queriesAndMutation'
import { useUserContext } from '../../context/AuthContext'

const TopBar = () => {
  const { user } = useUserContext()
  const { mutate: signOut, isSuccess } = useSignOutAccount()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSuccess) navigate(0)
  }, [isSuccess])


  return (
    <section className='topbar'>
      <div className="flex-between py-4 px-5">
        <Link to="/" className='flex gap-3 items-center'>
        <h3 className="flex text-4xl font-bold">
					<p className="text-primary-500 mr-1">@</p>
					<span>Yu</span>Soc<span className="text-primary-500">ial</span>
				</h3>
        </Link>

        <div className="flex">
          <Button variant='ghost' className='shad-button_ghost' onClick={() => signOut()}>
            <img src='/assets/icons/logout.svg' alt='logout' />
          </Button>
          <Link to={`/profile/${user?.id}`} className='flex-center gap-4'>
            <img src={ user.imageUrl || '/assets/images/profile-placeholder.svg'} alt='user profile' className='h-8 w-8 rounded-full'/>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default TopBar