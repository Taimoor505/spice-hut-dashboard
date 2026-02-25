'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Plus, Search, X, Trash2, Upload, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  imageUrl: string | null;
  available: boolean;
  updatedAt: string;
};

const initialForm = {
  name: '',
  category: 'Main Course',
  description: '',
  price: '0',
  imageUrl: '',
  available: true
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [query, setQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch('/api/menu');
    if (!res.ok) return;
    const json = await res.json();
    setItems(json.items);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(
    () => items.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setDrawerOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description,
      price: String(item.price),
      imageUrl: item.imageUrl || '',
      available: item.available
    });
    setDrawerOpen(true);
  };

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return;
    const json = await res.json();
    setForm((f) => ({ ...f, imageUrl: json.url }));
  };

  const save = async () => {
    setSaving(true);
    const payload = { ...form, price: Number(form.price), available: Boolean(form.available) };
    const url = editingId ? `/api/menu/${editingId}` : '/api/menu';
    const method = editingId ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    await load();
    setSaving(false);
    setDrawerOpen(false);
  };

  const remove = async (id: string) => {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleAvailability = async (item: MenuItem) => {
    await fetch(`/api/menu/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !item.available })
    });
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Menu Management</h1>
          <p className="mt-1 page-subtitle">Manage your menu items and availability for AI agents</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shadow-sm">
          <Plus size={16} />
          Add Item
        </Button>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-card">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={15} />
          <Input className="pl-10" placeholder="Search menu items..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <p className="mt-3 text-xs text-ink-400">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Menu grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-100">
            <Package size={20} className="text-ink-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-ink-600">No menu items found</p>
          <p className="mt-1 text-xs text-ink-400">Try a different search or add a new item</p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              className={`group overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${!item.available ? 'opacity-60' : ''}`}
            >
              {/* Card content */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-ink-900">{item.name}</p>
                    <span className="mt-1.5 inline-flex rounded-lg border border-[var(--line-light)] bg-[#faf8f6] px-2 py-0.5 text-2xs font-medium text-ink-500">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-ink-900">${Number(item.price).toFixed(2)}</p>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-500">{item.description}</p>

                {/* Status & Edit */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.available ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                    <span className="text-xs font-medium text-ink-500">{item.available ? 'Available' : 'Unavailable'}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="gap-1.5 opacity-0 group-hover:opacity-100">
                    <Pencil size={13} /> Edit
                  </Button>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between border-t border-[var(--line-light)] bg-[#faf8f6] px-5 py-3">
                <button
                  onClick={() => toggleAvailability(item)}
                  className="toggle-track"
                  data-active={String(item.available)}
                  aria-label="Toggle availability"
                >
                  <span className="toggle-thumb" data-active={String(item.available)} />
                </button>
                <button
                  onClick={() => remove(item.id)}
                  className="flex items-center gap-1 text-xs font-medium text-rose-500 transition hover:text-rose-700"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </motion.article>
          ))}
        </section>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-[var(--line)] bg-white"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
                <h2 className="text-lg font-bold text-ink-900">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-ink-500 transition hover:bg-ink-50 hover:text-ink-700"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-ink-700">Item name</label>
                    <Input placeholder="e.g. Chicken Biryani" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-ink-700">Category</label>
                    <Input placeholder="e.g. Main Course" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-ink-700">Price ($)</label>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-ink-700">Image URL</label>
                    <Input placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-ink-700">Description</label>
                    <Textarea placeholder="Describe the dish..." rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[#faf8f6] px-4 py-3">
                    <span className="text-sm font-medium text-ink-700">Available</span>
                    <button
                      onClick={() => setForm({ ...form, available: !form.available })}
                      className="toggle-track"
                      data-active={String(form.available)}
                      aria-label="Toggle availability"
                    >
                      <span className="toggle-thumb" data-active={String(form.available)} />
                    </button>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--line)] bg-[#faf8f6] px-4 py-3 text-sm font-medium text-ink-600 transition hover:border-spice-300 hover:bg-spice-50 hover:text-spice-700">
                    <Upload size={16} />
                    Upload image
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                  </label>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="border-t border-[var(--line)] px-6 py-4">
                <Button onClick={save} size="lg" className="w-full" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Item' : 'Create Item'}
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
