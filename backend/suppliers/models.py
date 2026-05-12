from django.db import models

class Supplier(models.Model):
    name            = models.CharField(max_length=255)
    contact_email   = models.EmailField(unique=True)
    phone           = models.CharField(max_length=20, blank=True)
    address         = models.TextField(blank=True)
    is_active       = models.BooleanField(default=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
