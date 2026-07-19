"""merge heads

Revision ID: d86af61d0cf3
Revises: 18a66ec86a72
Create Date: 2026-07-20 01:52:20.812621

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd86af61d0cf3'
down_revision: Union[str, Sequence[str], None] = '18a66ec86a72'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
