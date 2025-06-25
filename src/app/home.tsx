import { RotatingText } from '@/components/animate-ui/text/rotating'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Image
        src="/img/home_background.jpg"
        alt="Wedding background"
        fill
        style={{ objectFit: 'cover', transform: 'scaleX(-1)' }}
        quality={100}
        priority
        className="z-0"
      />
      <div className="absolute inset-0 flex items-center justify-start pl-32 pb-[30%] ">
        <RotatingText text={['The most beautiful memories', 'powered by smart technology.']} containerClassName='text-black text-4xl font-hebrew' duration={4200} transition={{ duration: 0.8, ease: "easeOut" }} />
      </div>
    </div>
  )
}
