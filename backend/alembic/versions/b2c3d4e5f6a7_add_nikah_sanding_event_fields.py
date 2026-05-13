"""add nikah and sanding event fields to weddings

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-13

"""
from typing import Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('weddings', sa.Column('tarikh_nikah', sa.Date(), nullable=True))
    op.add_column('weddings', sa.Column('waktu_nikah', sa.Time(), nullable=True))
    op.add_column('weddings', sa.Column('venue_nikah', sa.String(500), nullable=True))
    op.add_column('weddings', sa.Column('tema_warna_nikah', sa.String(100), nullable=True))
    op.add_column('weddings', sa.Column('tarikh_sanding_perempuan', sa.Date(), nullable=True))
    op.add_column('weddings', sa.Column('waktu_sanding_perempuan', sa.Time(), nullable=True))
    op.add_column('weddings', sa.Column('venue_sanding_perempuan', sa.String(500), nullable=True))
    op.add_column('weddings', sa.Column('tarikh_sanding_lelaki', sa.Date(), nullable=True))
    op.add_column('weddings', sa.Column('waktu_sanding_lelaki', sa.Time(), nullable=True))
    op.add_column('weddings', sa.Column('venue_sanding_lelaki', sa.String(500), nullable=True))
    op.add_column('weddings', sa.Column('tema_warna_sanding', sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column('weddings', 'tema_warna_sanding')
    op.drop_column('weddings', 'venue_sanding_lelaki')
    op.drop_column('weddings', 'waktu_sanding_lelaki')
    op.drop_column('weddings', 'tarikh_sanding_lelaki')
    op.drop_column('weddings', 'venue_sanding_perempuan')
    op.drop_column('weddings', 'waktu_sanding_perempuan')
    op.drop_column('weddings', 'tarikh_sanding_perempuan')
    op.drop_column('weddings', 'tema_warna_nikah')
    op.drop_column('weddings', 'venue_nikah')
    op.drop_column('weddings', 'waktu_nikah')
    op.drop_column('weddings', 'tarikh_nikah')
