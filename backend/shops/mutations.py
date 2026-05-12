import graphene
from .models import Shop
from .types import ShopType

class CreateShop(graphene.Mutation):
    class Arguments:
        name        = graphene.String(required=True)
        location    = graphene.String()
        owner_name  = graphene.String()
        email       = graphene.String()
        phone       = graphene.String()

    shop = graphene.Field(ShopType)

    def mutate(root, info, name, location="", owner_name="", email="", phone=""):
        shop = Shop.objects.create(
            name=name, location=location,
            owner_name=owner_name, email=email, phone=phone,
        )
        return CreateShop(shop=shop)


class UpdateShop(graphene.Mutation):
    class Arguments:
        id          = graphene.Int(required=True)
        name        = graphene.String()
        location    = graphene.String()
        owner_name  = graphene.String()
        email       = graphene.String()
        phone       = graphene.String()
        is_active   = graphene.Boolean()

    shop = graphene.Field(ShopType)

    def mutate(root, info, id, **kwargs):
        shop = Shop.objects.get(pk=id)
        for key, value in kwargs.items():
            setattr(shop, key, value)
        shop.save()
        return UpdateShop(shop=shop)


class DeleteShop(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, id):
        Shop.objects.filter(pk=id).delete()
        return DeleteShop(success=True)


class ShopMutation(graphene.ObjectType):
    create_shop = CreateShop.Field()
    update_shop = UpdateShop.Field()
    delete_shop = DeleteShop.Field()
