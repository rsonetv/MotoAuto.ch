import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const activities = [
  {
    user: { name: 'John Doe', avatar: '/avatars/01.png' },
    action: 'approved a new listing:',
    target: '2023 Porsche 911 GT3',
    time: '5m ago',
  },
  {
    user: { name: 'Jane Smith', avatar: '/avatars/02.png' },
    action: 'banned a user:',
    target: 'spam_user_123',
    time: '1h ago',
  },
  {
    user: { name: 'Admin', avatar: '/avatars/03.png' },
    action: 'pushed a new update:',
    target: 'v1.2.0',
    time: '3h ago',
  },
];

export default function ActivityFeed() {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start">
          <Avatar className="w-10 h-10 border">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>
              {activity.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm">
              <span className="font-semibold">{activity.user.name}</span>{' '}
              {activity.action}{' '}
              <span className="font-semibold">{activity.target}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}