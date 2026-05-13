"""add hantaran items table

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-05-13

"""
from typing import Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'f6a7b8c9d0e1'
down_revision: Union[str, None] = 'e5f6a7b8c9d0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'hantaran_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('wedding_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('weddings.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('side', sa.Enum('LELAKI', 'PEREMPUAN', name='hantaransideenum'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('category', sa.Enum('WANG_HANTARAN', 'MAS_KAHWIN', 'BARANG_KEMAS', 'PAKAIAN', 'KOSMETIK', 'MAKANAN', 'AKSESORI', 'LAIN_LAIN', name='hantarancategoryenum'), nullable=False, server_default='LAIN_LAIN'),
        sa.Column('dulang_number', sa.Integer(), nullable=True),
        sa.Column('item_status', sa.Enum('BELUM_BELI', 'DAH_BELI', 'SUDAH_GUBAH', 'SIAP', name='hantaranstatusenum'), nullable=False, server_default='BELUM_BELI'),
        sa.Column('estimated_cost', sa.Numeric(10, 2), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.SmallInteger(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_hantaran_items_wedding_side', 'hantaran_items', ['wedding_id', 'side'])


def downgrade() -> None:
    op.drop_index('ix_hantaran_items_wedding_side', table_name='hantaran_items')
    op.drop_table('hantaran_items')
    op.execute("DROP TYPE IF EXISTS hantaranstatusenum")
    op.execute("DROP TYPE IF EXISTS hantarancategoryenum")
    op.execute("DROP TYPE IF EXISTS hantaransideenum")
