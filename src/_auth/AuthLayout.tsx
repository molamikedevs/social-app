import { Outlet, Navigate } from "react-router-dom"

const AuthLayout = () => {
  const isAuthenticated = false;

  return (
    <>
    {isAuthenticated ? (
      <Navigate to='/' />
    ) : (
      <>
      <section className="flex flex-1 justify-center items-center flex-col py-10">
        <Outlet />
      </section>

      <div className="h-screen w-1/2 hidden xl:block bg-gradient-to-r from-dark-2 via-dark-1 to-dark-2" />
      </>
    )}
    </>
  )
}

export default AuthLayout