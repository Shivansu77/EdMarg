import fs from 'fs';
import path from 'path';

const componentMap = {
  // Layout
  'Navbar': 'layout/Navbar',
  'Footer': 'layout/Footer',
  'FloatingCTA': 'layout/FloatingCTA',
  // Marketing
  'HeroSection': 'marketing/HeroSection',
  'FAQSection': 'marketing/FAQSection',
  'JoinSection': 'marketing/JoinSection',
  'LifeWhySplitSection': 'marketing/LifeWhySplitSection',
  'ResultsSection': 'marketing/ResultsSection',
  'TestimonialsSection': 'marketing/TestimonialsSection',
  'TopMentorsSection': 'marketing/TopMentorsSection',
  'TransformSection': 'marketing/TransformSection',
  'ClientLogosSection': 'marketing/ClientLogosSection',
  // Common
  'Logo': 'common/Logo',
  'NetworkStatus': 'common/NetworkStatus',
  'NetworkStatusLoader': 'common/NetworkStatusLoader',
  'ProfileImageUpload': 'common/ProfileImageUpload',
  'ProtectedRoute': 'common/ProtectedRoute',
  'CalendarSyncButton': 'common/CalendarSyncButton'
};

const walkSync = (dir: string, filelist: string[] = []): string[] => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach((file: string) => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('.next')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('./src');

files.forEach((file: string) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [comp, newPath] of Object.entries(componentMap)) {
    // Replace exact imports like '@/components/Navbar' -> '@/components/layout/Navbar'
    const aliasRegex = new RegExp(`@/components/${comp}(['"])`, 'g');
    if (aliasRegex.test(content)) {
      content = content.replace(aliasRegex, `@/components/${newPath}$1`);
      changed = true;
    }
    
    // Replace relative imports from pages like '../../components/Navbar' -> '../../components/layout/Navbar'
    const relativeRegex = new RegExp(`((?:\\.\\.\\/)+|\\.\\/)components/${comp}(['"])`, 'g');
    if (relativeRegex.test(content)) {
      content = content.replace(relativeRegex, `$1components/${newPath}$2`);
      changed = true;
    }
    
    // Check if the component itself is importing another component in the same dir
    // e.g. import Logo from './Logo' inside Navbar.tsx
    // Since Navbar is now in layout/, and Logo is in common/, the path must change.
    // However, if we just use @/components/Logo it's easier.
    const siblingRegex = new RegExp(`from\\s+['"]\\.\\/${comp}['"]`, 'g');
    if (siblingRegex.test(content)) {
      content = content.replace(siblingRegex, `from '@/components/${newPath}'`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${file}`);
  }
});
