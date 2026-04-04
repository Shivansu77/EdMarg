const fs = require('fs');
const files = fs.readFileSync('files.txt', 'utf8').split('\n').filter(Boolean);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add import if not present
  if (content.includes('profileImage') && content.includes('<Image') || content.includes('<img')) {
      if (!content.includes('import { getImageUrl }')) {
        content = content.replace(/(import .*?;[\n\r]+)+/, `$&\nimport { getImageUrl } from '@/utils/imageUrl';\n`);
      }
  }

  // Replacements
  // src={mentor.profileImage || `https://ui-avatars.com/api/?background=000000&color=ffffff&name=${encodeURIComponent(mentor.name)}&size=300&bold=true`} -> src={getImageUrl(mentor.profileImage, mentor.name)}
  
  if (content.includes('src={mentor.profileImage ||')) {
      content = content.replace(/src=\{mentor\.profileImage \|\| `https:\/\/ui-avatars\.com[^`]+`\}/g, 'src={getImageUrl(mentor.profileImage, mentor.name)}');
      changed = true;
  }
  
  if (content.includes('src={booking.mentor.profileImage}')) {
      content = content.replace(/src=\{booking\.mentor\.profileImage\}/g, 'src={getImageUrl(booking.mentor.profileImage, booking.mentor.name)}');
      changed = true;
  }

  if (content.includes('src={booking.student.profileImage}')) {
      content = content.replace(/src=\{booking\.student\.profileImage\}/g, 'src={getImageUrl(booking.student.profileImage, booking.student.name)}');
      changed = true;
  }

  if (content.includes('src={student.profileImage}')) {
      content = content.replace(/src=\{student\.profileImage\}/g, 'src={getImageUrl(student.profileImage, student.name)}');
      changed = true;
  }
  
  if (content.includes('src={user.profileImage}')) {
      content = content.replace(/src=\{user\.profileImage\}/g, 'src={getImageUrl(user.profileImage, user.name)}');
      changed = true;
  }

  if (content.includes('src={review.student.profileImage ||')) {
      content = content.replace(/src=\{review\.student\.profileImage \|\| `https:\/\/ui-avatars\.com[^`]+`\}/g, 'src={getImageUrl(review.student.profileImage, review.student.name)}');
      changed = true;
  }

  if (content.includes('src={mentor.profileImage}')) {
      content = content.replace(/src=\{mentor\.profileImage\}/g, 'src={getImageUrl(mentor.profileImage, mentor.name)}');
      changed = true;
  }

  if (changed) {
      if (!content.includes('import { getImageUrl }')) {
          content = "import { getImageUrl } from '@/utils/imageUrl';\n" + content;
      }
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
  }
}
