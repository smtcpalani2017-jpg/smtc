'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ta'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.courses': 'Courses',
    'nav.results': 'Results',
    'nav.faculty': 'Faculty',
    'nav.contact': 'Contact',
    'nav.gallery': 'Gallery',
    'nav.login': 'LOGIN',

    // Hero
    'hero.badge': 'Excellence in Education Since 2017',
    'hero.title1': 'Empowering Minds,',
    'hero.title2': 'Achieving Greatness',
    'hero.desc': "Sri Murugan Tuition Center (SMTC) is Palani's Number 1 institution for school coaching. We provide expert tuition for 6th to 12th Standard (All Subjects) and specialized Spoken English classes.",
    'hero.view_courses': 'View Our Courses',
    'hero.enquiry': 'Admission Enquiry',

    // Stats
    'stats.students': 'Total Students',
    'stats.years': 'Years of Excellence',
    'stats.pass': 'Pass Percentage',
    'stats.toppers': 'Academic Toppers',

    // About Page
    'about.story_title': 'The SMTC Story',
    'about.story_p1': 'Founded in 2017, Sri Murugan Tuition Center (SMTC) was born out of a passion for simplifying complex academic concepts in Palani. We believe in understanding the "why" behind every concept.',
    'about.story_p2': 'We have evolved into a premier academic powerhouse, guiding thousands of students to achieve their dreams in board exams and beyond.',
    'about.story_p3': 'Our core values remain: Personalized Attention, Rigorous Discipline, and Unwavering Commitment to Student Success.',
    'about.trust': 'Years of Trust',
    'about.alumni': 'Alumni Network',
    'about.expert_faculty': 'Expert Faculty',
    'about.pass_rate': 'Pass Rate',
    'about.mission': 'Our Mission',
    'about.mission_desc': 'To provide affordable, high-quality education through innovative teaching methods and individual mentorship.',
    'about.vision': 'Our Vision',
    'about.vision_desc': 'Nurturing future leaders through quality education.',
    'about.values': 'Our Values',
    'about.values_desc': 'Integrity, dedication, and student-first approach.',
    'about.quote': '"Excellence in teaching, integrity in mentorship, and success in results."',

    // Courses Page
    'courses.banner_title': 'Academic Programs',
    'courses.banner_sub': 'Comprehensive Coaching for 6th to 12th Standard',
    'courses.all_subjects': 'All Subjects Covered',
    'courses.enquiry_title': 'Ready to Join?',
    'courses.enquiry_desc': "Take the first step towards academic excellence with Palani's most trusted tuition center.",

    // Courses Details
    'course1.title': 'Secondary Foundation',
    'course1.desc': 'Comprehensive coaching for students from 6th to 10th standard. Building strong fundamentals in Science and Mathematics.',
    'course1.target': '6th - 10th Standard',
    'course2.title': 'Higher Secondary Maths',
    'course2.desc': 'Integrated coaching for 11th & 12th Maths stream. Includes rigorous training for Board exams.',
    'course2.target': '11th & 12th Maths',
    'course3.title': 'Higher Secondary Arts',
    'course3.desc': 'Expert guidance for 11th & 12th Arts stream students. Focus on Economics, Commerce, and Accountancy excellence.',
    'course3.target': '11th & 12th Arts',
    'course4.title': 'Spoken English Mastery',
    'course4.desc': 'Professional communication skills and English language proficiency training for students and professionals.',
    'course4.target': 'Open for All',
    'course.duration': 'Full Academic Year',
    'course.duration_short': '3 - 6 Months',

    // Results Page
    'results.banner_title': 'Hall of Fame',
    'results.banner_sub': 'Celebrating Our Academic Superstars',
    'results.achievements': 'Achievements',
    'results.title': 'Proven Excellence',
    'results.desc': 'From 6th Standard to Board Exams, our students consistently achieve top marks across all subjects.',

    // Faculty Page
    'faculty.banner_title': 'Our Mentors',
    'faculty.banner_sub': 'The Architects of Your Future',
    'faculty.title': 'The Academic Board',
    'faculty.desc': 'Guided by experience, driven by passion. Meet the mentors who shape future achievers.',

    // Contact Page
    'contact.banner_title': 'Get In Touch',
    'contact.banner_sub': 'Start Your Academic Journey Today',
    'contact.form_title': 'Admission Enquiry',
    'contact.student_name': 'Student Name',
    'contact.parent_name': 'Parent Name',
    'contact.phone': 'Phone Number',
    'contact.grade': 'Grade / Class',
    'contact.message': 'Message / Requirements',
    'contact.submit': 'Submit Enquiry',
    'contact.info_title': 'Contact Information',
    'contact.campus': 'Our Campus',
    'contact.call': 'Call Us',
    'contact.email': 'Email Us',
    'contact.hours': 'Office Hours',

    // Common
    'common.loading': 'Loading...',
    'common.soon': 'Coming soon...',
    'common.learn_more': 'Learn More About SMTC',
    'common.enquiry': 'Enquiry Now',
  },
  ta: {
    // Navbar
    'nav.home': 'முகப்பு',
    'nav.about': 'பற்றி',
    'nav.courses': 'பாடங்கள்',
    'nav.results': 'முடிவுகள்',
    'nav.faculty': 'ஆசிரியர்கள்',
    'nav.contact': 'தொடர்புக்கு',
    'nav.gallery': 'புகைப்படங்கள்',
    'nav.login': 'உள்நுழைய',

    // Hero
    'hero.badge': '2017 முதல் சிறந்த கல்விப் பணி',
    'hero.title1': 'அறிவை வளர்ப்போம்,',
    'hero.title2': 'வெற்றியை அடைவோம்',
    'hero.desc': 'ஸ்ரீ முருகன் டியூஷன் சென்டர் (SMTC) பழனியின் முதன்மையான பள்ளி பயிற்சி நிறுவனமாகும். 6 முதல் 12-ம் வகுப்பு வரை (அனைத்து பாடங்களும்) மற்றும் சிறப்பு ஸ்போக்கன் இங்கிலீஷ் வகுப்புகளை நாங்கள் சிறந்த முறையில் நடத்துகிறோம்.',
    'hero.view_courses': 'பாடங்களை பார்க்க',
    'hero.enquiry': 'சேர்க்கை விசாரணை',

    // Stats
    'stats.students': 'மொத்த மாணவர்கள்',
    'stats.years': 'சிறந்த அனுபவம்',
    'stats.pass': 'தேர்ச்சி விகிதம்',
    'stats.toppers': 'சிறந்த மாணவர்கள்',

    // About
    'about.since': '2017 முதல்',
    'about.title': 'SMTC பற்றி',
    'about.quote': '"சிறந்த கற்பித்தல், நேர்மையான வழிகாட்டுதல் மற்றும் வெற்றிகரமான முடிவுகள்."',
    'about.desc': 'ஸ்ரீ முருகன் டியூஷன் சென்டர் (SMTC) பழனியில் 9 ஆண்டுகளுக்கும் மேலாக சிறந்த கல்விப் பணியாற்றி வருகிறது. 6 முதல் 12-ம் வகுப்பு வரை அனைத்து பாடங்களுக்கும் விரிவான பயிற்சி மற்றும் மாணவர்களின் தன்னம்பிக்கையை வளர்க்க ஸ்போக்கன் இங்கிலீஷ் வகுப்புகளை நாங்கள் வழங்குகிறோம்.',
    'about.vision': 'எங்கள் நோக்கம்',
    'about.vision_desc': 'தரமான கல்வி மூலம் எதிர்கால தலைவர்களை உருவாக்குதல்.',
    'about.values': 'எங்கள் மதிப்புகள்',
    'about.values_desc': 'நேர்மை, அர்ப்பணிப்பு மற்றும் மாணவர் நலன்.',

    // About Page
    'about.story_title': 'SMTC-யின் கதை',
    'about.story_p1': '2017-ல் தொடங்கப்பட்ட ஸ்ரீ முருகன் டியூஷன் சென்டர் (SMTC), பழனியில் கடினமான பாடங்களை எளிமையாகக் கற்பிக்க வேண்டும் என்ற ஆர்வத்தில் உருவாக்கப்பட்டது. ஒவ்வொரு பாடத்தையும் புரிந்து படிப்பதே எங்கள் நோக்கம்.',
    'about.story_p2': 'நாங்கள் இன்று ஒரு முதன்மையான கல்வி நிறுவனமாக வளர்ந்துள்ளோம், ஆயிரக்கணக்கான மாணவர்கள் தங்கள் பொதுத்தேர்வுகளில் சாதனை படைக்க வழிகாட்டியுள்ளோம்.',
    'about.story_p3': 'தனிப்பட்ட கவனம், கடுமையான ஒழுக்கம் மற்றும் மாணவர்களின் வெற்றிக்கு அர்ப்பணிப்பு - இவை தான் எங்கள் பலம்.',
    'about.trust': 'ஆண்டு கால நம்பிக்கை',
    'about.alumni': 'பழைய மாணவர்கள்',
    'about.expert_faculty': 'சிறந்த ஆசிரியர்கள்',
    'about.pass_rate': 'தேர்ச்சி விகிதம்',
    'about.mission': 'எங்கள் பணி',
    'about.mission_desc': 'புதுமையான கற்பித்தல் முறைகள் மற்றும் தனிப்பட்ட வழிகாட்டுதல் மூலம் மலிவான, உயர்தர கல்வியை வழங்குதல்.',

    // Courses Page
    'courses.banner_title': 'கல்வித் திட்டங்கள்',
    'courses.banner_sub': '6 முதல் 12-ம் வகுப்பு வரை விரிவான பயிற்சி',
    'courses.all_subjects': 'அனைத்து பாடங்களும் கற்பிக்கப்படும்',
    'courses.enquiry_title': 'சேர தயாரா?',
    'courses.enquiry_desc': 'பழனியின் மிகவும் நம்பகமான டியூஷன் சென்டர் மூலம் உங்கள் கல்விப் பயணத்தைத் தொடங்குங்கள்.',

    // Courses Details
    'course1.title': 'அடிப்படைப் பயிற்சி (6-10)',
    'course1.desc': '6 முதல் 10-ம் வகுப்பு மாணவர்களுக்கான விரிவான பயிற்சி. அறிவியல் மற்றும் கணிதத்தில் வலுவான அடித்தளத்தை உருவாக்குதல்.',
    'course1.target': '6 - 10-ம் வகுப்பு',
    'course2.title': 'மேல்நிலைப் பள்ளி கணிதம்',
    'course2.desc': '11 மற்றும் 12-ம் வகுப்பு கணிதப் பிரிவு மாணவர்களுக்கான ஒருங்கிணைந்த பயிற்சி. பொதுத்தேர்வுக்கான சிறப்புப் பயிற்சி.',
    'course2.target': '11 & 12-ம் வகுப்பு (கணிதம்)',
    'course3.title': 'மேல்நிலைப் பள்ளி கலைப் பிரிவு',
    'course3.desc': '11 மற்றும் 12-ம் வகுப்பு கலைப் பிரிவு மாணவர்களுக்கான சிறந்த வழிகாட்டுதல். பொருளாதாரம் மற்றும் வணிகவியலில் சிறந்து விளங்க பயிற்சி.',
    'course3.target': '11 & 12-ம் வகுப்பு (கலை)',
    'course4.title': 'ஸ்போக்கன் இங்கிலீஷ்',
    'course4.desc': 'மாணவர்கள் மற்றும் பணியாளர்களுக்கான தொழில்முறை தகவல் தொடர்புத் திறன் மற்றும் ஆங்கிலப் புலமைப் பயிற்சி.',
    'course4.target': 'அனைவருக்கும் அனுமதி',
    'course.duration': 'முழு கல்வியாண்டு',
    'course.duration_short': '3 - 6 மாதங்கள்',

    // Results Page
    'results.banner_title': 'வெற்றிப் பட்டியல்',
    'results.banner_sub': 'எங்கள் சாதனையாளர்களைக் கொண்டாடுவோம்',
    'results.achievements': 'சாதனைகள்',
    'results.title': 'சிறந்த முடிவுகள்',
    'results.desc': '6-ம் வகுப்பு முதல் பொதுத்தேர்வு வரை, எங்கள் மாணவர்கள் அனைத்து பாடங்களிலும் முதலிடம் பிடிக்கிறார்கள்.',

    // Faculty Page
    'faculty.banner_title': 'எங்கள் வழிகாட்டிகள்',
    'faculty.banner_sub': 'உங்கள் எதிர்காலத்தை வடிவமைக்கும் சிற்பிகள்',
    'faculty.title': 'ஆசிரியர் குழு',
    'faculty.desc': 'அனுபவம் மற்றும் அர்ப்பணிப்புடன் கூடிய ஆசிரியர்கள். மாணவர்களின் எதிர்காலத்தை செதுக்கும் வழிகாட்டிகளைச் சந்திக்கவும்.',

    // Contact Page
    'contact.banner_title': 'எங்களைத் தொடர்பு கொள்ளுங்கள்',
    'contact.banner_sub': 'இன்றே உங்கள் கல்விப் பயணத்தைத் தொடங்குங்கள்',
    'contact.form_title': 'சேர்க்கை விசாரணை',
    'contact.student_name': 'மாணவர் பெயர்',
    'contact.parent_name': 'பெற்றோர் பெயர்',
    'contact.phone': 'தொலைபேசி எண்',
    'contact.grade': 'வகுப்பு',
    'contact.message': 'தகவல் / தேவைகள்',
    'contact.submit': 'விசாரணையை சமர்ப்பிக்கவும்',
    'contact.info_title': 'தொடர்புத் தகவல்கள்',
    'contact.campus': 'எங்கள் நிறுவனம்',
    'contact.call': 'அழைக்க',
    'contact.email': 'மின்னஞ்சல்',
    'contact.hours': 'அலுவலக நேரம்',

    // Common
    'common.loading': 'பதிவேற்றப்படுகிறது...',
    'common.soon': 'விரைவில்...',
    'common.learn_more': 'SMTC பற்றி மேலும் அறிய',
    'common.enquiry': 'இப்பொழுதே விசாரிக்கவும்',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'en' || saved === 'ta')) {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string) => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}
