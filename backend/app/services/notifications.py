import os
import json
import logging
import firebase_admin
from firebase_admin import credentials, messaging
from app.config import (
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_CREDENTIALS_PATH,
)

logger = logging.getLogger(__name__)

_firebase_app = None

def get_firebase_app():
    """
    Initialise or retrieve the shared Firebase application instance.
    Raises ValueError if Firebase configuration is missing or invalid.
    """
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    # Try loading from credentials file path first
    if FIREBASE_CREDENTIALS_PATH:
        if not os.path.exists(FIREBASE_CREDENTIALS_PATH):
            raise ValueError(
                f"Firebase credentials file not found at path: {FIREBASE_CREDENTIALS_PATH}. "
                "Verify FIREBASE_CREDENTIALS_PATH in your .env file."
            )
        try:
            cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase App successfully initialized from credentials path.")
            return _firebase_app
        except Exception as e:
            raise ValueError(f"Failed to initialize Firebase from path: {str(e)}")

    # Fall back to individual credentials in environment
    if FIREBASE_PROJECT_ID and FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY:
        try:
            # Construct service account structure
            service_account_info = {
                "type": "service_account",
                "project_id": FIREBASE_PROJECT_ID,
                "client_email": FIREBASE_CLIENT_EMAIL,
                "private_key": FIREBASE_PRIVATE_KEY,
            }
            cred = credentials.Certificate(service_account_info)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase App successfully initialized from environment variables.")
            return _firebase_app
        except Exception as e:
            raise ValueError(f"Failed to initialize Firebase from env parameters: {str(e)}")

    raise ValueError(
        "Firebase is not configured. Please define FIREBASE_CREDENTIALS_PATH OR "
        "(FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) in your backend/.env file."
    )

def send_push_notification(token: str, title: str, body: str, data: dict = None) -> str:
    """
    Send a single high-priority push notification to an FCM registration token.
    Returns the message ID string.
    """
    # This will raise ValueError to guide the developer if credentials are missing
    get_firebase_app()

    if not token:
        raise ValueError("Cannot send push notification: Device token is empty.")

    # Convert all data values to strings as required by FCM
    fcm_data = {}
    if data:
        for k, v in data.items():
            fcm_data[str(k)] = str(v)

    # Build the message payload
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=fcm_data,
        token=token,
        android=messaging.AndroidConfig(
            priority="high",
            notification=messaging.AndroidNotification(
                sound="default",
            ),
        ),
        apns=messaging.APNSConfig(
            payload=messaging.APNSPayload(
                aps=messaging.Aps(
                    sound="default",
                    content_available=True,
                ),
            ),
        ),
    )

    try:
        response = messaging.send(message)
        logger.info(f"FCM notification sent successfully. Message ID: {response}")
        return response
    except messaging.UnregisteredError:
        # Token is invalid / expired / client uninstalled
        logger.warning(f"Device token is unregistered. Token: {token}")
        raise ValueError("DEVICE_UNREGISTERED")
    except Exception as e:
        logger.error(f"FCM notification send failed: {str(e)}")
        raise e
