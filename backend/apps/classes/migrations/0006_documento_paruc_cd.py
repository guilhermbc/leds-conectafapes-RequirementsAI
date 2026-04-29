from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('apps_classes', '0005_documento_obsoleto'),
    ]

    operations = [
        migrations.AddField(
            model_name='documento',
            name='parUC_CD',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.DO_NOTHING, related_name='documento_%(class)s_paruc_cd', to='apps_classes.documento'),
        ),
    ]
