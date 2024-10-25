"""Add test_column to tournaments

Revision ID: 3e20cc2da059
Revises: 8f599d1910b6
Create Date: 2024-10-21 10:43:07.988181

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3e20cc2da059'
down_revision: Union[str, None] = '8f599d1910b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tournaments', sa.Column('test_column', sa.String(), nullable=True))

def downgrade() -> None:
    op.drop_column('tournaments', 'test_column')