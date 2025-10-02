"use client";

import { useState, useEffect } from "react";
import { getAllCategoriesForUser, createContact, getAllContacts, deleteContact, updateContact } from "@/lib/firestoreContacts";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function ContactsPage() {
  const { user } = useAuth();

  // Contact form states
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [priority, setPriority] = useState("");

  // Contact list states
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Edit modal state
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchCategories();
    fetchContacts();
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;
    try {
      const data = await getAllCategoriesForUser();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContacts = async () => {
    try {
      const data = await getAllContacts();
      setContacts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!name || !categoryId) return alert("Name and category are required");

    try {
      if (editingContactId) {
        // Update contact
        await updateContact(editingContactId, { name, categoryId, phone, email, address, priority });
        setEditingContactId(null);
        setIsModalOpen(false);
        alert("Contact updated successfully");
      } else {
        // Create new contact
        await createContact(name, categoryId, phone, email, address, priority);
        alert("Contact created successfully");
      }

      // Reset form
      setName(""); setCategoryId(""); setPhone(""); setEmail(""); setAddress(""); setPriority("");
      fetchContacts();
    } catch (err) {
      console.error(err);
      alert("Failed to save contact");
    }
  };

  const handleEdit = (contact: any) => {
    setEditingContactId(contact.id);
    setName(contact.name);
    setCategoryId(contact.categoryId);
    setPhone(contact.phone);
    setEmail(contact.email);
    setAddress(contact.address);
    setPriority(contact.priority);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure to delete this contact?")) return;
    try {
      await deleteContact(id);
      fetchContacts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete contact");
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-8 max-w-4xl mx-auto">
      {/* Create Contact Form */}
      <div className="p-4 space-y-4 border rounded shadow">
        <h2 className="text-xl font-bold">{editingContactId ? "Edit Contact" : "Create Contact"}</h2>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded w-full" />
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="border p-2 rounded w-full">
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="border p-2 rounded w-full" />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded w-full" />
        <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} className="border p-2 rounded w-full" />
        <input placeholder="Priority" value={priority} onChange={e => setPriority(e.target.value)} className="border p-2 rounded w-full" />
        <Button onClick={handleSubmit} size="sm" className="min-w-[80px] flex-shrink-0">{editingContactId ? "Update Contact" : "Create Contact"}</Button>
        {editingContactId && <Button onClick={() => { setEditingContactId(null); setIsModalOpen(false); setName(""); setCategoryId(""); }} className="w-full bg-gray-400 mt-2">Cancel</Button>}
      </div>

      {/* Contact List */}
      <div className="p-4 border rounded shadow">
        <h2 className="text-xl font-bold mb-4">Contact List</h2>
        <input placeholder="Search contacts" value={search} onChange={e => setSearch(e.target.value)} className="border p-2 rounded w-full mb-4" />

        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">Priority</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(contact => (
              <tr key={contact.id}>
                <td className="border p-2">{contact.name}</td>
                <td className="border p-2">{contact.phone}</td>
                <td className="border p-2">{contact.email}</td>
                <td className="border p-2">{contact.address}</td>
                <td className="border p-2">{contact.priority}</td>
                <td className="border p-2 space-x-2">
                  <Button onClick={() => handleEdit(contact)} className="bg-blue-500 text-white">Edit</Button>
                  <Button onClick={() => handleDelete(contact.id)} className="bg-red-500 text-white">Delete</Button>
                </td>
              </tr>
            ))}
            {filteredContacts.length === 0 && <tr><td colSpan={6} className="text-center p-4">No contacts found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
