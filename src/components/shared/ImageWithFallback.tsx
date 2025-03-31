import { useState } from 'react'

interface ImageWithFallbackProps {
	src: string
	fallbackSrc: string
	alt: string
	className?: string
}

const ImageWithFallback = ({
	src,
	fallbackSrc,
	alt,
	className,
}: ImageWithFallbackProps) => {
	const [imgSrc, setImgSrc] = useState(src)

	return (
		<img
			src={imgSrc}
			alt={alt}
			className={className}
			onError={() => setImgSrc(fallbackSrc)}
		/>
	)
}

export default ImageWithFallback
