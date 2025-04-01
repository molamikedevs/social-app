declare module 'react-lazy-load-image-component' {
	import { ComponentType, ImgHTMLAttributes } from 'react'

	interface LazyLoadImageProps extends ImgHTMLAttributes<HTMLImageElement> {
		effect?: string
		placeholderSrc?: string
		visibleByDefault?: boolean
		wrapperClassName?: string
		wrapperProps?: object
		beforeLoad?: () => void
		afterLoad?: () => void
		delayTime?: number
		threshold?: number
		useIntersectionObserver?: boolean
		scrollPosition?: object
	}

	const LazyLoadImage: ComponentType<LazyLoadImageProps>
	export { LazyLoadImage }
	export default LazyLoadImage
}
