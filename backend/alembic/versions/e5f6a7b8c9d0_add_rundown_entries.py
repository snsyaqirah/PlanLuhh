"""add rundown entries table

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-05-13

"""
from typing import Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'rundown_entries',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('wedding_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('weddings.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('majlis', sa.Enum('AKAD_NIKAH', 'SANDING_PEREMPUAN', 'SANDING_LELAKI', name='majlisenum'), nullable=False),
        sa.Column('activity', sa.String(500), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=True),
        sa.Column('end_time', sa.Time(), nullable=True),
        sa.Column('pic', sa.String(255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.SmallInteger(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_rundown_entries_wedding_majlis', 'rundown_entries', ['wedding_id', 'majlis'])


def downgrade() -> None:
    op.drop_index('ix_rundown_entries_wedding_majlis', table_name='rundown_entries')
    op.drop_table('rundown_entries')
    op.execute("DROP TYPE IF EXISTS majlisenum")
