"""updating tournament fields

Revision ID: ccd300e02d89
Revises: ba1119e35d39
Create Date: 2024-12-09 14:23:31.650237

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'ccd300e02d89'
down_revision: Union[str, None] = 'ba1119e35d39'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Check if columns exist before adding them
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_columns = [c['name'] for c in inspector.get_columns('tournaments')]

    # Only add columns that don't exist
    if 'start_time' not in existing_columns:
        op.add_column('tournaments', sa.Column('start_time', sa.String(), nullable=True))
    if 'team_size' not in existing_columns:
        op.add_column('tournaments', sa.Column('team_size', sa.Integer(), nullable=True))
    if 'max_teams' not in existing_columns:
        op.add_column('tournaments', sa.Column('max_teams', sa.Integer(), nullable=True))
    if 'current_teams' not in existing_columns:
        op.add_column('tournaments', sa.Column('current_teams', sa.Integer(), server_default='0', nullable=False))

    # Update existing records with default values
    op.execute("UPDATE tournaments SET start_time = '12:00' WHERE start_time IS NULL")
    op.execute("UPDATE tournaments SET team_size = 2 WHERE team_size IS NULL")
    op.execute("UPDATE tournaments SET max_teams = 32 WHERE max_teams IS NULL")

    # Make columns non-nullable
    op.alter_column('tournaments', 'start_time',
                    existing_type=sa.String(),
                    nullable=False)
    op.alter_column('tournaments', 'team_size',
                    existing_type=sa.Integer(),
                    nullable=False)
    op.alter_column('tournaments', 'max_teams',
                    existing_type=sa.Integer(),
                    nullable=False)
def downgrade():
    op.drop_column('tournaments', 'current_teams')
    op.drop_column('tournaments', 'max_teams')
    op.drop_column('tournaments', 'team_size')
    op.drop_column('tournaments', 'start_time')
