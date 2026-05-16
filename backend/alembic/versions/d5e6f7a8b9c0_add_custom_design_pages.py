"""add custom design pages

Revision ID: d5e6f7a8b9c0
Revises: c9d0e1f2a3b4
Create Date: 2026-05-14 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'd5e6f7a8b9c0'
down_revision: Union[str, None] = 'c9d0e1f2a3b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invitations', sa.Column('use_custom_design', sa.Boolean(), nullable=False, server_default='false'))

    op.create_table(
        'invitation_custom_pages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('status', sa.SmallInteger(), nullable=False, server_default='1'),
        sa.Column('invitation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['invitation_id'], ['invitations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_invitation_custom_pages_invitation_id', 'invitation_custom_pages', ['invitation_id'])
    op.create_index('ix_invitation_custom_pages_status', 'invitation_custom_pages', ['status'])


def downgrade() -> None:
    op.drop_index('ix_invitation_custom_pages_status', table_name='invitation_custom_pages')
    op.drop_index('ix_invitation_custom_pages_invitation_id', table_name='invitation_custom_pages')
    op.drop_table('invitation_custom_pages')
    op.drop_column('invitations', 'use_custom_design')
