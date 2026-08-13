'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/components/layout/theme-provider'

interface ThemedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string
}

/** 
 * Theme-aware image. For SVG sources ending in .svg, it automatically 
 * tries a -dark variant when the theme is 'dark'. Renders light variant
 * on server and first client render to avoid hydration mismatch.
 */
export function ThemedImage({ src, alt, style, ...props }: ThemedImageProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted pattern for hydration safety
    setMounted(true)
  }, [])

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
    margin: '2rem 0',
    ...style,
  }

  const resolvedSrc = mounted &&
    typeof src === 'string' &&
    src.endsWith('.svg') &&
    theme === 'dark'
      ? src.replace(/\.svg$/, '-dark.svg')
      : src

  return (
    <img
      alt={alt ?? ''}
      src={resolvedSrc}
      style={imgStyle}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}
