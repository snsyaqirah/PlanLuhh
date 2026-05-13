"""add_currency_and_guardians

Revision ID: a1b2c3d4e5f6
Revises: 531105830bf3
Create Date: 2026-05-13 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '531105830bf3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('preferred_currency', sa.String(length=10), nullable=False, server_default='MYR'))
    op.add_column('weddings', sa.Column('groom_father_name', sa.String(length=255), nullable=True))
    op.add_column('weddings', sa.Column('groom_mother_name', sa.String(length=255), nullable=True))
    op.add_column('weddings', sa.Column('bride_father_name', sa.String(length=255), nullable=True))
    op.add_column('weddings', sa.Column('bride_mother_name', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('weddings', 'bride_mother_name')
    op.drop_column('weddings', 'bride_father_name')
    op.drop_column('weddings', 'groom_mother_name')
    op.drop_column('weddings', 'groom_father_name')
    op.drop_column('users', 'preferred_currency')
