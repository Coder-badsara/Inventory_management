import graphene
from graphene_django import DjangoObjectType
from .models import Supplier

class SupplierType(DjangoObjectType):
    class Meta:
        model  = Supplier
        fields = "__all__"
