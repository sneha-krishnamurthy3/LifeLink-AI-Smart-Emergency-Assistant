"""
LifeLink AI - Gemini AI Service

The core intelligence layer. Uses Google Gemini to act as an emergency
medical response coordinator, returning structured JSON guidance.
"""

import json
import re

import google.generativeai as genai

from app.config import GEMINI_API_KEY

# ──────────────────────────────────────────────
#  System Prompt
# ──────────────────────────────────────────────

SYSTEM_PROMPT = """
You are LifeLink AI, an advanced emergency medical response coordinator. You are NOT a chatbot — you are an intelligent emergency agent.

Your responsibilities:
1. Quickly understand the emergency situation
2. Determine the urgency level (CRITICAL, HIGH, MEDIUM, LOW)
3. Provide immediate, actionable first aid steps
4. List clear Do's and Don'ts
5. Recommend whether hospital visit is needed
6. Provide relevant emergency contact numbers (India-focused: 112, 108, 102)
7. Suggest if blood donation may be needed
8. Compile a highly detailed, professional Emergency Action Plan in markdown format.

Rules:
- Stay calm and reassuring
- Never panic the user
- Never diagnose with certainty — say "This may indicate..." or "Possible..."
- Always include a medical disclaimer
- Be concise but thorough
- Prioritize life-saving actions first

You MUST respond in this exact JSON format:
{
  "emergency_type": "Brief name of the emergency",
  "urgency_level": "CRITICAL|HIGH|MEDIUM|LOW",
  "first_aid": ["Step 1...", "Step 2...", "Step 3..."],
  "dos": ["Do this...", "Do that..."],
  "donts": ["Don't do this...", "Don't do that..."],
  "hospital_advice": "Clear recommendation about hospital visit",
  "emergency_numbers": ["112 - Emergency", "108 - Ambulance"],
  "disclaimer": "Medical disclaimer text",
  "action_plan": "A complete, comprehensive Emergency Action Plan written in professional markdown. Use headers (e.g. ##), bolding, lists, and spacing. In this action plan, you MUST reference the nearby hospitals and blood donors provided in the user context, calculate/estimate travel time based on distance (assume ~5 minutes per km in heavy traffic), and guide the user on which facility to go to. If location context is missing, politely ask the user to share their city, area, or pincode so we can recommend specific local hospitals."
}

Respond ONLY with valid JSON. No markdown wrapper, no extra text.
"""

# ──────────────────────────────────────────────
#  Fallback Response
# ──────────────────────────────────────────────

FALLBACK_RESPONSE: dict = {
    "emergency_type": "General Emergency",
    "urgency_level": "MEDIUM",
    "first_aid": [
        "Stay calm and assess the situation",
        "Call emergency services at 112",
        "Follow dispatcher instructions",
    ],
    "dos": [
        "Stay calm",
        "Call for help immediately",
        "Stay with the person",
    ],
    "donts": [
        "Don't panic",
        "Don't leave the person alone",
        "Don't give medication without professional advice",
    ],
    "hospital_advice": "Please visit the nearest hospital for professional medical evaluation.",
    "emergency_numbers": [
        "112 - National Emergency",
        "108 - Ambulance",
        "102 - Women & Child Helpline",
    ],
    "disclaimer": (
        "This is AI-generated first aid guidance. Always consult a medical "
        "professional. Call emergency services immediately for life-threatening situations."
    ),
    "action_plan": (
        "# 🚨 Emergency Action Plan: General Assessment\n\n"
        "## Urgency Assessment\n"
        "**Level**: MEDIUM\n"
        "We are assessing your emergency description. Please prepare to seek medical care.\n\n"
        "## Immediate First Aid Steps\n"
        "1. **Stay calm** and check the scene for safety.\n"
        "2. **Call 112** (Emergency) or **108** (Ambulance) if condition deteriorates.\n"
        "3. Keep the patient comfortable and monitor their breathing.\n\n"
        "## 🏥 Nearby Hospital Recommendations\n"
        "Since location context was unavailable, please check the **Hospital Finder** tab to view closest facilities, or provide your city/area in the chat so we can recommend specific directions."
    )
}


# ──────────────────────────────────────────────
#  Helper Functions
# ──────────────────────────────────────────────

