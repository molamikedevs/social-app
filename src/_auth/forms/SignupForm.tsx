import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../../components/ui/form'
import { Button } from '../../components/ui/button'
import { toast } from 'sonner'
import { Input } from '../../components/ui/input'
import Loader from '../../components/shared/Loader'
import {
	useCreateUserAccount,
	useSignInAccount,
} from '../../lib/react-query/queriesAndMutation'
import { useUserContext } from '../../context/AuthContext'
import { signupValidation } from '../../lib/validation'

const SignupForm = () => {
	const navigate = useNavigate()
	const { checkAuthUser } = useUserContext()
	const { mutateAsync: signInAccount } = useSignInAccount()
	const { mutateAsync: createUserAccount, isLoading: isCreatingUser } =
		useCreateUserAccount()

	const form = useForm<z.infer<typeof signupValidation>>({
		resolver: zodResolver(signupValidation), // Apply Zod validation schema
		defaultValues: {
			name: '', // Default empty value for the name field
			username: '', // Default empty value for the username field
			email: '', // Default empty value for the email field
			password: '', // Default empty value for the password field
		},
	})

	//Submit handler.
	const onSubmit = async (values: z.infer<typeof signupValidation>) => {
		const newUser = await createUserAccount(values)
		if (!newUser) {
			toast.error('Sign up failed. Please try again.')
		}

		const session = await signInAccount({
			email: values.email,
			password: values.password,
		})

		if (!session) {
			toast.error('Sign in failed. Please try again.')
		}

		const isLoggedIn = await checkAuthUser()
		if (isLoggedIn) {
			form.reset()
			navigate('/')
		} else {
			toast.error('Sign in failed. Please try again.')
		}
	}

	return (
		<Form {...form}>
			<div className="flex-center sm:w-420 flex-col">
				<h3 className="flex text-4xl font-bold">
					<p className="text-primary-500 mr-1">@</p>
					<span>Yu</span>Soc<span className="text-primary-500">ial</span>
				</h3>

				<h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
					Create a new account
				</h2>
				<p className="text-light-3 small-medium md:base-regular mt-2">
					Enter your details to use yusocial
				</p>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-5 w-full mt-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input type="text" className="shad-input" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input type="text" className="shad-input" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" className="shad-input" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" className="shad-input" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="shad-button_primary">
						{isCreatingUser ? (
							<div className="flex-center gap-2">
								<Loader />
							</div>
						) : (
							'Sign Up'
						)}
					</Button>

					<p className="text-light-2 text-small-regular mt-2">
						Already have an account?{' '}
						<Link
							to="/sign-in"
							className="text-primary-500 text-small-semibold ml-1">
							Sign in
						</Link>
					</p>
				</form>
			</div>
		</Form>
	)
}

export default SignupForm
