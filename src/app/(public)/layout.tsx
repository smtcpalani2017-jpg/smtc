import { LanguageProvider } from '@/context/LanguageContext'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      {children}
      <WhatsAppButton />
    </LanguageProvider>
  )
}

