# ArtSpot - Inventory Management System

ArtSpot is a full-stack Inventory Management application designed to track and manage inventory items across multiple shops and suppliers. The system features a centralized dashboard to monitor stock levels, view low-stock notifications, and manage shops and suppliers.

## Tech Stack

**Frontend**
- **Framework:** React 19 + TypeScript + Vite
- **Data Fetching:** Apollo Client (GraphQL)
- **Styling:** Vanilla CSS
- **Linting:** ESLint with TypeScript and React plugins

**Backend**
- **Framework:** Python + Django
- **API:** Graphene-Django (GraphQL)
- **Database:** SQLite (for development)
- **Features:** Django Signals for automated low-stock alerts, Django Admin for management

## Key Features

- **Dashboard:** Unified view for navigating between Inventory, Shops, and Suppliers.
- **Stock Tracking:** Track item quantities with comprehensive movement history (stock in, stock out, adjustments).
- **Low Stock Alerts:** Automatic notifications and visual indicators when items fall below their designated thresholds.
- **GraphQL API:** Flexible and efficient querying of relations (e.g., retrieving an item along with its shop and supplier details).
- **Extensible Models:** Robust backend architecture with separate apps for `core`, `inventory`, `shops`, and `suppliers`.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python (3.10+ recommended)

### Backend Setup

1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```bash
   python manage.py migrate
   ```
5. (Optional) Seed the database with sample data:
   ```bash
   python manage.py seed
   ```
6. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   *The GraphQL Playground (GraphiQL) will be available at `http://127.0.0.1:8000/graphql/`*

### Frontend Setup

1. Open a new terminal instance and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open in your default browser, typically at `http://localhost:5173/`*

## Project Structure

```text
ArtSpot/
├── backend/
│   ├── core/           # Main Django settings, URLs, and GraphQL schema
│   ├── inventory/      # InventoryItem, StockMovement models and GraphQL types
│   ├── shops/          # Shop models, queries, and mutations
│   ├── suppliers/      # Supplier models, queries, and mutations
│   └── manage.py       # Django CLI
└── frontend/
    ├── src/
    │   ├── assets/     # Static assets like images and icons
    │   ├── components/ # React components (e.g., Dashboard.tsx)
    │   ├── lib/        # Library configurations (e.g., apollo-client.ts)
    │   ├── App.tsx     # Main application layout and top bar
    │   └── main.tsx    # React mounting point
    ├── package.json    # Frontend dependencies and scripts
    └── vite.config.ts  # Vite bundler configuration
```

## GraphQL Operations

The backend exposes a comprehensive GraphQL API. You can explore available queries and mutations via the GraphiQL interface at `/graphql/`. Common operations include:

- Querying `all_items`, `low_stock_items`, and `items_by_shop`
- Mutations to `createShop`, `createSupplier`, and `createInventoryItem`
- `adjustStock` mutation to update stock levels and trigger automated alerts
