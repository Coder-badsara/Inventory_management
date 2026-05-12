import { useState } from 'react';

interface Shop {
  id: string;
  name: string;
  location: string;
  ownerName: string;
  email: string;
  phone: string;
}

interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  phone: string;
  address: string;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantityInStock: number;
  unitPrice: string;
  category: string;
  isLowStock: boolean;
  shop: {
    name: string;
  };
}

interface DashboardData {
  allShops: Shop[];
  allSuppliers: Supplier[];
  allItems: InventoryItem[];
}

interface DashboardProps {
  currentTab: string;
  searchTerm: string;
  loading: boolean;
  error: any;
  data: DashboardData | undefined;
  onCreateShop?: (variables: any) => Promise<void>;
  onCreateSupplier?: (variables: any) => Promise<void>;
}

const DASHBOARD_STYLES = `
  .suppliers-row { padding: 12px 24px 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
  .contact-item.horizontal { border: 1px solid #f3f4f6; border-radius: 16px; padding: 16px; margin: 0; }
  .mb-24 { margin-bottom: 24px; }
  .dashboard-v2 { display: flex; flex-direction: column; gap: 32px; animation: fadeIn 0.5s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
  .stat-card { padding: 20px; border-radius: 20px; display: flex; flex-direction: column; color: white; position: relative; overflow: hidden; box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.2); min-height: 120px; }
  .stat-card.blue { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
  .stat-card.red { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
  .stat-card.green { background: linear-gradient(135deg, #10b981 0%, #047857 100%); }
  .stat-card.gold { background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%); }
  .stat-info { position: relative; z-index: 2; width: 100%; }
  .stat-label { margin: 0; font-size: 11px; opacity: 0.85; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
  .stat-value { margin: 4px 0 0; font-size: 28px; font-weight: 900; line-height: 1.1; letter-spacing: -0.5px; }
  .stat-icon-large { position: absolute; right: -10px; bottom: -10px; font-size: 70px; opacity: 0.15; transform: rotate(-15deg); z-index: 1; pointer-events: none; }
  .dashboard-content-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
  @media (max-width: 1200px) { .dashboard-content-layout { grid-template-columns: 1fr; } }
  .surface { background: white; border-radius: 24px; border: 1px solid #f3f4f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; }
  .surface-header { padding: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f3f4f6; }
  .surface-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #111827; }
  .table-filters { display: flex; gap: 8px; }
  .filter-pill { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #6b7280; cursor: pointer; background: #f3f4f6; transition: all 0.2s; }
  .filter-pill.active { background: #7c3aed; color: white; }
  .custom-dropdown-container { position: relative; display: inline-block; }
  .dropdown-trigger { display: flex; align-items: center; gap: 8px; user-select: none; }
  .dropdown-menu { position: absolute; top: calc(100% + 8px); right: 0; background: white; border-radius: 16px; border: 1px solid #f3f4f6; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); z-index: 1000; min-width: 160px; padding: 8px; animation: slideIn 0.2s ease-out; }
  @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  .dropdown-item { padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; color: #4b5563; cursor: pointer; transition: all 0.2s; }
  .dropdown-item.selected { background: #f5f3ff; color: #7c3aed; font-weight: 700; }
  .table-wrapper { overflow-x: auto; }
  .modern-table { width: 100%; border-collapse: collapse; }
  .modern-table th { text-align: left; padding: 16px 24px; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; background: #f9fafb; }
  .modern-table td { padding: 20px 24px; border-bottom: 1px solid #f3f4f6; }
  .product-cell { display: flex; align-items: center; gap: 16px; }
  .product-img { width: 40px; height: 40px; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #4b5563; }
  .product-name { margin: 0; font-weight: 600; color: #111827; font-size: 14px; }
  .product-sku { margin: 2px 0 0; color: #9ca3af; font-size: 12px; }
  .cat-tag { padding: 4px 10px; background: #eff6ff; color: #2563eb; border-radius: 8px; font-size: 12px; font-weight: 600; }
  .stock-display { display: flex; flex-direction: column; gap: 6px; width: 120px; }
  .stock-count { font-size: 13px; font-weight: 600; color: #374151; }
  .stock-bar-bg { height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
  .stock-bar-fill { height: 100%; border-radius: 3px; }
  .stock-bar-fill.healthy { background: #10b981; }
  .stock-bar-fill.critical { background: #ef4444; }
  .price-cell { font-weight: 700; color: #111827; }
  .status-badge { padding: 6px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; }
  .status-badge.stable { background: #d1fae5; color: #065f46; }
  .status-badge.urgent { background: #fee2e2; color: #991b1b; }
  .contact-list, .shop-list { padding: 12px 24px 24px; }
  .contact-item, .shop-item { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #f3f4f6; }
  .contact-avatar { width: 36px; height: 36px; background: #7c3aed; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
  .contact-name { margin: 0; font-weight: 700; font-size: 14px; color: #111827; }
  .contact-sub { margin: 2px 0 0; font-size: 12px; color: #6b7280; }
  .contact-action { margin-left: auto; padding: 8px; cursor: pointer; transition: transform 0.2s; font-size: 18px; }
  .contact-action:hover { transform: scale(1.2); }
  .shop-name { margin: 0; font-weight: 700; font-size: 14px; color: #111827; }
  .shop-loc { margin: 2px 0 0; font-size: 12px; color: #4b5563; }
  .mt-24 { margin-top: 24px; }
  .pagination-footer { padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3f4f6; background: #f9fafb; }
  .pagination-info { font-size: 13px; color: #6b7280; }
  .pagination-info span { font-weight: 600; color: #111827; }
  .pagination-controls { display: flex; align-items: center; gap: 8px; }
  .pagination-btn { padding: 6px 14px; border-radius: 10px; border: 1px solid #e5e7eb; background: white; font-size: 13px; font-weight: 600; color: #4b5563; cursor: pointer; transition: all 0.2s; }
  .pagination-btn:hover:not(:disabled) { background: #f3f4f6; border-color: #d1d5db; color: #111827; }
  .pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .page-numbers { display: flex; gap: 4px; }
  .page-num { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 1px solid transparent; background: transparent; font-size: 13px; font-weight: 600; color: #9ca3af; cursor: pointer; transition: all 0.2s; }
  .page-num:hover:not(.active) { background: #f3f4f6; color: #4b5563; }
  .page-num.active { background: #7c3aed; color: white; box-shadow: 0 4px 10px rgba(124, 58, 237, 0.25); }
  .loading-container { height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .spinner { width: 48px; height: 48px; border: 4px solid #f3f4f6; border-top: 4px solid #7c3aed; border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const TAB_VIEW_STYLES = `
  .tab-view { display: flex; flex-direction: column; gap: 40px; animation: fadeIn 0.5s ease-out; position: relative; }
  .tab-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .header-content { display: flex; flex-direction: column; gap: 8px; }
  .tab-view h1 { font-size: 32px; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.5px; }
  .tab-subtitle { color: #6b7280; font-size: 16px; font-weight: 500; }
  .add-btn {
    background: #7c3aed;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  }
  .add-btn:hover { background: #6d28d9; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(124, 58, 237, 0.4); }
  .plus-icon { font-size: 20px; font-weight: 400; }
  .grid-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 32px; }
  .shop-card {
    display: flex;
    flex-direction: column;
    border-radius: 24px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .shop-card:hover { transform: translateY(-4px); box-shadow: 0 12px 25px -5px rgba(0,0,0,0.1); }
  .shop-card-header {
    padding: 32px;
    background: #f9fafb;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    gap: 20px;
    align-items: center;
  }
  .shop-icon-wrapper {
    width: 56px;
    height: 56px;
    background: white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }
  .shop-title-meta h2 { margin: 0; font-size: 20px; font-weight: 800; color: #111827; }
  .shop-owner-tag { margin: 4px 0 0; font-size: 13px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.5px; }
  .shop-owner-tag-success { color: #10b981; }
  .shop-card-body { padding: 32px; display: flex; flex-direction: column; gap: 16px; }
  .info-row { display: flex; gap: 14px; align-items: flex-start; }
  .info-icon { font-size: 16px; min-width: 20px; text-align: center; opacity: 0.8; }
  .info-value { font-size: 14px; color: #4b5563; line-height: 1.5; font-weight: 600; }
  .address-row {
    margin-top: 8px;
    padding-top: 20px;
    border-top: 1px dashed #e5e7eb;
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.2s ease-out;
  }
  .modal-content {
    width: 500px;
    max-width: 90%;
    background: white;
    border-radius: 28px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  }
  .modal-header {
    padding: 24px 32px;
    background: #f9fafb;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-header h2 { margin: 0; font-size: 20px; font-weight: 800; color: #111827; }
  .close-btn { background: none; border: none; font-size: 20px; color: #9ca3af; cursor: pointer; }
  .modal-form { padding: 32px; display: flex; flex-direction: column; gap: 20px; }
  .form-group { display: flex; flex-direction: column; gap: 8px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-group label { font-size: 13px; font-weight: 700; color: #374151; }
  .form-group input, .form-group textarea {
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: white;
    color: #111827;
    font-size: 14px;
    font-weight: 500;
    outline: none;
    transition: all 0.2s;
  }
  .form-group input:focus, .form-group textarea:focus { border-color: #7c3aed; }
  .form-group textarea { min-height: 80px; resize: vertical; }
  .modal-footer {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  .primary-btn { background: #7c3aed; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; }
  .secondary-btn { background: #f3f4f6; color: #4b5563; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; }
  .surface { background: white; border-radius: 24px; border: 1px solid #f3f4f6; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;

const Dashboard = ({ currentTab, searchTerm, loading, error, data, onCreateShop, onCreateSupplier }: DashboardProps) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newShop, setNewShop] = useState({ name: '', location: '', ownerName: '', email: '', phone: '' });
  const [newSupplier, setNewSupplier] = useState({ name: '', contactEmail: '', phone: '', address: '' });
  const itemsPerPage = 8;

  // Sync internal state with prop
  const [lastSearch, setLastSearch] = useState(searchTerm);
  if (searchTerm !== lastSearch) {
    setLastSearch(searchTerm);
    setCurrentPage(1);
  }

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Fetching your data...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p className="error-icon">⚠️</p>
      <h3>Oops! Something went wrong</h3>
      <p>{error.message || 'An unknown error occurred'}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  if (!data || !data.allItems) return (
    <div className="loading-container">
      <p>No data found.</p>
    </div>
  );

  // Filter Items
  let displayedItems = [...data.allItems];

  // Apply Search
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    displayedItems = displayedItems.filter(item => 
      item.name?.toLowerCase()?.includes(lowerSearch) || 
      item.sku?.toLowerCase()?.includes(lowerSearch) ||
      item.category?.toLowerCase()?.includes(lowerSearch) ||
      item.shop?.name?.toLowerCase()?.includes(lowerSearch)
    );
  }

  // Extract unique categories
  const categories = Array.from(new Set(data.allItems.map(item => item.category))).filter(Boolean).sort();

  // Apply Pill Filters
  if (activeFilter === 'Low Stock') {
    displayedItems = displayedItems.filter(item => item.isLowStock);
  } else if (activeFilter !== 'All') {
    displayedItems = displayedItems.filter(item => item.category === activeFilter);
  }

  // Calculate Stats
  const totalItems = data.allItems.length;
  const lowStockItems = data.allItems.filter(item => item.isLowStock).length;
  const totalValue = data.allItems.reduce((acc, item) => acc + (parseFloat(item.unitPrice || '0') * item.quantityInStock), 0);

  // Calculate pagination
  const totalPages = Math.ceil(displayedItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateShop) {
      await onCreateShop(newShop);
      setIsModalOpen(false);
      setNewShop({ name: '', location: '', ownerName: '', email: '', phone: '' });
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateSupplier) {
      await onCreateSupplier(newSupplier);
      setIsSupplierModalOpen(false);
      setNewSupplier({ name: '', contactEmail: '', phone: '', address: '' });
    }
  };

  // Tab views
  if (currentTab === 'Shops') {
    return (
      <div className="tab-view">
        <div className="tab-header">
          <div className="header-content">
            <h1>Shops Management</h1>
            <p className="tab-subtitle">Manage and monitor your retail store network</p>
          </div>
          <button className="add-btn" onClick={() => setIsModalOpen(true)}>
            <span className="plus-icon">+</span> Add New Shop
          </button>
        </div>
        
        <div className="grid-list">
          {(data.allShops || []).map(shop => (
            <div key={shop.id} className="surface shop-card">
              <div className="shop-card-header">
                <div className="shop-icon-wrapper">🏪</div>
                <div className="shop-title-meta">
                  <h2>{shop.name}</h2>
                  <p className="shop-owner-tag">👤 {shop.ownerName}</p>
                </div>
              </div>
              
              <div className="shop-card-body">
                <div className="info-row">
                  <span className="info-icon">✉️</span>
                  <span className="info-value">{shop.email || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">📞</span>
                  <span className="info-value">{shop.phone || 'N/A'}</span>
                </div>
                <div className="info-row address-row">
                  <span className="info-icon">📍</span>
                  <span className="info-value">{shop.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content surface">
              <div className="modal-header">
                <h2>Add New Shop</h2>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Shop Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Metro Mart" 
                    value={newShop.name}
                    onChange={e => setNewShop({...newShop, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Owner Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe" 
                    value={newShop.ownerName}
                    onChange={e => setNewShop({...newShop, ownerName: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. contact@shop.com" 
                      value={newShop.email}
                      onChange={e => setNewShop({...newShop, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +91 98765 43210" 
                      value={newShop.phone}
                      onChange={e => setNewShop({...newShop, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address / Location</label>
                  <textarea 
                    placeholder="Full street address..." 
                    value={newShop.location}
                    onChange={e => setNewShop({...newShop, location: e.target.value})}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="primary-btn">Create Shop</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: TAB_VIEW_STYLES }} />
      </div>
    );
  }

  if (currentTab === 'Suppliers') {
    return (
      <div className="tab-view">
        <div className="tab-header">
          <div className="header-content">
            <h1>Suppliers Directory</h1>
            <p className="tab-subtitle">Manage your trusted supply chain and vendors</p>
          </div>
          <button className="add-btn" onClick={() => setIsSupplierModalOpen(true)}>
            <span className="plus-icon">+</span> Add New Supplier
          </button>
        </div>
        
        <div className="grid-list">
          {(data.allSuppliers || []).map(supplier => (
            <div key={supplier.id} className="surface shop-card">
              <div className="shop-card-header">
                <div className="shop-icon-wrapper" style={{ background: '#7c3aed', color: 'white', fontWeight: '800' }}>
                  {supplier.name?.charAt(0) || '?'}
                </div>
                <div className="shop-title-meta">
                  <h2>{supplier.name}</h2>
                  <p className="shop-owner-tag shop-owner-tag-success">Verified Vendor</p>
                </div>
              </div>
              
              <div className="shop-card-body">
                <div className="info-row">
                  <span className="info-icon">✉️</span>
                  <span className="info-value">{supplier.contactEmail || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">📞</span>
                  <span className="info-value">{supplier.phone || 'N/A'}</span>
                </div>
                <div className="info-row address-row">
                  <span className="info-icon">📍</span>
                  <span className="info-value">{supplier.address || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isSupplierModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content surface">
              <div className="modal-header">
                <h2>Add New Supplier</h2>
                <button className="close-btn" onClick={() => setIsSupplierModalOpen(false)}>✕</button>
              </div>
              <form onSubmit={handleSupplierSubmit} className="modal-form">
                <div className="form-group">
                  <label>Supplier Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Global Tech Solutions" 
                    value={newSupplier.name}
                    onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input 
                      required
                      type="email" 
                      placeholder="e.g. sales@supplier.com" 
                      value={newSupplier.contactEmail}
                      onChange={e => setNewSupplier({...newSupplier, contactEmail: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +91 98765 43210" 
                      value={newSupplier.phone}
                      onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Office Address</label>
                  <textarea 
                    placeholder="Full business address..." 
                    value={newSupplier.address}
                    onChange={e => setNewSupplier({...newSupplier, address: e.target.value})}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="secondary-btn" onClick={() => setIsSupplierModalOpen(false)}>Cancel</button>
                  <button type="submit" className="primary-btn">Create Supplier</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: TAB_VIEW_STYLES }} />
      </div>
    );
  }

  return (
    <div className="dashboard-v2">
      {currentTab === 'Dashboard' && (
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-info">
              <p className="stat-label">Total Products</p>
              <h3 className="stat-value">{totalItems}</h3>
            </div>
            <div className="stat-icon-large">📦</div>
          </div>
          <div className="stat-card red">
            <div className="stat-info">
              <p className="stat-label">Low Stock Alerts</p>
              <h3 className="stat-value">{lowStockItems}</h3>
            </div>
            <div className="stat-icon-large">🚨</div>
          </div>
          <div className="stat-card green">
            <div className="stat-info">
              <p className="stat-label">Total Asset Value</p>
              <h3 className="stat-value">₹{totalValue.toLocaleString()}</h3>
            </div>
            <div className="stat-icon-large">💰</div>
          </div>
          <div className="stat-card gold">
            <div className="stat-info">
              <p className="stat-label">Top Shop</p>
              <h3 className="stat-value">{data.allShops?.[0]?.name || 'N/A'}</h3>
            </div>
            <div className="stat-icon-large">🏆</div>
          </div>
        </div>
      )}

      <div className="main-panel">
        {currentTab === 'Dashboard' && (
          <div className="surface mb-24">
            <div className="surface-header">
              <h2>Top Suppliers</h2>
            </div>
            <div className="suppliers-row">
              {(data.allSuppliers || []).slice(0, 3).map(supplier => (
                <div key={supplier.id} className="contact-item horizontal">
                  <div className="contact-avatar">{supplier.name?.charAt(0) || '?'}</div>
                  <div className="contact-details">
                    <p className="contact-name">{supplier.name}</p>
                    <p className="contact-sub">enquiry@{supplier.name?.toLowerCase().replace(/\s+/g, '') || 'supplier'}.com</p>
                  </div>
                  <div className="contact-action" onClick={() => alert(`Calling ${supplier.name}...`)}>📞</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="surface">
          <div className="surface-header">
            <h2>Inventory Status</h2>
            <div className="table-filters">
              {['All', 'Low Stock'].map(filter => (
                <span 
                  key={filter}
                  className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => {
                    setActiveFilter(filter);
                    setIsDropdownOpen(false);
                    setCurrentPage(1);
                  }}
                >
                  {filter}
                </span>
              ))}
              
              <div className="custom-dropdown-container">
                <div 
                  className={`filter-pill dropdown-trigger ${!['All', 'Low Stock'].includes(activeFilter) ? 'active' : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {['All', 'Low Stock'].includes(activeFilter) ? 'Categories' : activeFilter}
                  <span className="arrow-icon">▼</span>
                </div>
                
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    {categories.map(cat => (
                      <div 
                        key={cat} 
                        className={`dropdown-item ${activeFilter === cat ? 'selected' : ''}`}
                        onClick={() => {
                          setActiveFilter(cat);
                          setIsDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="table-wrapper">
            {displayedItems.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                No items found matching your filters.
              </div>
            ) : (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Availability</th>
                    <th>Unit Price</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id} className="table-row">
                      <td>
                        <div className="product-cell">
                          <div className="product-img">{item.name?.charAt(0) || '?'}</div>
                          <div>
                            <p className="product-name">{item.name}</p>
                            <p className="product-sku">{item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="cat-tag">{item.category}</span></td>
                      <td>
                        <div className="stock-display">
                          <span className="stock-count">{item.quantityInStock} units</span>
                          <div className="stock-bar-bg">
                            <div 
                              className={`stock-bar-fill ${item.isLowStock ? 'critical' : 'healthy'}`} 
                              style={{ width: `${Math.min((item.quantityInStock / 50) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="price-cell">₹{parseFloat(item.unitPrice || '0').toLocaleString()}</td>
                      <td>{item.shop?.name || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${item.isLowStock ? 'urgent' : 'stable'}`}>
                          {item.isLowStock ? 'Reorder' : 'Stable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {displayedItems.length > itemsPerPage && (
            <div className="pagination-footer">
              <div className="pagination-info">
                Showing <span>{indexOfFirstItem + 1}</span> to <span>{Math.min(indexOfLastItem, displayedItems.length)}</span> of <span>{displayedItems.length}</span> items
              </div>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      className={`page-num ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  className="pagination-btn" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: DASHBOARD_STYLES }} />
    </div>
  );
};

export default Dashboard;
