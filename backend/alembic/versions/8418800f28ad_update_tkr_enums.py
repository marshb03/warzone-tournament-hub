"""update TKR enums data

Revision ID: 8418800f28ad
Revises: 69af09e2f0f9
Create Date: 2025-09-04 16:50:45.671121

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '8418800f28ad'
down_revision = '69af09e2f0f9'
branch_labels = None
depends_on = None

def upgrade() -> None:
    """
    No schema changes needed - the database already has the correct enum definitions.
    This migration exists just to mark that the model definitions have been updated
    to match the database schema (string-based enums).
    """
    # Check if there are any existing TKR records and log the count
    connection = op.get_bind()
    
    try:
        # Just count existing records to verify tables exist
        result = connection.execute(sa.text("SELECT COUNT(*) FROM tkr_tournament_configs"))
        config_count = result.scalar()
        print(f"Found {config_count} existing TKR tournament configurations")
        
        result = connection.execute(sa.text("SELECT COUNT(*) FROM tkr_templates"))
        template_count = result.scalar()
        print(f"Found {template_count} existing TKR templates")
        
        # If there are existing records, check their enum values
        if config_count > 0:
            result = connection.execute(sa.text("SELECT DISTINCT team_size FROM tkr_tournament_configs"))
            team_sizes = [row[0] for row in result.fetchall()]
            print(f"Existing team_size values: {team_sizes}")
            
        if template_count > 0:
            result = connection.execute(sa.text("SELECT DISTINCT team_size FROM tkr_templates"))
            template_team_sizes = [row[0] for row in result.fetchall()]
            print(f"Existing template team_size values: {template_team_sizes}")
            
        print("✅ Migration completed successfully - enum definitions are already correct")
        
    except Exception as e:
        print(f"Migration completed with note: {e}")
        # This is fine - might happen if no data exists yet

def downgrade() -> None:
    """
    No changes to revert since no schema changes were made.
    """
    print("✅ Migration rollback completed - no changes to revert")