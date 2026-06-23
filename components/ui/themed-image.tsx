'use client'

import { useTheme } from '@/components/layout/theme-provider'

interface ThemedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string
}

/** 
 * Theme-aware image. For SVG sources ending in .svg, it automatically 
 * tries a -dark variant when the theme is 'dark'. Falls back gracefully.
 */
export function ThemedImage({ src, alt, style, ...props }: ThemedImageProps) {
  const { theme } = useTheme()

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
    margin: '2rem 0',
    ...style,
  }

  if (typeof src === 'string' && src.endsWith('.svg') && theme === 'dark') {
    const darkSrc = src.replace(/\.svg$/, '-dark.svg')
    return (
      <img
        alt={alt ?? ''}
        src={darkSrc}
        style={imgStyle}
        {...props}
      />
    )
  }

  return (
    <img
      alt={alt ?? ''}
      src={src}
      style={imgStyle}
      {...props}
    />
  )
}
