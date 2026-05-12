from django.contrib import admin
from .models import Supplier

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display  = ("name", "contact_email", "phone", "is_active", "created_at")
    search_fields = ("name", "contact_email")
    list_filter   = ("is_active",)
