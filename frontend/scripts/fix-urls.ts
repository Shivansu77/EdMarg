import fs from 'fs';

const filesToFix1 = [
  'src/app/mentor-profile/page.tsx',
  'src/app/student/mentors/page.tsx',
  'src/app/student/mentors/[id]/page.tsx',
  'src/app/student/mentors/[id]/MentorDetailClient.tsx',
  'src/app/student/explore/page.tsx',
  'src/app/signup/page.tsx',
  'src/app/browse-mentors/[id]/page.tsx'
];

for (const file of filesToFix1) {
    if (fs.existsSync(file)) {
        let content: string = fs.readFileSync(file, 'utf8');
        content = content.replace('const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\\/api\\/v1\\/?$/, "");', 'const API_BASE_URL = "https://backend.edmarg.com";');
        fs.writeFileSync(file, content);
    }
}

const fileBooking = 'src/app/student/booking/page.tsx';
if (fs.existsSync(fileBooking)) {
    let content: string = fs.readFileSync(fileBooking, 'utf8');
    content = content.replace("const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\\/api\\/v1\\/?$/, '');", "const API_BASE_URL = 'https://backend.edmarg.com';");
    fs.writeFileSync(fileBooking, content);
}

const fileBlog = 'src/services/blog.service.ts';
if (fs.existsSync(fileBlog)) {
    let content: string = fs.readFileSync(fileBlog, 'utf8');
    content = content.replace("const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';", "const API_BASE_URL = 'https://backend.edmarg.com';");
    fs.writeFileSync(fileBlog, content);
}

const fileRoute = 'src/app/api/v1/[...path]/route.ts';
if (fs.existsSync(fileRoute)) {
    let content: string = fs.readFileSync(fileRoute, 'utf8');
    content = content.replace("const BACKEND_BASE_URL = 'https://edmarg-backend.vercel.app';", "const BACKEND_BASE_URL = 'https://backend.edmarg.com';");
    fs.writeFileSync(fileRoute, content);
}
