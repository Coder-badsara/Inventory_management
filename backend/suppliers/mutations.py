import graphene
from .models import Supplier
from .types import SupplierType

class CreateSupplier(graphene.Mutation):
    class Arguments:
        name          = graphene.String(required=True)
        contact_email = graphene.String(required=True)
        phone         = graphene.String()
        address       = graphene.String()

    supplier = graphene.Field(SupplierType)

    def mutate(root, info, name, contact_email, phone="", address=""):
        supplier = Supplier.objects.create(
            name=name, contact_email=contact_email,
            phone=phone, address=address,
        )
        return CreateSupplier(supplier=supplier)


class UpdateSupplier(graphene.Mutation):
    class Arguments:
        id            = graphene.Int(required=True)
        name          = graphene.String()
        contact_email = graphene.String()
        phone         = graphene.String()
        address       = graphene.String()
        is_active     = graphene.Boolean()

    supplier = graphene.Field(SupplierType)

    def mutate(root, info, id, **kwargs):
        supplier = Supplier.objects.get(pk=id)
        for key, value in kwargs.items():
            setattr(supplier, key, value)
        supplier.save()
        return UpdateSupplier(supplier=supplier)


class DeleteSupplier(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, id):
        Supplier.objects.filter(pk=id).delete()
        return DeleteSupplier(success=True)


class SupplierMutation(graphene.ObjectType):
    create_supplier = CreateSupplier.Field()
    update_supplier = UpdateSupplier.Field()
    delete_supplier = DeleteSupplier.Field()
