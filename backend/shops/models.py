from django.db import models

class Shop(models.Model):
    name        = models.CharField(max_length=255)
    location    = models.CharField(max_length=255, blank=True)
    owner_name  = models.CharField(max_length=255, blank=True)
    email       = models.EmailField(blank=True)
    phone       = models.CharField(max_length=20, blank=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
