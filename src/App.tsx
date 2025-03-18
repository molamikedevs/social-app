import { Toaster } from "../src/components/ui/sonner"
import AuthLayout from './_auth/AuthLayout'
import SigninForm from './_auth/forms/SigninForm'
import SignupForm from './_auth/forms/SignupForm'
import {
	Home,
	Explore,
	Saved,
	AllUsers,
	CreatePost,
	EditPost,
	PostDetails,
	Profile,
	UpdateProfile,
	LikedPost,
} from './_root'
import RootLayout from './_root/RootLayout'
import './globals.css'
import { Routes, Route } from 'react-router-dom'

const App = () => {
	return (
		<main className="flex h-screen">
			{/* Public routes */}
			<Routes>
				<Route element={<AuthLayout />}>
					<Route path="/sign-in" element={<SigninForm />} />
					<Route path="/sign-up" element={<SignupForm />} />
				</Route>

				{/* Private routes */}
				<Route element={<RootLayout />}>
					<Route index element={<Home />} />
					<Route path="/explore" element={<Explore />} />
					<Route path="/saved" element={<Saved />} />
					<Route path="/all-users" element={<AllUsers />} />
					<Route path="/create-post" element={<CreatePost />} />
					<Route path="/update-post/:id" element={<EditPost />} />
					<Route path="/posts/:id" element={<PostDetails />} />
					<Route path="/profile/:id/*" element={<Profile />} />
					<Route path="/update-profile/:id" element={<UpdateProfile />} />
					<Route path="/liked-post" element={<LikedPost />} />
				</Route>
			</Routes>

			<Toaster />
		</main>
	)
}

export default App
