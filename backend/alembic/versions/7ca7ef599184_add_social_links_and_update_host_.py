"""Add social links and update host profiles

Revision ID: 7ca7ef599184
Revises: bb55f860fcf8
Create Date: 2025-08-27 17:35:18.760775

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = '7ca7ef599184'
down_revision = 'bb55f860fcf8'
branch_labels = None
depends_on = None

def upgrade() -> None:
    connection = op.get_bind()
    
    # Check if socialplatform enum exists, create it if it doesn't
    result = connection.execute(text("""
        SELECT 1 FROM pg_type WHERE typname = 'socialplatform';
    """))
    
    if not result.fetchone():
        # Create enum for social platforms
        social_platform_enum = sa.Enum(
            'twitter', 'twitch', 'youtube', 'discord', 'instagram', 'tiktok', 'facebook', 'kick',
            name='socialplatform'
        )
        social_platform_enum.create(op.get_bind())
    else:
        print("socialplatform enum already exists, skipping creation")
    
    # Check if user_social_links table exists
    inspector = sa.inspect(connection)
    tables = inspector.get_table_names()
    
    if 'user_social_links' not in tables:
        # Create user_social_links table
        op.create_table('user_social_links',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('platform', sa.Enum('twitter', 'twitch', 'youtube', 'discord', 'instagram', 'tiktok', 'facebook', 'kick', name='socialplatform'), nullable=False),
            sa.Column('username', sa.String(), nullable=False),
            sa.Column('url', sa.String(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        
        # Create indexes for user_social_links
        op.create_index('idx_user_social_links', 'user_social_links', ['user_id'])
        op.create_index('idx_user_platform_unique', 'user_social_links', ['user_id', 'platform'], unique=True)
    else:
        print("user_social_links table already exists, skipping creation")
    
    # Update host_profiles table
    # 1. Check if organization_name column exists, add if it doesn't
    columns = [col['name'] for col in inspector.get_columns('host_profiles')]
    
    if 'organization_name' not in columns:
        op.add_column('host_profiles', sa.Column('organization_name', sa.String(), nullable=True))
    
    # 2. Make banner_path and description nullable (if they aren't already)
    try:
        op.alter_column('host_profiles', 'banner_path', existing_type=sa.String(), nullable=True)
    except Exception as e:
        print(f"banner_path already nullable or error: {e}")
    
    try:
        op.alter_column('host_profiles', 'description', existing_type=sa.String(), nullable=True)
    except Exception as e:
        print(f"description already nullable or error: {e}")
    
    # 3. Update existing host profiles with default organization_name (username)
    connection.execute(text("""
        UPDATE host_profiles 
        SET organization_name = (
            SELECT username FROM users WHERE users.id = host_profiles.user_id
        ) 
        WHERE organization_name IS NULL OR organization_name = ''
    """))
    
    # 4. Make organization_name NOT NULL after setting defaults
    try:
        op.alter_column('host_profiles', 'organization_name', existing_type=sa.String(), nullable=False)
    except Exception as e:
        print(f"organization_name already NOT NULL or error: {e}")
    
    # 5. Create host profiles for existing HOST users who don't have one
    connection.execute(text("""
        INSERT INTO host_profiles (user_id, organization_name, banner_path, description, logo_url, logo_public_id, twitter_url, discord_url)
        SELECT 
            u.id,
            u.username,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
        FROM users u
        LEFT JOIN host_profiles hp ON u.id = hp.user_id
        WHERE u.role = 'HOST' AND hp.id IS NULL
    """))

def downgrade() -> None:
    # Make organization_name nullable before potentially removing it
    try:
        op.alter_column('host_profiles', 'organization_name', existing_type=sa.String(), nullable=True)
    except:
        pass
    
    # Drop indexes if they exist
    try:
        op.drop_index('idx_user_platform_unique', table_name='user_social_links')
    except:
        pass
    
    try:
        op.drop_index('idx_user_social_links', table_name='user_social_links')
    except:
        pass
    
    # Drop user_social_links table if it exists
    try:
        op.drop_table('user_social_links')
    except:
        pass
    
    # Note: We don't drop the enum in downgrade to avoid issues with other potential uses