"""
LifeLink AI - Pydantic Schemas

Defines request/response models for all API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ──────────────────────────────────────────────
#  Chat / Emergency AI
# ──────────────────────────────────────────────

class ChatRequest(BaseModel):
    """Incoming emergency query from the user."""
    message: str = Field(..., min_length=1, description="The user's emergency description")
    conversation_history: list[dict] = Field(
        default_factory=list,
        description="Previous messages for context continuity",
    )
    location: Optional[dict] = Field(None, description="Active user location object")


class ChatResponse(BaseModel):
    """Structured AI emergency response."""
    emergency_type: str = Field(..., description="Brief name of the emergency")
    urgency_level: str = Field(..., description="CRITICAL | HIGH | MEDIUM | LOW")
    first_aid: list[str] = Field(default_factory=list, description="Step-by-step first aid instructions")
    dos: list[str] = Field(default_factory=list, description="Recommended actions")
    donts: list[str] = Field(default_factory=list, description="Actions to avoid")
    hospital_advice: str = Field(..., description="Hospital visit recommendation")
    emergency_numbers: list[str] = Field(default_factory=list, description="Relevant emergency contact numbers")
    disclaimer: str = Field(
        default="This is AI-generated first aid guidance. Always consult a medical professional.",
        description="Medical disclaimer",
    )
    action_plan: str = Field(default="", description="Comprehensive Markdown Emergency Action Plan")
    raw_response: str = Field(default="", description="Raw AI response text (for debugging)")


# ──────────────────────────────────────────────
#  Blood Donor
# ──────────────────────────────────────────────

class DonorModel(BaseModel):
    """Represents a registered blood donor."""
    name: str
    age: int = Field(..., ge=18, le=65)
    blood_group: str = Field(..., description="e.g. A+, O-, AB+")
    phone: str = Field(..., description="10-digit Indian mobile number")
    city: str
    area: str = ""
    distance: Optional[str] = ""
    availability: bool = True
    last_donation_date: Optional[str] = ""


class DonorCreate(BaseModel):
    """Payload to register a new blood donor."""
    name: str
    age: int = Field(..., ge=18, le=65)
    blood_group: str = Field(..., description="e.g. A+, O-, AB+")
    phone: str = Field(..., description="10-digit Indian mobile number")
    city: str
    area: str = ""
    availability: Optional[bool] = True
    last_donation_date: Optional[str] = ""


# ──────────────────────────────────────────────
#  Hospital
# ──────────────────────────────────────────────

class HospitalModel(BaseModel):
    """Represents a nearby hospital."""
    name: str
    rating: Optional[float] = Field(None, ge=0, le=5)
    distance: str = Field(..., description='Distance string, e.g. "1.5 km"')
    address: str = ""
    open_now: Optional[bool] = True
    phone: str = ""
    place_id: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    amenity_type: Optional[str] = "hospital"
