import { Button } from '../ui/button'

type ConfirmModalProps = {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title: string
	description: string
	confirmText?: string
	cancelText?: string
}

const ConfirmModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
}: ConfirmModalProps) => {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-dark-3 rounded-lg p-6 w-full max-w-md border border-dark-4">
				<h3 className="text-light-1 text-lg font-semibold mb-2">{title}</h3>
				<p className="text-light-3 text-sm mb-6">{description}</p>

				<div className="flex justify-end gap-3">
					<Button
						type="button"
						variant="ghost"
						className="shad-button_dark_4"
						onClick={onClose}>
						{cancelText}
					</Button>
					<Button
						type="button"
						className="shad-button_primary whitespace-nowrap"
						onClick={() => {
							onConfirm()
							onClose()
						}}>
						{confirmText}
					</Button>
				</div>
			</div>
		</div>
	)
}

export default ConfirmModal
