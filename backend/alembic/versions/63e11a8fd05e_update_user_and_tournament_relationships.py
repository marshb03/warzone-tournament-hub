"""Update User and Tournament relationships

Revision ID: 63e11a8fd05e
Revises: 71c0a7a94ca2
Create Date: 2024-10-21 11:14:27.119842

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '63e11a8fd05e'
down_revision: Union[str, None] = '71c0a7a94ca2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Conditionally create the tournamentformat enum
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tournamentformat') THEN CREATE TYPE tournamentformat AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION'); END IF; END $$;")

    # Alter the column type with a USING clause, only if it's not already the correct type
    op.execute("DO $$ BEGIN IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'format') != 'USER-DEFINED' THEN ALTER TABLE tournaments ALTER COLUMN format TYPE tournamentformat USING UPPER(format)::tournamentformat; END IF; END $$;")

    # Drop unnecessary tables if they exist
    op.execute("DROP TABLE IF EXISTS team_members")
    op.execute("DROP TABLE IF EXISTS player_rankings")
    op.execute("DROP TABLE IF EXISTS match_teams")

    # Conditionally create the tournamentstatus enum
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tournamentstatus') THEN CREATE TYPE tournamentstatus AS ENUM ('PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED'); END IF; END $$;")

    # Add status column to tournaments table if it doesn't exist
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='status') THEN ALTER TABLE tournaments ADD COLUMN status tournamentstatus; END IF; END $$;")

    # Set default value for status column
    op.execute("UPDATE tournaments SET status = 'PENDING' WHERE status IS NULL")

    # Make status column not nullable
    op.execute("ALTER TABLE tournaments ALTER COLUMN status SET NOT NULL")


def downgrade() -> None:
    # Convert format back to string type
    op.execute("ALTER TABLE tournaments ALTER COLUMN format TYPE VARCHAR USING format::text")

    # Remove status column
    op.drop_column('tournaments', 'status')

    # Note: We're not dropping the enum types in downgrade as they might be used elsewhere