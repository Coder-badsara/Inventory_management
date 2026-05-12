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
