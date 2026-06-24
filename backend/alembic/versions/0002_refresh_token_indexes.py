"""Add indexes on refresh_tokens for query performance

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-18
Author: Zainab (M2)
"""
from alembic import op

revision = "0002"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_refresh_tokens_user_id_revoked",
        "refresh_tokens",
        ["user_id", "revoked"],
    )


def downgrade() -> None:
    op.drop_index("ix_refresh_tokens_user_id_revoked", table_name="refresh_tokens")