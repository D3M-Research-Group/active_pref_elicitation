# Generated by Django 3.2.6 on 2021-09-23 21:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('APE', '0005_auto_20210923_2108'),
    ]

    operations = [
        migrations.AddField(
            model_name='choices',
            name='prediction',
            field=models.CharField(default='test', max_length=20),
            preserve_default=False,
        ),
    ]
