"""merge heads

Revision ID: 1ae4db7ad7bc
Revises: 0002, 744004a0c95c
Create Date: 2026-06-20 16:29:50.326842

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1ae4db7ad7bc'
down_revision: Union[str, Sequence[str], None] = ('0002', '744004a0c95c')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
