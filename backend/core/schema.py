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
