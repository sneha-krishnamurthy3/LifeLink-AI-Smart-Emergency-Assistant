"""
LifeLink AI - Database Service

Provides access to donor data via MongoDB when available,
with automatic fallback to a local JSON file.
"""

import json
from pathlib import Path
from typing import Optional

from app.config import MONGODB_URI, MONGODB_DB_NAME

# ──────────────────────────────────────────────
#  MongoDB Connection (with graceful fallback)
# ──────────────────────────────────────────────

_mongo_available: bool = False
_db = None

try:
    from pymongo import MongoClient
    _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
    # Force a connection check
    _client.server_info()
    _db = _client[MONGODB_DB_NAME]
    _mongo_available = True
    print(f"[LifeLink AI] Connected to MongoDB at {MONGODB_URI}")
except Exception as exc:
    print(
        f"[LifeLink AI] MongoDB unavailable ({exc}). "
        "Falling back to local JSON data. This is fine for development."
    )

# ──────────────────────────────────────────────
#  JSON Fallback Loader
# ──────────────────────────────────────────────

_JSON_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "donors.json"


def _load_json_donors() -> list[dict]:
    """Load donor records from the local JSON file."""
    try:
        with open(_JSON_DATA_PATH, "r", encoding="utf-8") as fh:
            data = json.load(fh)
            if isinstance(data, list):
                return data
            return data.get("donors", [])
    except FileNotFoundError:
        print(f"[LifeLink AI] Warning: Donor data file not found at {_JSON_DATA_PATH}")
        return []
    except json.JSONDecodeError as exc:
        print(f"[LifeLink AI] Warning: Invalid JSON in donors file — {exc}")
        return []


# ──────────────────────────────────────────────
#  Public API
# ──────────────────────────────────────────────

def get_donors(blood_group: Optional[str] = None) -> list[dict]:
    """
    Retrieve donor records, optionally filtered by blood group.

    Parameters
    ----------
    blood_group : str, optional
        Filter donors by blood group (e.g. "O+", "AB-").
        Case-insensitive matching is applied.

    Returns
    -------
    list[dict]
        List of donor records.
    """
    donors: list[dict] = []

    if _mongo_available and _db is not None:
        try:
            query: dict = {}
            if blood_group:
                # Case-insensitive regex match for blood group
                query["blood_group"] = {"$regex": f"^{blood_group.strip()}$", "$options": "i"}

            cursor = _db["donors"].find(query, {"_id": 0})
            donors = list(cursor)

            if donors:
                return donors
            # If MongoDB returned nothing, fall through to JSON
            print("[LifeLink AI] No donors found in MongoDB, falling back to JSON.")

        except Exception as exc:
            print(f"[LifeLink AI] MongoDB query failed ({exc}), falling back to JSON.")

    # JSON fallback
    donors = _load_json_donors()

    if blood_group:
        bg_upper = blood_group.strip().upper()
        donors = [d for d in donors if d.get("blood_group", "").upper() == bg_upper]

    return donors


def add_donor(donor: dict) -> bool:
    """
    Save a new blood donor record to MongoDB or fallback JSON.
    """
    if _mongo_available and _db is not None:
        try:
            _db["donors"].insert_one(donor.copy())
            print(f"[LifeLink AI] Saved new donor to MongoDB: {donor.get('name')}")
            return True
        except Exception as exc:
            print(f"[LifeLink AI] MongoDB save failed ({exc}), falling back to JSON.")
    
    # Save to local JSON fallback
    try:
        donors = _load_json_donors()
        # Clean Mongo _id if it was set
        donor_clean = {k: v for k, v in donor.items() if k != "_id"}
        donors.append(donor_clean)
        
        with open(_JSON_DATA_PATH, "w", encoding="utf-8") as fh:
            json.dump(donors, fh, indent=2, ensure_ascii=False)
        print(f"[LifeLink AI] Saved new donor to JSON file: {donor.get('name')}")
        return True
    except Exception as exc:
        print(f"[LifeLink AI] JSON save failed: {exc}")
        return False
