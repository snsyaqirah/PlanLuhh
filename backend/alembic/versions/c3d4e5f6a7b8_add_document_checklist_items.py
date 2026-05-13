"""add document checklist items table

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-05-13

"""
from typing import Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'document_checklist_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('wedding_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('weddings.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('side', sa.Enum('BOTH', 'GROOM', 'BRIDE', name='documentsideenum'), nullable=False, server_default='BOTH'),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('expiry_date', sa.Date(), nullable=True),
        sa.Column('reminder_note', sa.String(255), nullable=True),
        sa.Column('is_preset', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.SmallInteger(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_document_checklist_items_status', 'document_checklist_items', ['status'])


def downgrade() -> None:
    op.drop_index('ix_document_checklist_items_status', table_name='document_checklist_items')
    op.drop_table('document_checklist_items')
    op.execute("DROP TYPE IF EXISTS documentsideenum")
