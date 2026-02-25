"""
SQLite persistence layer.

Tables
------
sync_meta    – one row: the last-response-date + response_id we synced against
aggregations – one row per aggregation key, storing the JSON blob
"""
from __future__ import annotations

import json
import logging
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).parent.parent / "data" / "numu.db"


# ── connection helper ────────────────────────────────────────────────────────

def _conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    con.execute("PRAGMA journal_mode=WAL")
    con.row_factory = sqlite3.Row
    return con


# ── schema ───────────────────────────────────────────────────────────────────

def init_db() -> None:
    with _conn() as con:
        con.executescript("""
            CREATE TABLE IF NOT EXISTS sync_meta (
                id                   INTEGER PRIMARY KEY CHECK (id = 1),
                last_response_date   TEXT    NOT NULL,
                response_id          TEXT    NOT NULL,
                survey_id            TEXT    NOT NULL,
                synced_at            TEXT    NOT NULL
            );

            CREATE TABLE IF NOT EXISTS aggregations (
                key        TEXT PRIMARY KEY,
                data       TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)
    logger.info("[db] Initialised SQLite DB at %s", DB_PATH)


# ── sync_meta ────────────────────────────────────────────────────────────────

def get_last_sync() -> Optional[Dict[str, str]]:
    with _conn() as con:
        row = con.execute(
            "SELECT last_response_date, response_id, survey_id, synced_at "
            "FROM sync_meta WHERE id = 1"
        ).fetchone()
    if row:
        return dict(row)
    return None


def save_sync_meta(last_response_date: str, response_id: str, survey_id: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with _conn() as con:
        con.execute(
            """
            INSERT OR REPLACE INTO sync_meta
                (id, last_response_date, response_id, survey_id, synced_at)
            VALUES (1, ?, ?, ?, ?)
            """,
            (last_response_date, response_id, survey_id, now),
        )
    logger.info("[db] sync_meta updated — response_id=%s  date=%s", response_id, last_response_date)


# ── aggregations ─────────────────────────────────────────────────────────────

def save_aggregations(aggs: Dict[str, Any]) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with _conn() as con:
        con.executemany(
            "INSERT OR REPLACE INTO aggregations (key, data, updated_at) VALUES (?, ?, ?)",
            [(key, json.dumps(value, default=str), now) for key, value in aggs.items()],
        )
    logger.info("[db] Saved %d aggregation keys to DB.", len(aggs))


def load_aggregations() -> Dict[str, Any]:
    with _conn() as con:
        rows = con.execute("SELECT key, data FROM aggregations").fetchall()
    result = {row["key"]: json.loads(row["data"]) for row in rows}
    logger.info("[db] Loaded %d aggregation keys from DB.", len(result))
    return result
