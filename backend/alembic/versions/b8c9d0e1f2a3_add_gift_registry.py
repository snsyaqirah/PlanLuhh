"""add gift registry

Revision ID: b8c9d0e1f2a3
Revises: a7b8c9d0e1f2
Create Date: 2026-05-13 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = 'b8c9d0e1f2a3'
down_revision = 'a7b8c9d0e1f2'
branch_labels = None
depends_on = None


def upgrade() -> None:

    op.create_table(
        'gift_registry_items',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('wedding_id', UUID(as_uuid=True), sa.ForeignKey('weddings.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('item_name', sa.String(255), nullable=False),
        sa.Column('item_link', sa.String(500), nullable=True),
        sa.Column('target_quantity', sa.Integer, nullable=False, server_default='1'),
        sa.Column('claimed_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('is_visible', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('notes', sa.String(500), nullable=True),
        sa.Column('status', sa.Integer, nullable=False, server_default='1'),
    )

    op.create_table(
        'gifts_received',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('wedding_id', UUID(as_uuid=True), sa.ForeignKey('weddings.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('donor_name', sa.String(255), nullable=True),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('amount_encrypted', sa.Text, nullable=True),
        sa.Column('gift_type', sa.String(30), nullable=False, server_default='PHYSICAL'),
        sa.Column('registry_item_id', UUID(as_uuid=True), sa.ForeignKey('gift_registry_items.id', ondelete='SET NULL'), nullable=True),
        sa.Column('thank_you_sent', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('date_received', sa.Date, nullable=True),
        sa.Column('status', sa.Integer, nullable=False, server_default='1'),
    )


def downgrade() -> None:
    op.drop_table('gifts_received')
    op.drop_table('gift_registry_items')
    op.execute("DROP TYPE IF EXISTS gifttypeenum")
