# Generated by Django 2.0.3 on 2018-06-22 14:51

import apps.dapps.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dapps', '0002_auto_20180518_0824'),
    ]

    operations = [
        migrations.AddField(
            model_name='contract',
            name='created_at',
            field=models.DateTimeField(default=apps.dapps.models.init_time),
        ),
    ]