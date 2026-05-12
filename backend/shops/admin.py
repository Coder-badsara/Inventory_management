from django.contrib import admin
from .models import Shop

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display  = ("name", "location", "owner_name", "is_active", "created_at")
    search_fields = ("name", "location", "owner_name")
    list_filter   = ("is_active",)
