const fs = require('fs');

const path = 'src/components/dashboard/DashboardHeader.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add MessageSquare and FileText to lucide-react imports
const importRegex = /import { (.*?) } from 'lucide-react';/;
content = content.replace(importRegex, (match, p1) => {
    if (!p1.includes('MessageSquare')) p1 += ', MessageSquare';
    if (!p1.includes('FileText')) p1 += ', FileText';
    if (!p1.includes('Calendar')) p1 += ', Calendar';
    if (!p1.includes('Check')) p1 += ', Check';
    return `import { ${p1} } from 'lucide-react';`;
});

// 2. Add notifications state and ref
const stateRegex = /const profileRef = useRef<HTMLDivElement>\(null\);/;
const stateReplacement = `const profileRef = useRef<HTMLDivElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'assignment', title: 'New Assessment Assigned', message: 'You have a new Career Aptitude assessment to complete.', time: '2 hours ago', unread: true },
    { id: 2, type: 'meeting', title: 'Upcoming Mentor Meeting', message: 'Reminder: Session with your mentor starts in 30 mins.', time: '1 day ago', unread: true },
    { id: 3, type: 'message', title: 'New Message from Mentor', message: "Hey, I've reviewed your resume. Let's discuss it today.", time: '2 days ago', unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;
`;
content = content.replace(stateRegex, stateReplacement);

// 3. Add to handleClickOutside
const clickOutsideRegex = /if \(profileRef\.current && !profileRef\.current\.contains\(event\.target as Node\)\) \{\s*setIsProfileOpen\(false\);\s*\}/;
const clickOutsideReplacement = `if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }`;
content = content.replace(clickOutsideRegex, clickOutsideReplacement);

// 4. Update the notification bell button and add popover
const bellRegex = /<button type="button" className=\{actionButtonClasses\} aria-label="Notifications">\s*<Bell size=\{18\} \/>\s*<\/button>/;
const bellReplacement = `<div className="relative" ref={notificationsRef}>
            <button 
              type="button" 
              className={actionButtonClasses} 
              aria-label="Notifications"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                      <Check size={14} />
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      <Bell size={24} className="mx-auto mb-2 opacity-20" />
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={\`p-4 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer \${notification.unread ? 'bg-primary/5' : ''}\`}>
                          <div className={\`mt-0.5 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full \${
                            notification.type === 'assignment' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'meeting' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }\`}>
                            {notification.type === 'assignment' && <FileText size={14} />}
                            {notification.type === 'meeting' && <Calendar size={14} />}
                            {notification.type === 'message' && <MessageSquare size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={\`text-sm \${notification.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}\`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                  <button className="w-full py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 text-center transition-colors rounded-lg hover:bg-gray-200/50">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>`;
content = content.replace(bellRegex, bellReplacement);

fs.writeFileSync(path, content, 'utf8');
console.log('DashboardHeader updated!');
