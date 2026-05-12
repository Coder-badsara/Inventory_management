# Inventory Management System — Gemini CLI Build Instructions

> **Stack:** Python · Django · Graphene-Django (GraphQL) · SQLite (dev) · Django Signals (alerts)

---

## Project Overview

Build a full-featured **Inventory Management System** where each Shop manages its own
InventoryItems sourced from Suppliers. The backend exposes a **GraphQL API** (no REST).
Bonus features include stock tracking, product quantities, and low-stock alerts via
Django signals.

---

## Phase 1 — Project Scaffolding

### 1.1 Create the Django project

```bash
mkdir inventory_system && cd inventory_system
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install django graphene-django django-filter
pip freeze > requirements.txt
django-admin startproject core .
```

### 1.2 Create the apps

```bash
python manage.py startapp shops
python manage.py startapp inventory
python manage.py startapp suppliers
```

### 1.3 Register apps in `core/settings.py`

```python
INSTALLED_APPS = [
    # Django defaults ...
    "django.contrib.staticfiles",

    # Third-party
    "graphene_django",
    "django_filters",

    # Local
    "shops",
    "inventory",
    "suppliers",
]

GRAPHENE = {
    "SCHEMA": "core.schema.schema"
}
```

---

## Phase 2 — Models

### 2.1 `suppliers/models.py`

```python
from django.db import models

class Supplier(models.Model):
    name            = models.CharField(max_length=255)
    contact_email   = models.EmailField(unique=True)
    phone           = models.CharField(max_length=20, blank=True)
    address         = models.TextField(blank=True)
    is_active       = models.BooleanField(default=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
```

### 2.2 `shops/models.py`

```python
from django.db import models

class Shop(models.Model):
    name        = models.CharField(max_length=255)
    location    = models.CharField(max_length=255, blank=True)
    owner_name  = models.CharField(max_length=255, blank=True)
    email       = models.EmailField(blank=True)
    phone       = models.CharField(max_length=20, blank=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
```

### 2.3 `inventory/models.py`

```python
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

LOW_STOCK_THRESHOLD_DEFAULT = 10


class InventoryItem(models.Model):
    class Category(models.TextChoices):
        ELECTRONICS  = "electronics",  "Electronics"
        CLOTHING     = "clothing",     "Clothing"
        FOOD         = "food",         "Food & Beverage"
        FURNITURE    = "furniture",    "Furniture"
        STATIONERY   = "stationery",   "Stationery"
        OTHER        = "other",        "Other"

    # Relationships
    shop     = models.ForeignKey(
        "shops.Shop",
        on_delete=models.CASCADE,
        related_name="inventory_items",
    )
    supplier = models.ForeignKey(
        "suppliers.Supplier",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="supplied_items",
    )

    # Core fields
    name                = models.CharField(max_length=255)
    sku                 = models.CharField(max_length=100, unique=True)
    description         = models.TextField(blank=True)
    category            = models.CharField(
                            max_length=50,
                            choices=Category.choices,
                            default=Category.OTHER,
                          )
    unit_price          = models.DecimalField(max_digits=10, decimal_places=2)

    # Stock tracking
    quantity_in_stock   = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=LOW_STOCK_THRESHOLD_DEFAULT)
    is_low_stock        = models.BooleanField(default=False, editable=False)

    # Audit
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.sku})"

    def check_low_stock(self):
        return self.quantity_in_stock <= self.low_stock_threshold


class StockMovement(models.Model):
    """Tracks every change in quantity (in / out / adjustment)."""

    class MovementType(models.TextChoices):
        IN          = "in",         "Stock In"
        OUT         = "out",        "Stock Out"
        ADJUSTMENT  = "adjustment", "Adjustment"

    item        = models.ForeignKey(
                    InventoryItem,
                    on_delete=models.CASCADE,
                    related_name="movements",
                  )
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity      = models.IntegerField()          # positive = in, negative = out
    note          = models.TextField(blank=True)
    recorded_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.movement_type} | {self.item.sku} | qty={self.quantity}"


# ── Signals ──────────────────────────────────────────────────────────────────

@receiver(post_save, sender=InventoryItem)
def update_low_stock_flag(sender, instance, **kwargs):
    """Automatically flip is_low_stock and print a console alert."""
    flag = instance.check_low_stock()
    if flag != instance.is_low_stock:
        # avoid recursive save
        InventoryItem.objects.filter(pk=instance.pk).update(is_low_stock=flag)
        if flag:
            print(
                f"[LOW STOCK ALERT] '{instance.name}' (SKU: {instance.sku}) "
                f"in shop '{instance.shop.name}' — only {instance.quantity_in_stock} units left!"
            )
```

