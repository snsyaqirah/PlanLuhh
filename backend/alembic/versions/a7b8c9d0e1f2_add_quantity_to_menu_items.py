"""add quantity to menu items

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-05-13

"""
from typing import Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a7b8c9d0e1f2'
down_revision: Union[str, None] = 'f6a7b8c9d0e1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('menu_items', sa.Column('quantity', sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column('menu_items', 'quantity')
