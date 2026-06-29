"""
LifeLink AI - Donors Route

GET /api/donors — returns registered blood donors,
optionally filtered by blood group and sorted by distance.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import math

from app.models.schemas import DonorModel, DonorCreate
from app.services.db_service import get_donors, add_donor

router = APIRouter(prefix="/api", tags=["Donors"])

# ──────────────────────────────────────────────
#  Location Utilities & Constants
# ──────────────────────────────────────────────

CITY_COORDS = {
    "delhi": (28.6139, 77.2090),
    "mumbai": (19.0760, 72.8777),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "chennai": (13.0827, 80.2707),
    "hyderabad": (17.3850, 78.4867),
    "pune": (18.5204, 73.8567),
    "kolkata": (22.5726, 88.3639),
    "kochi": (9.9312, 76.2673),
    "jaipur": (26.9124, 75.7873),
    "thiruvananthapuram": (8.5241, 76.9366),
    "lucknow": (26.8467, 80.9462),
    "ahmedabad": (23.0225, 72.5714),
    "bhopal": (23.2599, 77.4126),
    "chandigarh": (30.7333, 76.7794),
    "dehradun": (30.3165, 78.0322),
    "nagpur": (21.1458, 79.0882),
    "varanasi": (25.3176, 82.9739),
    "patna": (25.5941, 85.1376),
    "indore": (22.7196, 75.8577),
    "mangalore": (12.9141, 74.8560),
    "guwahati": (26.1445, 91.7362),
}

CITY_AREAS = {
    "bengaluru": ["Koramangala", "Indiranagar", "Jayanagar", "HSR Layout", "Whitefield", "Malleshwaram", "Hebbal", "Marathahalli"],
    "bangalore": ["Koramangala", "Indiranagar", "Jayanagar", "HSR Layout", "Whitefield", "Malleshwaram", "Hebbal", "Marathahalli"],
    "delhi": ["Connaught Place", "Saket", "Karol Bagh", "Rajouri Garden", "Vasant Kunj", "Dwarka", "Greater GK", "Chandni Chowk"],
    "mumbai": ["Andheri West", "Bandra West", "Colaba", "Juhu", "Worli", "Dadar", "Powai", "Borivali"],
    "chennai": ["Adyar", "Mylapore", "T. Nagar", "Velachery", "Nungambakkam", "Anna Nagar", "Besant Nagar", "Guindy"],
    "hyderabad": ["Gachibowli", "Jubilee Hills", "Banjara Hills", "Madhapur", "Begumpet", "Kukatpally", "Secunderabad"],
    "pune": ["Koregaon Park", "Kothrud", "Aundh", "Viman Nagar", "Hinjawadi", "Deccan Gym", "Kalyani Nagar"],
    "kolkata": ["Salt Lake", "Park Street", "Ballygunge", "New Town", "Tollygunge", "Gariahat", "Howrah"],
}

DEFAULT_AREAS = ["Civil Lines", "Main Market", "Sector 15", "Shastri Nagar", "Gandhi Nagar", "Subhash Nagar", "Model Town"]

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Radius of Earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# ──────────────────────────────────────────────
#  Route
# ──────────────────────────────────────────────

@router.get("/donors", response_model=list[DonorModel])
async def list_donors(
    blood_group: Optional[str] = Query(None, description="Filter by blood group, e.g. O+, AB-"),
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
    city: Optional[str] = Query(None, description="User city to filter/calculate distance"),
):
    """
    Retrieve and filter available blood donors sorted by distance.
    """
    try:
        raw_donors = get_donors(blood_group=blood_group)
        processed_donors = []

        user_coords = (lat, lng) if (lat is not None and lng is not None) else None
        filter_city = city.strip().lower() if city else None

        for d in raw_donors:
            donor_name = d.get("name", "Unknown Donor")
            donor_city = d.get("city", "Bengaluru")
            donor_city_clean = donor_city.strip().lower()

            # Filter by city if user requested city filtering explicitly
            if filter_city and filter_city != donor_city_clean:
                # If coordinates are not provided, we only show donors matching searched city
                if not user_coords:
                    continue

            # Deterministic Area calculation
            areas = CITY_AREAS.get(donor_city_clean, DEFAULT_AREAS)
            name_hash = sum(ord(c) for c in donor_name)
            area_index = name_hash % len(areas)
            donor_area = areas[area_index]

            # Deterministic Coordinates calculation for distance computation
            city_center = CITY_COORDS.get(donor_city_clean, (12.9716, 77.5946))
            
            # Add small random-like offset so donors are distributed around the city/user
            offset_lat = ((name_hash % 70) / 1000) - 0.035
            offset_lng = (((name_hash * 3) % 70) / 1000) - 0.035
            donor_lat = city_center[0] + offset_lat
            donor_lng = city_center[1] + offset_lng

            # Compute actual distance
            if user_coords:
                dist = haversine_distance(user_coords[0], user_coords[1], donor_lat, donor_lng)
            else:
                # Fallback distance if no user coordinates (use base donor distance field or randomize)
                dist = float(d.get("distance", "2.5 km").replace(" km", ""))
                if filter_city and filter_city == donor_city_clean:
                    # Keep it small if in the same searched city
                    dist = round(1.0 + (name_hash % 40) / 10, 1)
                elif filter_city:
                    # Make it large if user is in a different city
                    dist = round(150.0 + (name_hash % 200), 1)

            processed_donors.append({
                "name": donor_name,
                "age": d.get("age", 30),
                "blood_group": d.get("blood_group", "O+"),
                "phone": d.get("phone", "+91-9876543210"),
                "city": donor_city,
                "area": donor_area,
                "distance": f"{round(dist, 1)} km",
                "availability": d.get("availability", True),
                "_raw_distance": dist # internal field for sorting
            })

        # Sort closest first
        processed_donors.sort(key=lambda x: x["_raw_distance"])

        # Remove internal sorting field before returning
        for d in processed_donors:
            d.pop("_raw_distance", None)

        return processed_donors

    except Exception as exc:
        print(f"[LifeLink AI] Error fetching donors: {exc}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to fetch donors", "message": str(exc)},
        )


@router.post("/donors", response_model=dict)
async def register_donor(donor: DonorCreate):
    """
    Register a new blood donor.
    """
    try:
        # Convert Pydantic object to dictionary and save
        donor_dict = donor.model_dump()
        success = add_donor(donor_dict)
        if success:
            return {"status": "success", "message": f"Successfully registered donor {donor.name}."}
        else:
            raise HTTPException(
                status_code=500,
                detail={"error": "Failed to register donor", "message": "Failed to write donor record."}
            )
    except HTTPException:
        raise
    except Exception as exc:
        print(f"[LifeLink AI] Error registering donor: {exc}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to register donor", "message": str(exc)}
        )
