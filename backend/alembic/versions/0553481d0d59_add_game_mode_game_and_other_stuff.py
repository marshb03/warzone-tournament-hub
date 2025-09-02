"""add game mode, game and other stuff

Revision ID: 0553481d0d59
Revises: 7ca7ef599184
Create Date: 2025-08-29 11:14:21.779257

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0553481d0d59'
down_revision = '7ca7ef599184'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add the new columns
    op.add_column('tournaments', sa.Column('entry_fee', sa.String(), nullable=True))
    op.add_column('tournaments', sa.Column('game', sa.String(), nullable=True))
    op.add_column('tournaments', sa.Column('game_mode', sa.String(), nullable=True))
    
    # Update the TournamentFormat enum to include TKR
    # Create new enum with TKR
    op.execute("ALTER TYPE tournamentformat ADD VALUE 'TKR'")


def downgrade() -> None:
    # Remove the added columns
    op.drop_column('tournaments', 'game_mode')
    op.drop_column('tournaments', 'game')
    op.drop_column('tournaments', 'entry_fee')
    
    # Note: PostgreSQL doesn't support removing enum values easily
    # In a real downgrade scenario, you'd need to:
    # 1. Update any TKR tournaments to a different format
    # 2. Create a new enum without TKR
    # 3. Update the column to use the new enum
    # 4. Drop the old enum
    # For now, we'll leave the enum value (it's harmless if unused)
    pass