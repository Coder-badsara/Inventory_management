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