def configure_gemini() -> None:
    """Configure the Gemini SDK with the stored API key."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise ValueError(
            "GEMINI_API_KEY is not configured. "
            "Please set it in backend/.env or as an environment variable."
        )
    genai.configure(api_key=GEMINI_API_KEY)


def _extract_json(text: str) -> str:
    """
    Extract JSON from the response text.
    Handles cases where Gemini wraps JSON in markdown code fences.
    """
    # Try to find JSON inside ```json ... ``` or ``` ... ``` blocks
    json_match = re.search(r"```(?:json)?\s*(.+?)\s*```", text, re.DOTALL)
    if json_match:
        return json_match.group(1).strip()

    # Try to find a raw JSON object
    brace_match = re.search(r"\{.*\}", text, re.DOTALL)
    if brace_match:
        return brace_match.group(0).strip()

    return text.strip()


def _build_prompt(message: str, history: list[dict] | None = None, location_context: dict | None = None) -> str:
    """
    Build the full prompt, incorporating conversation history and location context.
    """
    parts: list[str] = [SYSTEM_PROMPT]

    if history:
        parts.append("\n--- Previous Conversation Context ---")
        for entry in history[-6:]:  # Keep last 6 exchanges for context
            role = entry.get("role", "user")
            content = entry.get("content", entry.get("message", ""))
            parts.append(f"{role.capitalize()}: {content}")
        parts.append("--- End of Context ---\n")

    if location_context:
        parts.append("\n--- User Geolocation & Resource Context ---")
        
        city = location_context.get("city")
        area = location_context.get("area")
        pincode = location_context.get("pincode")
        address = location_context.get("address")
        coords = location_context.get("coordinates", {})
        lat = coords.get("lat")
        lng = coords.get("lng")
        
        user_info = []
        if address:
            user_info.append(f"Physical Address: {address}")
        elif city:
            user_info.append(f"City: {city}, Area: {area or 'N/A'}, Pincode: {pincode or 'N/A'}")
        if lat is not None and lng is not None:
            user_info.append(f"Coordinates: {lat}, {lng}")
            
        if user_info:
            parts.append("\n".join(user_info))
        else:
            parts.append("User Location: Unknown/Unavailable")
            
        # Nearby hospitals
        hospitals = location_context.get("hospitals", [])
        if hospitals:
            parts.append("\nNearby Medical Facilities (OSM Overpass Live Data):")
            for idx, h in enumerate(hospitals[:5], 1):
                h_name = h.get("name")
                h_addr = h.get("address", "Local Area")
                h_dist = h.get("distance", "N/A")
                h_type = h.get("amenity_type", "hospital")
                parts.append(f"{idx}. [{h_type.upper()}] {h_name} - {h_addr} ({h_dist} away)")
        else:
            parts.append("\nNearby Medical Facilities: None detected nearby. (Remind the user to specify their city/area if they want hospital recommendations.)")
            
        # Nearby donors
        donors = location_context.get("donors", [])
        if donors:
            parts.append("\nNearby Matching Blood Donors:")
            for idx, d in enumerate(donors[:4], 1):
                d_name = d.get("name")
                d_group = d.get("blood_group")
                d_area = d.get("area", "Local Area")
                d_dist = d.get("distance", "N/A")
                parts.append(f"{idx}. {d_name} (Blood Group: {d_group}) - {d_area} ({d_dist} away)")
        else:
            parts.append("\nNearby Registered Blood Donors: None detected nearby.")
            
        parts.append("--- End of User Geolocation Context ---\n")

    parts.append(f"User Emergency Description: {message}")
    return "\n\n".join(parts)


# ──────────────────────────────────────────────
#  Main Service Function
# ──────────────────────────────────────────────

async def get_emergency_response(
    message: str,
    history: list[dict] | None = None,
    location_context: dict | None = None
) -> dict:
    """
    Send the user's emergency description and location context to Gemini
    and return structured JSON guidance containing the markdown Emergency Action Plan.
    """
    configure_gemini()

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config=genai.GenerationConfig(
            temperature=0.2,       # Low temperature for highly reliable, consistent medical advice
            top_p=0.8,
            max_output_tokens=2500,
        ),
    )

    prompt = _build_prompt(message, history, location_context)

    try:
        response = model.generate_content(prompt)

        if not response or not response.text:
            print("[LifeLink AI] Warning: Empty response from Gemini, using fallback.")
            return {**FALLBACK_RESPONSE, "raw_response": "Empty response from AI model"}

        response_text = response.text.strip()
        cleaned_json = _extract_json(response_text)

        try:
            parsed = json.loads(cleaned_json)
            # Ensure all required keys exist
            for key in ("emergency_type", "urgency_level", "first_aid", "dos", "donts",
                        "hospital_advice", "emergency_numbers", "disclaimer", "action_plan"):
                if key not in parsed:
                    parsed[key] = FALLBACK_RESPONSE[key]
            return parsed

        except json.JSONDecodeError:
            print(f"[LifeLink AI] Warning: Could not parse JSON. Raw: {response_text[:200]}")
            return {**FALLBACK_RESPONSE, "raw_response": response_text}

    except Exception as exc:
        print(f"[LifeLink AI] Gemini API error: {exc}")
        return {**FALLBACK_RESPONSE, "raw_response": str(exc)}
