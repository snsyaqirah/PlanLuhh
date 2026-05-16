"""add card builder config to invitations

Revision ID: c9d0e1f2a3b4
Revises: b8c9d0e1f2a3
Create Date: 2026-05-13 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'c9d0e1f2a3b4'
down_revision = 'b8c9d0e1f2a3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('invitations', sa.Column('design_id', sa.Integer, nullable=True))
    op.add_column('invitations', sa.Column('envelope_config', sa.Text, nullable=True))
    op.add_column('invitations', sa.Column('card_config', sa.Text, nullable=True))


def downgrade() -> None:
    op.drop_column('invitations', 'card_config')
    op.drop_column('invitations', 'envelope_config')
    op.drop_column('invitations', 'design_id')
