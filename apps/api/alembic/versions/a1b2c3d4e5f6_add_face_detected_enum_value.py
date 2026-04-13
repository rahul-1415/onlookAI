"""add_face_detected_enum_value

Revision ID: a1b2c3d4e5f6
Revises: 88df7ba1da75
Create Date: 2026-04-13 06:00:00.000000
"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '88df7ba1da75'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE attentioneventtype ADD VALUE IF NOT EXISTS 'face_detected'")


def downgrade():
    # Postgres does not support removing enum values
    pass
