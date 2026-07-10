import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, ShieldAlert } from 'lucide-react';
import API from '../services/api';

interface CategoryType {
  _id: string;
  name: string;
  displayName: string;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/categories', { displayName: displayName.trim() });
      if (res.data.success) {
        setCategories((prev) => [...prev, res.data.category].sort((a, b) => a.displayName.localeCompare(b.displayName)));
        setDisplayName('');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create category.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (name === 'tutorials' || name === 'gear reviews' || name === 'all videos') {
      alert('System-critical categories cannot be deleted.');
      return;
    }

    if (!window.confirm(`Delete the category "${name}"? Existing media associated with this category might be affected.`)) {
      return;
    }

    try {
      const res = await API.delete(`/categories/${id}`);
      if (res.data.success) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-6">
      <div>
        <h3 className="text-label-md font-bold text-on-surface flex items-center gap-2 uppercase tracking-wider">
          <Tag className="w-4 h-4 text-primary" />
          Manage Categories
        </h3>
        <p className="text-[12px] text-on-secondary-container mt-1">
          Create, view, or remove classification tags for video grid, blogs, and stories.
        </p>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="bg-error-container text-error px-4 py-2.5 rounded-xl text-[13px] flex items-center gap-2">
          <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleAddCategory} className="flex gap-2">
        <input
          type="text"
          required
          placeholder="New category name (e.g. Gear Reviews)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="bg-background px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md w-full placeholder:text-on-surface-variant/40"
        />
        <button
          type="submit"
          disabled={loading || !displayName.trim()}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-bold flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {/* Category List */}
      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="flex items-center justify-between px-3 py-2 bg-background border border-outline-variant/20 rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="text-[13px] text-on-surface font-semibold capitalize">
              {cat.displayName}
            </span>
            {cat.name !== 'tutorials' && cat.name !== 'gear reviews' && cat.name !== 'all videos' && (
              <button
                onClick={() => handleDeleteCategory(cat._id, cat.displayName)}
                className="text-on-secondary-container hover:text-error transition-colors p-1"
                title="Delete Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
