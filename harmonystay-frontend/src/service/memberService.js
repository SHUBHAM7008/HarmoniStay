const BASE_URL = 'http://localhost:8888/api/members';

export async function getMembers() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to fetch members');
  return res.json();
}

export async function addMember(member) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });
  if (!res.ok) throw new Error('Failed to add member');
  return res.json();
}

export async function deleteMember(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete member');

  // If backend returns JSON, parse it. Otherwise, just show success
  try {
    const data = await res.json();
    alert(data.message || 'Member deleted successfully');
    return data;
  } catch {
    alert('Member deleted successfully');
    return {};
  }
}

export async function updateMember(id, updatedData) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT', // or PATCH depending on your backend
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) throw new Error('Failed to update member');
  return res.json();
}

export const getMemberById = async (email) => {
  const res = await fetch(`${BASE_URL}/${email}`);
  if (!res.ok) throw new Error('Failed to fetch member');
  return res.json();
};

