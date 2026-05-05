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
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  let data = {};

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete member');
  }

  return data;
}

export async function updateMember(id, updatedData) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT', // or PATCH depending on your backend
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to update member');
  }
  return res.json();
}

export const getMemberById = async (email) => {
  const res = await fetch(`${BASE_URL}/${email}`);
  if (!res.ok) throw new Error('Failed to fetch member');
  return res.json();
};

