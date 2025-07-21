'use client'

import {Tv2Icon , Wand2Icon , GiftIcon , SendIcon ,Settings2Icon , LayoutDashboardIcon , ArmchairIcon , ScanFaceIcon , WandIcon , ListCheckIcon , CalculatorIcon , DatabaseIcon } from "lucide-react"
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Profile } from './profile'
import { useTranslation } from '@/hooks/useTranslation'

export default function NavBar() {
  const router = useRouter()
  const { t } = useTranslation()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <nav className="bg-[#e9a9a9] px-6 py-4 flex items-center justify-between shadow-md nav-container force-ltr">
      <div className="flex items-center force-ltr">
        <Image 
          src="/img/logo.webp" 
          alt="Logo" 
          width={50} 
          height={50} 
          className="cursor-pointer"
          onClick={() => handleNavigation('/')}
        />
      </div>

      <div className="flex items-center space-x-6 force-ltr">
        <div className="flex justify-start items-center space-x-15 pr-10 nav-items force-ltr">

        <button 
          onClick={() => handleNavigation('/avatar')}
          className="flex items-center space-x-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 hover:shadow-lg transition-all ui-element"
          title={t('navigation.avatar')}
        >
          <Tv2Icon size={20} />
          <WandIcon size={20} />
        </button>

        <button 
          onClick={() => handleNavigation('/gift')}
          className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 hover:shadow-lg transition-all ui-element"
          title={t('navigation.gift')}
        >
          <GiftIcon size={20} />
        </button>

        <button 
          onClick={() => handleNavigation('/rsvp')}
          className="flex items-center space-x-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 hover:shadow-lg transition-all ui-element"
          title={t('navigation.rsvp')}
        >
          <SendIcon size={20} />
          <Settings2Icon size={20} />
        </button>
        
        <button 
          onClick={() => handleNavigation('/faceRecognition')}
          className="flex items-center space-x-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 hover:shadow-lg transition-all ui-element"
          title={t('navigation.faceRecognition')}
        >
          <ScanFaceIcon size={20} />
          <Wand2Icon size={20} />
        </button>

        <button 
          onClick={() => handleNavigation('/planner')}
          className="flex items-center space-x-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 hover:shadow-lg transition-all ui-element"
          title={t('navigation.planner')}
        >
          <LayoutDashboardIcon size={20} />
          <ArmchairIcon size={20} />
        </button>

        <button 
          onClick={() => handleNavigation('/checkList')}
          className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 hover:shadow-lg transition-all ui-element"
          title={t('navigation.checkList')}
        >
          <ListCheckIcon size={20} />
        </button>

        <button 
          onClick={() => handleNavigation('/calculator')}
          className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 hover:shadow-lg transition-all ui-element"
          title={t('navigation.calculator')}
        >
          <CalculatorIcon size={20} />
        </button>

        <button 
          onClick={() => handleNavigation('/dataManager')}
          className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 hover:shadow-lg transition-all ui-element"
          title={t('navigation.dataManager', 'Data Manager')}
        >
          <DatabaseIcon size={20} />
        </button>
        </div>
        <div className="pr-6 -mt-1 force-ltr">
        <Profile />
      </div>
      </div> 
    </nav>
  )
}