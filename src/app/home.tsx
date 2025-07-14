'use client'

import { RotatingText } from '@/components/animate-ui/text/rotating'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'

export default function Home() {
  const { t, isRTL } = useTranslation()

  return (
    <div className="absolute inset-0 w-full h-full force-ltr">
      <Image
        src="/img/home_background.jpg"
        alt="Wedding background"
        fill
        style={{ objectFit: 'cover', transform: 'scaleX(-1)' }}
        quality={100}
        priority
        className="z-0"
      />
      <div className="absolute inset-0 flex items-center justify-start pl-32 pb-[30%] force-ltr">
        <div className={`text-content ${isRTL ? 'font-hebrew' : ''}`}>
          <RotatingText 
            text={[t('home.title'), t('home.subtitle')]} 
            containerClassName={`text-black text-4xl ${isRTL ? 'font-hebrew' : ''}`}
            duration={4200} 
            transition={{ duration: 0.8, ease: "easeOut" }} 
          />
        </div>
      </div>
    </div>
  )
}
