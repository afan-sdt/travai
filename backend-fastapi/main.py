"""
Travai Backend - FastAPI Server for LiveKit Integration

This server handles:
1. LiveKit token generation for mobile clients
2. Webhook events from LiveKit (room events, participant events, etc.)
3. Voice agent integration
"""

from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from datetime import datetime
import hashlib
import hmac
import json

from livekit import api

# Initialize FastAPI app
app = FastAPI(title="Travai Backend", version="1.0.0")

# CORS configuration - update origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your mobile app's domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LiveKit Configuration
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "")
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "wss://your-project.livekit.cloud")

# Webhook secret for validating LiveKit webhooks
WEBHOOK_SECRET = os.getenv("LIVEKIT_WEBHOOK_SECRET", "")


# Pydantic Models
class TokenRequest(BaseModel):
    room_name: str
    participant_name: str
    metadata: Optional[str] = None


class TokenResponse(BaseModel):
    token: str
    url: str


class WebhookEvent(BaseModel):
    event: str
    room: Optional[Dict[str, Any]] = None
    participant: Optional[Dict[str, Any]] = None


# Routes

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Travai Backend",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/token", response_model=TokenResponse)
async def generate_token(request: TokenRequest):
    """
    Generate LiveKit access token for a participant

    This endpoint is called by the mobile app to get a token before joining a room.
    """
    try:
        if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
            raise HTTPException(
                status_code=500,
                detail="LiveKit credentials not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables."
            )

        # Create access token
        token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        token.identity = request.participant_name
        token.name = request.participant_name

        if request.metadata:
            token.metadata = request.metadata

        # Grant permissions
        token.add_grant(
            api.VideoGrants(
                room_join=True,
                room=request.room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )

        # Generate JWT token
        jwt_token = token.to_jwt()

        return TokenResponse(token=jwt_token, url=LIVEKIT_URL)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate token: {str(e)}")


@app.post("/api/webhooks/livekit")
async def livekit_webhook(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """
    Handle webhooks from LiveKit

    LiveKit sends webhooks for events like:
    - room_started: When a room is created
    - room_finished: When a room ends
    - participant_joined: When someone joins
    - participant_left: When someone leaves
    - track_published: When audio/video is published
    - recording_finished: When a recording completes
    """
    try:
        # Get raw body for signature verification
        body = await request.body()

        # Verify webhook signature if secret is configured
        if WEBHOOK_SECRET:
            if not authorization:
                raise HTTPException(status_code=401, detail="Missing authorization header")

            if not verify_webhook_signature(body, authorization):
                raise HTTPException(status_code=401, detail="Invalid webhook signature")

        # Parse webhook payload
        payload = json.loads(body)
        event_type = payload.get("event")

        # Handle different event types
        if event_type == "room_started":
            await handle_room_started(payload)
        elif event_type == "room_finished":
            await handle_room_finished(payload)
        elif event_type == "participant_joined":
            await handle_participant_joined(payload)
        elif event_type == "participant_left":
            await handle_participant_left(payload)
        elif event_type == "track_published":
            await handle_track_published(payload)
        elif event_type == "track_unpublished":
            await handle_track_unpublished(payload)
        elif event_type == "recording_finished":
            await handle_recording_finished(payload)
        else:
            print(f"Unhandled event type: {event_type}")

        return {"status": "ok", "event": event_type}

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        print(f"Error handling webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")


# Webhook Event Handlers

async def handle_room_started(payload: Dict[str, Any]):
    """Handle room started event"""
    room = payload.get("room", {})
    room_name = room.get("name")
    print(f"Room started: {room_name}")

    # Add your custom logic here:
    # - Log room creation
    # - Update database
    # - Trigger voice agent to join
    # - Send notifications


async def handle_room_finished(payload: Dict[str, Any]):
    """Handle room finished event"""
    room = payload.get("room", {})
    room_name = room.get("name")
    duration = room.get("duration", 0)

    print(f"Room finished: {room_name}, Duration: {duration}s")

    # Add your custom logic here:
    # - Save session data
    # - Process transcripts
    # - Update onboarding status
    # - Clean up resources


async def handle_participant_joined(payload: Dict[str, Any]):
    """Handle participant joined event"""
    room = payload.get("room", {})
    participant = payload.get("participant", {})

    room_name = room.get("name")
    participant_identity = participant.get("identity")
    participant_name = participant.get("name")

    print(f"Participant joined: {participant_name} ({participant_identity}) in room {room_name}")

    # Add your custom logic here:
    # - Trigger voice agent greeting
    # - Log user activity
    # - Update presence status
    # - Send welcome message


async def handle_participant_left(payload: Dict[str, Any]):
    """Handle participant left event"""
    room = payload.get("room", {})
    participant = payload.get("participant", {})

    room_name = room.get("name")
    participant_identity = participant.get("identity")

    print(f"Participant left: {participant_identity} from room {room_name}")

    # Add your custom logic here:
    # - Save session completion
    # - Update user progress
    # - Clean up user data


async def handle_track_published(payload: Dict[str, Any]):
    """Handle track published event (audio/video started)"""
    participant = payload.get("participant", {})
    track = payload.get("track", {})

    participant_identity = participant.get("identity")
    track_type = track.get("type")

    print(f"Track published: {track_type} from {participant_identity}")

    # Add your custom logic here:
    # - Enable voice agent listening
    # - Start transcription
    # - Record audio


async def handle_track_unpublished(payload: Dict[str, Any]):
    """Handle track unpublished event (audio/video stopped)"""
    participant = payload.get("participant", {})
    track = payload.get("track", {})

    participant_identity = participant.get("identity")
    track_type = track.get("type")

    print(f"Track unpublished: {track_type} from {participant_identity}")


async def handle_recording_finished(payload: Dict[str, Any]):
    """Handle recording finished event"""
    recording = payload.get("egressInfo", {})
    room_name = recording.get("roomName")
    file_path = recording.get("file", {}).get("location")

    print(f"Recording finished for room: {room_name}, File: {file_path}")

    # Add your custom logic here:
    # - Process recording
    # - Generate transcripts
    # - Store in cloud storage
    # - Notify users


# Helper Functions

def verify_webhook_signature(body: bytes, auth_header: str) -> bool:
    """
    Verify webhook signature from LiveKit

    LiveKit signs webhooks with HMAC-SHA256
    """
    try:
        expected_signature = hmac.new(
            WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()

        # Auth header format: "sha256=<signature>"
        received_signature = auth_header.replace("sha256=", "")

        return hmac.compare_digest(expected_signature, received_signature)
    except Exception as e:
        print(f"Error verifying signature: {e}")
        return False


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
