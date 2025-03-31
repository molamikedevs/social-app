import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
import { useSignInAccount } from '../../lib/react-query/queriesAndMutation'
import { useUserContext } from '../../context/AuthContext'
import { signinValidation } from '../../lib/validation'

const SigninForm = () => {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { mutateAsync: signInAccount } = useSignInAccount()
	const { checkAuthUser, isLoading: isUserLoading } = useUserContext()
	const navigate = useNavigate()

	const form = useForm<z.infer<typeof signinValidation>>({
		resolver: zodResolver(signinValidation),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit = async (values: z.infer<typeof signinValidation>) => {
		setIsSubmitting(true)
		try {
			const isLoggedIn = await checkAuthUser()

			if (isLoggedIn) {
				toast.info('You are already logged in!')
				navigate('/')
				return
			}

			const session = await signInAccount({
				email: values.email,
				password: values.password,
			})

			if (!session) {
				toast.error('Sign in failed. Please try again.')
				return
			}

			const updatedIsLoggedIn = await checkAuthUser()
			if (updatedIsLoggedIn) {
				form.reset()
				navigate('/')
			} else {
				toast.error('Sign in failed. Please try again.')
			}
		} finally {
			setIsSubmitting(false)
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
					Log in to your account
				</h2>
				<p className="text-light-3 small-medium md:base-regular mt-2">
					Welcome back! Please enter your details.
				</p>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-5 w-full mt-4">
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
					<Button
						type="submit"
						className="shad-button_primary"
						disabled={isSubmitting || isUserLoading}>
						{isSubmitting || isUserLoading ? (
							<div className="flex-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
							</div>
						) : (
							'Sign In'
						)}
					</Button>

					<p className="text-light-2 text-small-regular mt-2">
						Don't have an account?{' '}
						<Link
							to="/sign-up"
							className="text-primary-500 text-small-semibold ml-1">
							Sign Up
						</Link>
					</p>
				</form>
			</div>
		</Form>
	)
}

export default SigninForm