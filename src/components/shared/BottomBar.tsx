import { bottomBarLinks } from "../../constants";
import { Link, useLocation } from "react-router-dom";


const BottomBar = () => {
  const { pathname } = useLocation();

  return (
    <section className="bottom-bar">
    {bottomBarLinks.map(navItem => {
                const isActive = pathname === navItem.route
                return (
                    <Link to={navItem.route} key={navItem.label}
                    className={`${isActive && 'bg-primary-500 rounded-[10px]'} flex flex-center flex-col gap-1 p-2 transition duration-300`}>
                      <img
                        src={navItem.imgURL}
                        alt={navItem.label}
                        width={18}
                        height={18}
                        className={`${isActive && 'invert-white'}`}
                      />
                      <p className="tiny-medium text-light-2">{navItem.label}</p>
                    </Link>
                  
                )
              })}
    </section>
  )
}

export default BottomBar
