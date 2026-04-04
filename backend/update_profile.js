const fs = require('fs');
const path = require('path');

const studentProfilePath = path.join(__dirname, '../frontend/src/app/student/profile/page.tsx');
const mentorProfilePath = path.join(__dirname, '../frontend/src/app/mentor/profile/page.tsx');

function replaceProfileImageInput(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes("import ProfileImageUpload")) {
        content = content.replace("import Image from 'next/image';", "import Image from 'next/image';\nimport ProfileImageUpload from '@/components/ProfileImageUpload';");
    }

    const regex = /<div className="space-y-2">\s*<label className="text-sm font-semibold text-gray-900">Profile Image URL<\/label>[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;

    const replaceText = `<div className="space-y-3 pt-2">\n                <label className="text-sm font-semibold text-gray-900">Profile Picture</label>\n                <ProfileImageUpload \n                  currentImage={profileImage}\n                  userName={name}\n                  onUploadSuccess={(url) => setProfileImage(url)}\n                />\n              </div>\n            </div>\n          </section>`;

    content = content.replace(regex, replaceText);
    
    fs.writeFileSync(filePath, content, 'utf8');
}

replaceProfileImageInput(studentProfilePath);
replaceProfileImageInput(mentorProfilePath);

