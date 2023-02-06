# Generated by Django 4.0 on 2022-04-04 23:49

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Choices',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_id', models.CharField(max_length=50, verbose_name='Session ID')),
                ('question_num', models.PositiveIntegerField(verbose_name='Question Number')),
                ('policy_a', models.PositiveIntegerField()),
                ('policy_b', models.PositiveIntegerField()),
                ('policy_dataset', models.CharField(max_length=50)),
                ('user_choice', models.CharField(max_length=20)),
                ('prediction', models.CharField(max_length=20)),
                ('recommended_item', models.PositiveIntegerField(null=True)),
                ('algorithm_stage', models.CharField(max_length=50, verbose_name='algorithm stage')),
                ('time_on_page', models.FloatField(verbose_name='Time Spent on Question (seconds)')),
                ('gamma', models.FloatField(verbose_name='Gamma value')),
                ('problem_type', models.CharField(max_length=20)),
                ('u0_type', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='FormInfo',
            fields=[
                ('session_id', models.CharField(max_length=50, primary_key=True, serialize=False, verbose_name='session_id')),
                ('turker_id', models.CharField(max_length=100, null=True)),
                ('age', models.CharField(max_length=15)),
                ('race_ethnicity', models.CharField(max_length=100)),
                ('gender', models.CharField(max_length=20)),
                ('marital_status', models.CharField(max_length=100)),
                ('education', models.CharField(max_length=100)),
                ('political', models.CharField(max_length=100)),
                ('positive_family', models.CharField(max_length=10, null=True)),
                ('positive_anyone', models.CharField(max_length=10, null=True)),
                ('healthcare_yn', models.CharField(max_length=10, null=True)),
                ('healthcare_role', models.CharField(max_length=10, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='MemoryWipeInfo',
            fields=[
                ('session_id', models.CharField(max_length=50, primary_key=True, serialize=False, verbose_name='session_id')),
                ('question_1', models.CharField(max_length=80)),
                ('question_2', models.CharField(max_length=80)),
                ('question_3', models.CharField(max_length=80)),
            ],
        ),
        migrations.CreateModel(
            name='SessionInfo',
            fields=[
                ('session_id', models.CharField(max_length=50, primary_key=True, serialize=False, verbose_name='session_id')),
                ('time_submitted', models.DateTimeField(auto_now_add=True, verbose_name='date test taken')),
                ('mturker', models.BooleanField(default=False)),
            ],
        ),
    ]