### 2.4 Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Phase 3 — GraphQL Types

### 3.1 `suppliers/types.py`

```python
import graphene
from graphene_django import DjangoObjectType
from .models import Supplier

class SupplierType(DjangoObjectType):
    class Meta:
        model  = Supplier
        fields = "__all__"
```

### 3.2 `shops/types.py`

```python
import graphene
from graphene_django import DjangoObjectType
from .models import Shop

class ShopType(DjangoObjectType):
    class Meta:
        model  = Shop
        fields = "__all__"
```

### 3.3 `inventory/types.py`

```python
import graphene
from graphene_django import DjangoObjectType
from .models import InventoryItem, StockMovement

class StockMovementType(DjangoObjectType):
    class Meta:
        model  = StockMovement
        fields = "__all__"

class InventoryItemType(DjangoObjectType):
    class Meta:
        model  = InventoryItem
        fields = "__all__"
```

---

## Phase 4 — GraphQL Queries

### 4.1 `suppliers/queries.py`

```python
import graphene
from .types import SupplierType
from .models import Supplier

class SupplierQuery(graphene.ObjectType):
    all_suppliers   = graphene.List(SupplierType)
    supplier_by_id  = graphene.Field(SupplierType, id=graphene.Int(required=True))

    def resolve_all_suppliers(root, info):
        return Supplier.objects.all()

    def resolve_supplier_by_id(root, info, id):
        try:
            return Supplier.objects.get(pk=id)
        except Supplier.DoesNotExist:
            return None
```

### 4.2 `shops/queries.py`

```python
import graphene
from .types import ShopType
from .models import Shop

class ShopQuery(graphene.ObjectType):
    all_shops   = graphene.List(ShopType)
    shop_by_id  = graphene.Field(ShopType, id=graphene.Int(required=True))

    def resolve_all_shops(root, info):
        return Shop.objects.all()

    def resolve_shop_by_id(root, info, id):
        try:
            return Shop.objects.get(pk=id)
        except Shop.DoesNotExist:
            return None
```

### 4.3 `inventory/queries.py`

```python
import graphene
from .types import InventoryItemType, StockMovementType
from .models import InventoryItem, StockMovement

class InventoryQuery(graphene.ObjectType):
    all_items        = graphene.List(InventoryItemType)
    item_by_id       = graphene.Field(InventoryItemType, id=graphene.Int(required=True))
    item_by_sku      = graphene.Field(InventoryItemType, sku=graphene.String(required=True))
    low_stock_items  = graphene.List(InventoryItemType)
    items_by_shop    = graphene.List(InventoryItemType, shop_id=graphene.Int(required=True))
    stock_movements  = graphene.List(StockMovementType, item_id=graphene.Int(required=True))

    def resolve_all_items(root, info):
        return InventoryItem.objects.select_related("shop", "supplier").all()

    def resolve_item_by_id(root, info, id):
        try:
            return InventoryItem.objects.get(pk=id)
        except InventoryItem.DoesNotExist:
            return None

    def resolve_item_by_sku(root, info, sku):
        try:
            return InventoryItem.objects.get(sku=sku)
        except InventoryItem.DoesNotExist:
            return None

    def resolve_low_stock_items(root, info):
        return InventoryItem.objects.filter(is_low_stock=True)

    def resolve_items_by_shop(root, info, shop_id):
        return InventoryItem.objects.filter(shop_id=shop_id)

    def resolve_stock_movements(root, info, item_id):
        return StockMovement.objects.filter(item_id=item_id).order_by("-recorded_at")
```

---

## Phase 5 — GraphQL Mutations

### 5.1 `suppliers/mutations.py`

