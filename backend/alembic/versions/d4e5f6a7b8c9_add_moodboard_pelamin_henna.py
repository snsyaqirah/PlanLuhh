"""add pelamin and henna to moodboard category enum

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-05-13

"""
from typing import Union
from alembic import op

revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE moodboardcategoryenum ADD VALUE IF NOT EXISTS 'PELAMIN'")
    op.execute("ALTER TYPE moodboardcategoryenum ADD VALUE IF NOT EXISTS 'HENNA'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values — left as no-op
    pass
