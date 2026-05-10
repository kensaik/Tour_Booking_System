"""add booking contact info

Revision ID: a1f3c8e7b920
Revises: 0d99bed017ef
Create Date: 2026-05-10 16:57:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1f3c8e7b920'
down_revision = '0d99bed017ef'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('bookings', schema=None) as batch_op:
        batch_op.add_column(sa.Column('contact_name', sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column('contact_email', sa.String(length=120), nullable=True))
        batch_op.add_column(sa.Column('contact_phone', sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column('notes', sa.Text(), nullable=True))


def downgrade():
    with op.batch_alter_table('bookings', schema=None) as batch_op:
        batch_op.drop_column('notes')
        batch_op.drop_column('contact_phone')
        batch_op.drop_column('contact_email')
        batch_op.drop_column('contact_name')