```python
import graphene
from .models import Supplier
from .types import SupplierType

class CreateSupplier(graphene.Mutation):
    class Arguments:
        name          = graphene.String(required=True)
        contact_email = graphene.String(required=True)
        phone         = graphene.String()
        address       = graphene.String()

    supplier = graphene.Field(SupplierType)

    def mutate(root, info, name, contact_email, phone="", address=""):
        supplier = Supplier.objects.create(
            name=name, contact_email=contact_email,
            phone=phone, address=address,
        )
        return CreateSupplier(supplier=supplier)


class UpdateSupplier(graphene.Mutation):
    class Arguments:
        id            = graphene.Int(required=True)
        name          = graphene.String()
        contact_email = graphene.String()
        phone         = graphene.String()
        address       = graphene.String()
        is_active     = graphene.Boolean()

    supplier = graphene.Field(SupplierType)

    def mutate(root, info, id, **kwargs):
        supplier = Supplier.objects.get(pk=id)
        for key, value in kwargs.items():
            setattr(supplier, key, value)
        supplier.save()
        return UpdateSupplier(supplier=supplier)


class DeleteSupplier(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, id):
        Supplier.objects.filter(pk=id).delete()
        return DeleteSupplier(success=True)


class SupplierMutation(graphene.ObjectType):
    create_supplier = CreateSupplier.Field()
    update_supplier = UpdateSupplier.Field()
    delete_supplier = DeleteSupplier.Field()
```

### 5.2 `shops/mutations.py`

```python
import graphene
from .models import Shop
from .types import ShopType

class CreateShop(graphene.Mutation):
    class Arguments:
        name        = graphene.String(required=True)
        location    = graphene.String()
        owner_name  = graphene.String()
        email       = graphene.String()
        phone       = graphene.String()

    shop = graphene.Field(ShopType)

    def mutate(root, info, name, location="", owner_name="", email="", phone=""):
        shop = Shop.objects.create(
            name=name, location=location,
            owner_name=owner_name, email=email, phone=phone,
        )
        return CreateShop(shop=shop)


class UpdateShop(graphene.Mutation):
    class Arguments:
        id          = graphene.Int(required=True)
        name        = graphene.String()
        location    = graphene.String()
        owner_name  = graphene.String()
        email       = graphene.String()
        phone       = graphene.String()
        is_active   = graphene.Boolean()

    shop = graphene.Field(ShopType)

    def mutate(root, info, id, **kwargs):
        shop = Shop.objects.get(pk=id)
        for key, value in kwargs.items():
            setattr(shop, key, value)
        shop.save()
        return UpdateShop(shop=shop)


class DeleteShop(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, id):
        Shop.objects.filter(pk=id).delete()
        return DeleteShop(success=True)


class ShopMutation(graphene.ObjectType):
    create_shop = CreateShop.Field()
    update_shop = UpdateShop.Field()
    delete_shop = DeleteShop.Field()
```

### 5.3 `inventory/mutations.py`

