import NotificationToggle from './NotificationToggle'

const MobileNotificationToggle = () => {
	return (
		<div className="fixed bottom-24 right-4 z-50 md:hidden">
			<div className="relative">
				<NotificationToggle position="mobile" />
			</div>
		</div>
	)
}

export default MobileNotificationToggle
