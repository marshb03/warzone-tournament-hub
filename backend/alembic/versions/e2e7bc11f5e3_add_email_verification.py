"""add_email_verification

Revision ID: e2e7bc11f5e3
Revises: c6f5de15eb13
Create Date: 2024-12-03 22:27:47.086721

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2e7bc11f5e3'
down_revision: Union[str, None] = 'c6f5de15eb13'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_losers_matches_id', table_name='losers_matches')
    op.drop_table('losers_matches')
    op.drop_index('ix_player_rankings_id', table_name='player_rankings')
    op.drop_index('ix_player_rankings_player_name', table_name='player_rankings')
    op.drop_index('ix_player_rankings_rank', table_name='player_rankings')
    op.drop_index('ix_player_rankings_twitter_handle', table_name='player_rankings')
    op.drop_table('player_rankings')
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'is_verified')
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
    op.create_table('losers_matches',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('tournament_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('round', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('match_number', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('team1_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('team2_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('winner_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('next_match_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('dropped_from_match_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['dropped_from_match_id'], ['matches.id'], name='losers_matches_dropped_from_match_id_fkey'),
    sa.ForeignKeyConstraint(['next_match_id'], ['losers_matches.id'], name='losers_matches_next_match_id_fkey'),
    sa.ForeignKeyConstraint(['team1_id'], ['teams.id'], name='losers_matches_team1_id_fkey'),
    sa.ForeignKeyConstraint(['team2_id'], ['teams.id'], name='losers_matches_team2_id_fkey'),
    sa.ForeignKeyConstraint(['tournament_id'], ['tournaments.id'], name='losers_matches_tournament_id_fkey'),
    sa.ForeignKeyConstraint(['winner_id'], ['teams.id'], name='losers_matches_winner_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='losers_matches_pkey'),
    sa.UniqueConstraint('tournament_id', 'round', 'match_number', name='unique_losers_match_number_per_round')
    )
    op.create_index('ix_losers_matches_id', 'losers_matches', ['id'], unique=False)
    # ### end Alembic commands ###