```python
import graphene
from .models import InventoryItem, StockMovement
from .types import InventoryItemType, StockMovementType

class CreateInventoryItem(graphene.Mutation):
    class Arguments:
        shop_id             = graphene.Int(required=True)
        supplier_id         = graphene.Int()
        name                = graphene.String(required=True)
        sku                 = graphene.String(required=True)
        description         = graphene.String()
        category            = graphene.String()
        unit_price          = graphene.Decimal(required=True)
        quantity_in_stock   = graphene.Int()
        low_stock_threshold = graphene.Int()

    item = graphene.Field(InventoryItemType)

    def mutate(root, info, shop_id, name, sku, unit_price, **kwargs):
        item = InventoryItem.objects.create(
            shop_id=shop_id, name=name, sku=sku, unit_price=unit_price, **kwargs
        )
        return CreateInventoryItem(item=item)


class UpdateInventoryItem(graphene.Mutation):
    class Arguments:
        id                  = graphene.Int(required=True)
        name                = graphene.String()
        description         = graphene.String()
        category            = graphene.String()
        unit_price          = graphene.Decimal()
        low_stock_threshold = graphene.Int()
        supplier_id         = graphene.Int()
        is_active           = graphene.Boolean()

    item = graphene.Field(InventoryItemType)

    def mutate(root, info, id, **kwargs):
        item = InventoryItem.objects.get(pk=id)
        for key, value in kwargs.items():
            setattr(item, key, value)
        item.save()
        return UpdateInventoryItem(item=item)


class DeleteInventoryItem(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, id):
        InventoryItem.objects.filter(pk=id).delete()
        return DeleteInventoryItem(success=True)


class AdjustStock(graphene.Mutation):
    """Add or remove stock and record the movement."""

    class Arguments:
        item_id       = graphene.Int(required=True)
        quantity      = graphene.Int(required=True)   # positive = in, negative = out
        movement_type = graphene.String(required=True) # "in" | "out" | "adjustment"
        note          = graphene.String()

    item     = graphene.Field(InventoryItemType)
    movement = graphene.Field(StockMovementType)

    def mutate(root, info, item_id, quantity, movement_type, note=""):
        item = InventoryItem.objects.get(pk=item_id)
        item.quantity_in_stock = max(0, item.quantity_in_stock + quantity)
        item.save()                               # triggers low-stock signal

        movement = StockMovement.objects.create(
            item=item,
            movement_type=movement_type,
            quantity=quantity,
            note=note,
        )
        return AdjustStock(item=item, movement=movement)


class InventoryMutation(graphene.ObjectType):
    create_inventory_item  = CreateInventoryItem.Field()
    update_inventory_item  = UpdateInventoryItem.Field()
    delete_inventory_item  = DeleteInventoryItem.Field()
    adjust_stock           = AdjustStock.Field()
```

---

## Phase 6 — Root Schema

### 6.1 `core/schema.py`

```python
import graphene
from suppliers.queries   import SupplierQuery
from shops.queries       import ShopQuery
from inventory.queries   import InventoryQuery
from suppliers.mutations import SupplierMutation
from shops.mutations     import ShopMutation
from inventory.mutations import InventoryMutation


class Query(
    SupplierQuery,
    ShopQuery,
    InventoryQuery,
    graphene.ObjectType,
):
    pass


class Mutation(
    SupplierMutation,
    ShopMutation,
    InventoryMutation,
    graphene.ObjectType,
):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
```

---

## Phase 7 — URL Configuration

### 7.1 `core/urls.py`

```python
from django.contrib import admin
from django.urls import path
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path("admin/",    admin.site.urls),
    path("graphql/",  csrf_exempt(GraphQLView.as_view(graphiql=True))),
]
```

---

## Phase 8 — Admin Registration

### 8.1 `suppliers/admin.py`

```python
from django.contrib import admin
from .models import Supplier

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display  = ("name", "contact_email", "phone", "is_active", "created_at")
    search_fields = ("name", "contact_email")
    list_filter   = ("is_active",)
```

### 8.2 `shops/admin.py`

```python
from django.contrib import admin
from .models import Shop

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display  = ("name", "location", "owner_name", "is_active", "created_at")
    search_fields = ("name", "location", "owner_name")
    list_filter   = ("is_active",)
```

### 8.3 `inventory/admin.py`

```python
from django.contrib import admin
from .models import InventoryItem, StockMovement

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display   = ("name", "sku", "shop", "supplier", "quantity_in_stock",
                      "low_stock_threshold", "is_low_stock", "unit_price")
    search_fields  = ("name", "sku")
    list_filter    = ("shop", "supplier", "category", "is_low_stock")
    readonly_fields = ("is_low_stock", "created_at", "updated_at")

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display  = ("item", "movement_type", "quantity", "recorded_at")
    list_filter   = ("movement_type",)
    search_fields = ("item__sku", "item__name")
```

---

## Phase 9 — Seed Data (Optional but Recommended)

Create `core/management/commands/seed.py`:

```
core/
  management/
    __init__.py
    commands/
      __init__.py
      seed.py
```

