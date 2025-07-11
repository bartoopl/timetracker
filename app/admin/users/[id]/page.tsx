import EditUserForm from '../components/EditUserForm';

async function getUser(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) {
    return <div className="max-w-2xl mx-auto p-6">Nie znaleziono użytkownika.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      <EditUserForm user={user} />
    </div>
  );
} 