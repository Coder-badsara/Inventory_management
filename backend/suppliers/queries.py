import graphene
from .types import SupplierType
from .models import Supplier

class SupplierQuery(graphene.ObjectType):
    all_suppliers   = graphene.List(SupplierType)
    supplier_by_id  = graphene.Field(SupplierType, id=graphene.Int(required=True))

    def resolve_all_suppliers(root, info):
        return Supplier.objects.all()

    def resolve_supplier_by_id(root, info, id):
        try:
            return Supplier.objects.get(pk=id)
        except Supplier.DoesNotExist:
            return None