```python
from django.core.management.base import BaseCommand
from suppliers.models import Supplier
from shops.models import Shop
from inventory.models import InventoryItem

class Command(BaseCommand):
    help = "Seed the database with sample data"

    def handle(self, *args, **kwargs):
        s1 = Supplier.objects.create(name="TechSource Ltd",  contact_email="tech@source.com", phone="9001234567")
        s2 = Supplier.objects.create(name="OfficeWorld",     contact_email="supply@office.com", phone="9009876543")

        shop1 = Shop.objects.create(name="Main Street Store",  location="Delhi",  owner_name="Amit Sharma")
        shop2 = Shop.objects.create(name="Central Depot",      location="Jaipur", owner_name="Priya Singh")

        InventoryItem.objects.create(
            shop=shop1, supplier=s1, name="Wireless Mouse", sku="WM-001",
            category="electronics", unit_price=599.00, quantity_in_stock=5, low_stock_threshold=10,
        )
        InventoryItem.objects.create(
            shop=shop1, supplier=s2, name="A4 Paper Ream", sku="PP-100",
            category="stationery", unit_price=250.00, quantity_in_stock=50, low_stock_threshold=15,
        )
        InventoryItem.objects.create(
            shop=shop2, supplier=s1, name="USB-C Hub", sku="HB-007",
            category="electronics", unit_price=1299.00, quantity_in_stock=3, low_stock_threshold=5,
        )

        self.stdout.write(self.style.SUCCESS("✅  Database seeded successfully."))
```

Run seed:

```bash
python manage.py seed
```

---

## Phase 10 — Run & Verify

```bash
python manage.py createsuperuser
python manage.py runserver
```

| URL | Purpose |
|-----|---------|
| `http://127.0.0.1:8000/graphql/` | GraphiQL interactive playground |
| `http://127.0.0.1:8000/admin/`   | Django admin panel |

---

## Sample GraphQL Operations

### Query — All low-stock items

```graphql
query {
  lowStockItems {
    id
    name
    sku
    quantityInStock
    lowStockThreshold
    shop { name location }
    supplier { name contactEmail }
  }
}
```

### Query — Items by shop

```graphql
query {
  itemsByShop(shopId: 1) {
    name
    sku
    quantityInStock
    isLowStock
    unitPrice
  }
}
```

### Mutation — Create a shop

```graphql
mutation {
  createShop(name: "West End Shop", location: "Mumbai", ownerName: "Raj Kumar") {
    shop { id name location }
  }
}
```

### Mutation — Adjust stock (triggers low-stock alert)

```graphql
mutation {
  adjustStock(itemId: 1, quantity: -4, movementType: "out", note: "Sold to customer") {
    item { name quantityInStock isLowStock }
    movement { movementType quantity recordedAt }
  }
}
```

### Mutation — Create an inventory item

```graphql
mutation {
  createInventoryItem(
    shopId: 1
    supplierId: 1
    name: "Mechanical Keyboard"
    sku: "KB-2024"
    category: "electronics"
    unitPrice: "2499.00"
    quantityInStock: 20
    lowStockThreshold: 5
  ) {
    item { id name sku unitPrice isLowStock }
  }
}
```

---

## Project File Structure (Final)

```
inventory_system/
├── core/
│   ├── settings.py
│   ├── urls.py
│   ├── schema.py                  ← root GraphQL schema
│   └── management/
│       └── commands/
│           └── seed.py
├── shops/
│   ├── models.py
│   ├── types.py
│   ├── queries.py
│   ├── mutations.py
│   └── admin.py
├── inventory/
│   ├── models.py                  ← StockMovement + signals
│   ├── types.py
│   ├── queries.py
│   ├── mutations.py
│   └── admin.py
├── suppliers/
│   ├── models.py
│   ├── types.py
│   ├── queries.py
│   ├── mutations.py
│   └── admin.py
├── requirements.txt
└── manage.py
```

---

## Key Design Decisions

| Decision | Reason |
|----------|--------|
| `graphene-django` | Mature, Pythonic GraphQL library for Django |
| `StockMovement` model | Full audit trail for every quantity change |
| `post_save` signal | Automatic low-stock detection on every save/adjust |
| `select_related` in queries | Prevents N+1 query problems |
| `AdjustStock` mutation | Single mutation handles in / out / adjustments |
| SQLite for dev | Zero-config; swap to PostgreSQL for production via `DATABASE_URL` |

---

*Generated for Gemini CLI — execute phases in order, each phase builds on the previous one.*
