# Generated by Django 4.0 on 2021-12-21 04:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('APE', '0009_choices_recommended_item'),
    ]

    operations = [
        migrations.AlterField(
            model_name='choices',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
