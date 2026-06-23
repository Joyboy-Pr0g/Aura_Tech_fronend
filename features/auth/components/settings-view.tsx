import { User } from '@/lib/types/entities';

interface SettingsViewProps {
  user: User;
}

export function SettingsView({ user }: SettingsViewProps) {
  return (
    <div className="p-8 space-y-6 max-w-lg">
      <h2 className="text-2xl font-bold text-white">Account Settings</h2>
      <div className="card-dark p-5 space-y-3">
        <div>
          <p className="label-dark">Full Name</p>
          <p className="text-white">{user.full_name}</p>
        </div>
        <div>
          <p className="label-dark">Email</p>
          <p className="text-white">{user.email}</p>
        </div>
        <div>
          <p className="label-dark">Role</p>
          <p className="text-white capitalize">{user.role?.replace('_', ' ')}</p>
        </div>
        <div>
          <p className="label-dark">Status</p>
          <p className="text-success capitalize">{user.status}</p>
        </div>
      </div>
    </div>
  );
}
