"""
LifeLink AI - Chat Route

POST /api/chat — accepts an emergency description and location,
assembles active medical resources context, and returns
the structured AI Emergency Action Plan.
"""

from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatRequest, ChatResponse
from app.services.gemini_service import get_emergency_response
from app.services.db_service import get_donors
from app.config import GEMINI_API_KEY

router = APIRouter(prefix="/api", tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process an emergency query, integrate live coordinates/resources context,
    and return the structured Emergency Action Plan.
    """
    # Guard: API key must be configured
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Gemini API key not configured",
                "message": (
                    "The GEMINI_API_KEY environment variable is not set. "
                    "Please add it to backend/.env — you can get a free key at "
                    "https://aistudio.google.com/app/apikey"
                ),
            },
        )

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail={"error": "Empty message", "message": "Please describe the emergency situation."},
        )

    try:
        # Assemble Geolocation & Live Resource Context
        loc = request.location
        location_context = None

        if loc:
            coords = loc.get("coordinates", {})
            lat = coords.get("lat")
            lng = coords.get("lng")
            city = loc.get("city")
            area = loc.get("area")
            pincode = loc.get("pincode")
            address = loc.get("address")

            # 1. Fetch nearby hospitals dynamically (Overpass or Mock fallback)
            hospitals = []
            if lat is not None and lng is not None:
                from app.routes.hospitals import query_overpass_hospitals, generate_mock_hospitals
                try:
                    hospitals = await query_overpass_hospitals(lat, lng)
                except Exception:
                    hospitals = generate_mock_hospitals(lat, lng)

            # 2. Fetch nearby blood donors with calculated Haversine distance
            donors_list = []
            try:
                from app.routes.donors import CITY_COORDS, CITY_AREAS, DEFAULT_AREAS, haversine_distance
                raw_donors = get_donors()

                for d in raw_donors:
                    d_name = d.get("name", "Unknown Donor")
                    d_city = d.get("city", "Bengaluru")
                    d_city_clean = d_city.strip().lower()

                    areas = CITY_AREAS.get(d_city_clean, DEFAULT_AREAS)
                    name_hash = sum(ord(c) for c in d_name)
                    d_area = areas[name_hash % len(areas)]

                    city_center = CITY_COORDS.get(d_city_clean, (12.9716, 77.5946))
                    offset_lat = ((name_hash % 70) / 1000) - 0.035
                    offset_lng = (((name_hash * 3) % 70) / 1000) - 0.035
                    d_lat = city_center[0] + offset_lat
                    d_lng = city_center[1] + offset_lng

                    dist = 999.0
                    if lat is not None and lng is not None:
                        dist = haversine_distance(lat, lng, d_lat, d_lng)

                    donors_list.append({
                        "name": d_name,
                        "blood_group": d.get("blood_group", "O+"),
                        "area": d_area,
                        "distance": f"{round(dist, 1)} km" if lat is not None else "N/A",
                        "_raw_dist": dist
                    })

                if lat is not None:
                    donors_list.sort(key=lambda x: x["_raw_dist"])
                donors_list = donors_list[:8]  # Limit to closest 8 donors

            except Exception as donor_err:
                print(f"[LifeLink AI] Error generating donor context for chat: {donor_err}")
                donors_list = []

            location_context = {
                "coordinates": {"lat": lat, "lng": lng},
                "city": city,
                "area": area,
                "pincode": pincode,
                "address": address,
                "hospitals": hospitals,
                "donors": donors_list
            }

        # Query Gemini with message, history, and assembled context
        ai_response = await get_emergency_response(
            message=request.message,
            history=request.conversation_history,
            location_context=location_context
        )
        return ChatResponse(**ai_response)

    except ValueError as ve:
        raise HTTPException(status_code=503, detail={"error": "Configuration error", "message": str(ve)})

    except Exception as exc:
        print(f"[LifeLink AI] Unexpected error in /chat: {exc}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": f"An unexpected error occurred: {str(exc)}",
            },
        )
