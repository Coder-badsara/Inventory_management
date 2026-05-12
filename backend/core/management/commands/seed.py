from django.core.management.base import BaseCommand
from suppliers.models import Supplier
from shops.models import Shop
from inventory.models import InventoryItem
import random

class Command(BaseCommand):
    help = "Seed the database with sample data"

    def handle(self, *args, **kwargs):
        # Clear existing data to avoid duplicates if re-run
        InventoryItem.objects.all().delete()
        Shop.objects.all().delete()
        Supplier.objects.all().delete()

        # 1. Create Suppliers (6 total) with full details
        s1 = Supplier.objects.create(
            name="TechSource Solutions",
            contact_email="enquiry@techsource.com",
            phone="+91 22 6677 8899",
            address="Building 4, SEEPZ-SEZ, Andheri East, Mumbai - 400096"
        )
        s2 = Supplier.objects.create(
            name="Global Office World",
            contact_email="sales@officeworld.in",
            phone="+91 11 2345 6789",
            address="A-12, Okhla Industrial Estate Phase III, New Delhi - 110020"
        )
        s3 = Supplier.objects.create(
            name="Creative Arts Co.",
            contact_email="support@creativearts.co",
            phone="+91 80 4455 1234",
            address="Level 2, Brigade Tech Park, Whitefield, Bangalore - 560066"
        )
        s4 = Supplier.objects.create(
            name="Elite Furniture Mart",
            contact_email="contact@elitefurniture.net",
            phone="+91 44 2828 4545",
            address="Plot 56, Guindy Industrial Estate, Chennai - 600032"
        )
        s5 = Supplier.objects.create(
            name="Rapid Logistics & Supplies",
            contact_email="ops@rapidlogistics.com",
            phone="+91 20 2712 3456",
            address="Survey No. 123, Hinjewadi Phase 1, Pune - 411057"
        )
        s6 = Supplier.objects.create(
            name="Apex Electronics Ltd",
            contact_email="info@apexelectronics.com",
            phone="+91 40 2300 1122",
            address="HITEC City, Madhapur, Hyderabad - 500081"
        )
        suppliers = [s1, s2, s3, s4, s5, s6]

        # 2. Create Shops (5 total) with full details
        shop1 = Shop.objects.create(
            name="Main Street Store",
            location="123 Main Street, Connaught Place, New Delhi - 110001",
            owner_name="Amit Sharma",
            email="amit.sharma@mainstreetstore.com",
            phone="+91 98123 45678"
        )
        shop2 = Shop.objects.create(
            name="Central Depot",
            location="Plot 45, Industrial Area Phase II, Jaipur - 302004",
            owner_name="Priya Singh",
            email="priya.singh@centraldepot.in",
            phone="+91 94123 98765"
        )
        shop3 = Shop.objects.create(
            name="West End Boutique",
            location="7th Floor, Infinity Mall, Link Road, Andheri West, Mumbai - 400053",
            owner_name="Raj Kumar",
            email="raj.kumar@westendboutique.com",
            phone="+91 92123 55501"
        )
        shop4 = Shop.objects.create(
            name="North Gate Mart",
            location="Shop 12, Sector 17-C, Chandigarh - 160017",
            owner_name="Sonia Verma",
            email="sonia.verma@northgatemart.co",
            phone="+91 90123 66602"
        )
        shop5 = Shop.objects.create(
            name="South Park Outlet",
            location="56 South End Circle, Jayanagar, Bangalore - 560011",
            owner_name="Karthik Raja",
            email="karthik.raja@southparkoutlet.net",
            phone="+91 88123 77703"
        )
        shops = [shop1, shop2, shop3, shop4, shop5]

        # 3. Create Inventory Items (33 total)
        item_templates = [
            ("Mechanical Keyboard", "electronics", 2499, 15, 5),
            ("LED Monitor 24\"", "electronics", 8500, 8, 3),
            ("Ergonomic Chair", "furniture", 12000, 4, 2),
            ("Standing Desk", "furniture", 18500, 2, 1),
            ("Notebook Pack", "stationery", 450, 100, 20),
            ("Premium Ink Pens", "stationery", 1200, 40, 10),
            ("Canvas Set (5pcs)", "other", 1800, 12, 5),
            ("Acrylic Paint Set", "other", 950, 25, 8),
            ("Office Stapler", "stationery", 350, 60, 15),
            ("Desk Lamp", "furniture", 1500, 18, 5),
            ("Smartphone Case", "electronics", 499, 50, 15),
            ("Bluetooth Speaker", "electronics", 3200, 10, 4),
            ("Sketchbook A4", "stationery", 650, 30, 10),
            ("Graphite Pencils", "stationery", 200, 200, 30),
            ("Wall Clock", "furniture", 1100, 7, 2),
            ("File Organizer", "stationery", 850, 22, 5),
            ("Power Bank 10k", "electronics", 1400, 12, 5),
            ("HDMI Cable 3m", "electronics", 450, 45, 10),
            ("Whiteboard Marker", "stationery", 80, 150, 40),
            ("Tape Dispenser", "stationery", 220, 35, 10),
            ("Artist Brushes", "other", 550, 60, 15),
            ("Artist Easel", "other", 3200, 5, 2),
            ("Oil Pastel Set", "other", 750, 25, 8),
            ("Canvas Rolls", "other", 4500, 10, 3),
            ("Pottery Wheel", "other", 15000, 2, 1),
            ("Charcoal Pencil Set", "other", 850, 15, 5),
            ("Watercolor Palette", "other", 1200, 20, 5),
            ("Calligraphy Set", "other", 2500, 10, 3),
            ("Clutter Tray", "other", 350, 50, 10),
            ("Paper Cutter", "stationery", 1800, 12, 4),
            ("Wireless Mouse", "electronics", 599.00, 5, 10),
            ("A4 Paper Ream", "stationery", 250.00, 50, 15),
            ("USB-C Hub", "electronics", 1299.00, 3, 5),
        ]

        for i, (name, cat, price, qty, low) in enumerate(item_templates):
            InventoryItem.objects.create(
                shop=random.choice(shops),
                supplier=random.choice(suppliers),
                name=name,
                sku=f"SKU-{1000 + i}",
                category=cat,
                unit_price=price,
                quantity_in_stock=qty,
                low_stock_threshold=low,
            )

        self.stdout.write(self.style.SUCCESS(f"✅ Database seeded with {Supplier.objects.count()} suppliers, {Shop.objects.count()} shops, and {InventoryItem.objects.count()} items."))
