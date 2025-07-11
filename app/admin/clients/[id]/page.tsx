import EditClientForm from '../components/EditClientForm';

async function getClient(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/clients/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) {
    return <div className="max-w-2xl mx-auto p-6">Nie znaleziono klienta.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edytuj klienta</h1>
      <EditClientForm client={client} />
    </div>
  );
} 