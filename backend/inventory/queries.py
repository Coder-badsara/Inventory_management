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
