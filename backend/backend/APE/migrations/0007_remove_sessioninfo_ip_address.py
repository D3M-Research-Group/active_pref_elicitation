# Generated by Django 3.2.6 on 2021-09-25 22:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('APE', '0006_choices_prediction'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sessioninfo',
            name='ip_address',
        ),
    ]
