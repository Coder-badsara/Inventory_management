import { useState } from 'react'
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import './App.css'
import Dashboard from './components/Dashboard'

const GET_GLOBAL_DATA = gql`
  query GetGlobalData {
    allShops {
      id
      name
      location
      ownerName
      email
      phone
    }
    allSuppliers {
      id
      name
      contactEmail
      phone
      address
    }
    allItems {
      id
      name
      sku
      quantityInStock
      unitPrice
      category
      isLowStock
      shop {
        name
      }
    }
  }
`;

const CREATE_SHOP = gql`
  mutation CreateShop($name: String!, $location: String, $ownerName: String, $email: String, $phone: String) {
    createShop(name: $name, location: $location, ownerName: $ownerName, email: $email, phone: $phone) {
      shop {
        id
        name
      }
    }
  }
`;

const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($name: String!, $contactEmail: String!, $phone: String, $address: String) {
    createSupplier(name: $name, contactEmail: $contactEmail, phone: $phone, address: $address) {
      supplier {
        id
        name
      }
    }
  }
`;

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

interface GlobalData {
  allShops: Shop[];
  allSuppliers: Supplier[];
  allItems: InventoryItem[];
}

function App() {
  const [currentTab, setCurrentTab] = useState('Dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [isNotifyOpen, setIsNotifyOpen] = useState(false)
  
  const { loading, error, data, refetch } = useQuery<GlobalData>(GET_GLOBAL_DATA)
  const [createShopMutation] = useMutation(CREATE_SHOP, {
    onCompleted: () => refetch()
  })
  const [createSupplierMutation] = useMutation(CREATE_SUPPLIER, {
    onCompleted: () => refetch()
  })

  const handleCreateShop = async (variables: any) => {
    await createShopMutation({ variables })
  }

  const handleCreateSupplier = async (variables: any) => {
    await createSupplierMutation({ variables })
  }

  const navItems = [
    { id: 'Dashboard', icon: '📊' },
    { id: 'Shops', icon: '🏪' },
    { id: 'Suppliers', icon: '🚚' },
    { id: 'Inventory', icon: '📦' }
  ]

  const lowStockItems = data?.allItems?.filter((item: any) => item.isLowStock) || []

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon">AS</div>
          <span className="logo-text">ArtSpot</span>
        </div>
        <nav className="nav-menu">
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <span className="icon">{item.icon}</span>
              {item.id}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">U</div>
            <div className="user-info">
              <p className="user-name">Umesh</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="page-title">{currentTab}</h1>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder={`Search ${currentTab.toLowerCase()}...`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="top-bar-actions">
            <div className="notification-wrapper">
              <button 
                className={`btn-icon ${isNotifyOpen ? 'active' : ''}`} 
                title="Notifications"
                onClick={() => setIsNotifyOpen(!isNotifyOpen)}
              >
                🔔
                {lowStockItems.length > 0 && (
                  <span className="notification-badge">{lowStockItems.length}</span>
                )}
              </button>
              
              {isNotifyOpen && (
                <div className="notification-panel">
                  <div className="panel-header">
                    <h3>Notifications</h3>
                    <span className="badge-count">{lowStockItems.length} alerts</span>
                  </div>
                  <div className="panel-content">
                    {lowStockItems.length === 0 ? (
                      <div className="empty-notify">
                        <p>No new notifications</p>
                      </div>
                    ) : (
                      lowStockItems.map((item: any) => (
                        <div key={item.id} className="notify-item">
                          <div className="notify-icon critical">🚨</div>
                          <div className="notify-info">
                            <p className="notify-text">
                              <strong>{item?.name}</strong> is low on stock at <strong>{item?.shop?.name || 'Unknown Store'}</strong>
                            </p>
                            <p className="notify-sub">Only {item?.quantityInStock} units remaining</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">
          <Dashboard 
            currentTab={currentTab} 
            searchTerm={searchTerm} 
            loading={loading}
            error={error}
            data={data}
            onCreateShop={handleCreateShop}
            onCreateSupplier={handleCreateSupplier}
          />
        </div>
      </main>

      <style>{`
        .notification-wrapper {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 10px;
          border: 2px solid white;
          min-width: 18px;
          text-align: center;
        }

        .notification-panel {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 320px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
          border: 1px solid #f3f4f6;
          z-index: 1000;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .panel-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .badge-count {
          font-size: 11px;
          font-weight: 700;
          background: #fee2e2;
          color: #991b1b;
          padding: 2px 8px;
          border-radius: 10px;
          text-transform: uppercase;
        }

        .panel-content {
          max-height: 400px;
          overflow-y: auto;
          padding: 8px;
        }

        .empty-notify {
          padding: 40px 20px;
          text-align: center;
          color: #9ca3af;
        }

        .notify-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          transition: background 0.2s;
          cursor: pointer;
        }

        .notify-item:hover {
          background: #f9fafb;
        }

        .notify-icon {
          width: 36px;
          height: 36px;
          background: #fee2e2;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 18px;
        }

        .notify-info {
          flex: 1;
        }

        .notify-text {
          margin: 0;
          font-size: 13px;
          color: #1f2937;
          line-height: 1.4;
        }

        .notify-sub {
          margin: 4px 0 0;
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }

        .btn-icon.active {
          background: #f3f4f6;
          color: #7c3aed;
        }
      `}</style>
    </div>
  )
}

export default App
