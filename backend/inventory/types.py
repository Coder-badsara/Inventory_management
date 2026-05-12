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
