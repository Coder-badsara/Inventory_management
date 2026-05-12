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
