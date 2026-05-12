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
