from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Optional
from app.services.notifications import send_push_notification

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)

class TestNotificationRequest(BaseModel):
    token: str = Field(..., description="FCM registration token of target device")
    title: str = Field(..., description="Title of push notification")
    body: str = Field(..., description="Body of push notification")
    data: Optional[Dict[str, str]] = Field(default=None, description="Optional metadata dictionary")

@router.post("/test-send", status_code=status.HTTP_200_OK)
async def send_test_notification(request: TestNotificationRequest):
    """
    Send a test FCM push notification to a specific device registration token.
    Guides the developer with explicit configuration details if credentials are not set up.
    """
    try:
        msg_id = send_push_notification(
            token=request.token.strip(),
            title=request.title.strip(),
            body=request.body.strip(),
            data=request.data,
        )
        return {
            "success": True,
            "message": "Notification dispatched successfully.",
            "message_id": msg_id,
        }
    except ValueError as val_err:
        err_msg = str(val_err)
        # Check for our classification errors
        if err_msg == "DEVICE_UNREGISTERED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The provided device token has expired or is no longer registered. Please refresh your VITE_FIREBASE_VAPID_KEY and client token."
            )
        # Config missing errors
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=err_msg
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected Firebase error occurred: {str(e)}"
        )
