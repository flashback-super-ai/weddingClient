'use client';
 
import {
  CreditCard,
  PersonStanding,
  LogOut,
  Settings,
  User,
  Languages,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/radix/dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';
 
export const Profile = () => {
  const { t, locale, changeLanguage } = useTranslation()
  const router = useRouter()

  const handleLanguageChange = async () => {
    const newLocale = locale === 'he' ? 'en' : 'he'
    await changeLanguage(newLocale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ui-element force-ltr"
          >
            <PersonStanding />
          </motion.button>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-47 force-ltr">
        <DropdownMenuLabel className="text-content">{t('profile.myAccount')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="force-ltr">
            <User />
            <span className="text-content">{t('profile.profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="force-ltr">
            <CreditCard />
            <span className="text-content">{t('profile.billing')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="force-ltr">
            <Settings />
            <span className="text-content">{t('profile.settings')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLanguageChange} className="force-ltr">
          <Languages />
          <span className="text-content">
            {t('language.switchTo')} {locale === 'he' ? t('language.english') : t('language.hebrew')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem className="force-ltr">
          <LogOut />
          <span className="text-content">{t('profile.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};