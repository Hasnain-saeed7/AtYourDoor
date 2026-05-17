"use client"

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

type WorkerAvatarProps = {
  src?: string | null
  alt?: string
  className?: string
  fallbackSrc?: string
}

export default function WorkerAvatar({
  src,
  alt,
  className,
  fallbackSrc = '/default-avatar.svg',
}: WorkerAvatarProps) {
  const { t } = useLanguage()
  const normalizeSrc = (value?: string | null) => {
    if (!value) return ''
    return value.replace(/^http:\/\//i, 'https://')
  }

  const [imageSrc, setImageSrc] = useState(normalizeSrc(src) || fallbackSrc)

  useEffect(() => {
    setImageSrc(normalizeSrc(src) || fallbackSrc)
  }, [src, fallbackSrc])

  return (
    <img
      src={imageSrc}
      alt={alt || t('workerAvatar')}
      className={className}
      loading="lazy"
      onError={() => {
        if (imageSrc !== fallbackSrc) setImageSrc(fallbackSrc)
      }}
    />
  )
}
