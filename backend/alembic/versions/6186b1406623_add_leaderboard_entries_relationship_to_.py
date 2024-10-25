"""Add leaderboard_entries relationship to Team model

Revision ID: 6186b1406623
Revises: 63e11a8fd05e
Create Date: 2024-10-21 11:28:29.846907

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '6186b1406623'
down_revision: Union[str, None] = '63e11a8fd05e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop unnecessary tables and indexes
    op.execute("DROP TABLE IF EXISTS player_rankings")

    # Create new enum type if it doesn't exist
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tournamentformat') THEN CREATE TYPE tournamentformat AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION'); END IF; END $$;")

    # Alter the column type with a USING clause
    op.execute("ALTER TABLE tournaments ALTER COLUMN format TYPE tournamentformat USING CASE WHEN format = 'single_elimination' THEN 'SINGLE_ELIMINATION'::tournamentformat WHEN format = 'double_elimination' THEN 'DOUBLE_ELIMINATION'::tournamentformat ELSE NULL END")

    # Create new status enum type if it doesn't exist
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tournamentstatus') THEN CREATE TYPE tournamentstatus AS ENUM ('PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED'); END IF; END $$;")

    # Add status column if it doesn't exist
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='status') THEN ALTER TABLE tournaments ADD COLUMN status tournamentstatus; END IF; END $$;")

    # Set default value for status column
    op.execute("UPDATE tournaments SET status = 'PENDING'::tournamentstatus WHERE status IS NULL")


def downgrade() -> None:
    # Convert format back to string type
    op.execute("ALTER TABLE tournaments ALTER COLUMN format TYPE VARCHAR USING format::text")

    # Drop the status column
    op.execute("ALTER TABLE tournaments DROP COLUMN IF EXISTS status")

    # Recreate player_rankings table (if needed)
    op.create_table('player_rankings',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('player_name', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('twitter_handle', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('rank', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='player_rankings_pkey')
    )
    op.create_index('ix_player_rankings_twitter_handle', 'player_rankings', ['twitter_handle'], unique=False)
    op.create_index('ix_player_rankings_rank', 'player_rankings', ['rank'], unique=False)
    op.create_index('ix_player_rankings_player_name', 'player_rankings', ['player_name'], unique=False)
    op.create_index('ix_player_rankings_id', 'player_rankings', ['id'], unique=False)

    # Note: We're not dropping the enum types in downgrade as they might be used elsewhere