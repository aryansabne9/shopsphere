import { useState } from 'react';
import { Check, PenLine, X } from 'lucide-react';

export default function AdminProductEditor({ products, onSave }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    data.price = Number(data.price);
    data.compareAtPrice = data.compareAtPrice ? Number(data.compareAtPrice) : null;
    data.stock = Number(data.stock);
    data.featured = form.elements.featured.checked;
    setSaving(true);
    setError('');
    try {
      await onSave(selected._id, data);
      setSelected(null);
      setOpen(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return <>
    <button className="catalog-edit-launch" onClick={() => setOpen(true)}><PenLine size={15} /> Edit products</button>
    {open && <div className="catalog-editor-backdrop" onClick={() => { setOpen(false); setSelected(null); }}>
      <section className="catalog-editor" onClick={(event) => event.stopPropagation()}>
        <header className="catalog-editor-head"><div><span className="eyebrow">SHOPSPHERE / CATALOG</span><h2>Edit products</h2></div><button className="header-icon" onClick={() => { setOpen(false); setSelected(null); }} aria-label="Close product editor"><X size={19} /></button></header>
        <div className="catalog-editor-body">
          <nav className="catalog-editor-list" aria-label="Choose a product to edit">
            {products.map((product) => <button className={selected?._id === product._id ? 'selected' : ''} key={product._id} onClick={() => { setSelected(product); setError(''); }}><img src={product.imageUrl} alt="" /><span><strong>{product.name}</strong><small>{product.stock} in stock</small></span><PenLine size={14} /></button>)}
          </nav>
          {selected ? <form className="catalog-editor-form" onSubmit={submit} key={selected._id}>
            <div className="form-pair"><label>Product name<input name="name" defaultValue={selected.name} required maxLength="120" /></label><label>Category<input name="category" defaultValue={selected.category} required /></label></div>
            <div className="form-pair"><label>Price (USD)<input name="price" type="number" min="0" step="0.01" defaultValue={selected.price} required /></label><label>Compare-at price<input name="compareAtPrice" type="number" min="0" step="0.01" defaultValue={selected.compareAtPrice || ''} /></label></div>
            <div className="form-pair"><label>Stock<input name="stock" type="number" min="0" defaultValue={selected.stock} required /></label><label>Image URL<input name="imageUrl" type="url" defaultValue={selected.imageUrl} required /></label></div>
            <label>Description<textarea name="description" defaultValue={selected.description} maxLength="1500" rows="4" required /></label>
            <label className="check-label"><input name="featured" type="checkbox" defaultChecked={selected.featured} /> Feature in storefront</label>
            {error && <span className="editor-error" role="alert">{error}</span>}
            <button className="dark-button" type="submit" disabled={saving}>{saving ? 'Saving…' : <><Check size={15} /> Save changes</>}</button>
          </form> : <div className="editor-empty"><PenLine size={20} /><span>Choose a product to edit its details.</span></div>}
        </div>
      </section>
    </div>}
  </>;
}
