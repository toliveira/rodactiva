import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

type AdminRequest = {
  id?: string;
  email: string;
  createdAt: Timestamp;
  status?: "pending" | "approved" | "rejected";
};

export default function Users() {
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<AdminRequest[]>([]);

  const fetchRequests = async () => {
    const snap = await getDocs(collection(db, "admin_requests"));
    setRequests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const createRequest = async () => {
    if (!email.trim()) return;
    try {
      await addDoc(collection(db, "admin_requests"), {
        email,
        status: "pending",
        createdAt: Timestamp.now(),
      });
      setEmail("");
      fetchRequests();
    } catch (err) {
      console.error("Failed to submit admin request:", err);
      alert("Failed to submit request. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Admin Users</h2>
      <p className="text-sm text-gray-600 mb-4">
        Submit an email to request admin access. An administrator will approve and grant
        permissions.
      </p>
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <div className="flex gap-2">
          <input
            className="border p-2 flex-1"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={createRequest}>
            Request Admin
          </button>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.email}</td>
              <td className="p-2 capitalize">{r.status}</td>
              <td className="p-2">{r.createdAt?.toDate().toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
