from fastapi import APIRouter, HTTPException

from pydantic import BaseModel

from services.firebase_service import firebase_service



router = APIRouter()



class UpdateStatusRequest(BaseModel):

    status: str # e.g., 'accepted', 'completed'



@router.get("/")
def get_tickets():
    """
    Get all tickets (mock or real Firestore).
    """
    tickets = firebase_service.get_all_tickets()
    return {"status": "success", "tickets": tickets}

@router.post("/")
def create_ticket(data: dict):
    """
    Manually create a ticket
    """
    import uuid
    from datetime import datetime
    ticket_id = f"TICK-{uuid.uuid4().hex[:6].upper()}"
    
    ticket_data = {
        "ticket_id": ticket_id,
        "room_number": data.get("room_number", "Unknown"),
        "intent": data.get("intent", ""),
        "extracted_data": {
            "intent": data.get("intent", ""),
            "items": data.get("items", ""),
        },
        "status": "pending",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
    firebase_service.save_ticket(ticket_data)
    return {"status": "success", "ticket": ticket_data}



@router.patch("/{ticket_id}/status")

def update_ticket_status(ticket_id: str, request: UpdateStatusRequest):

    """

    Update ticket status.

    """

    success = firebase_service.update_ticket_status(ticket_id, request.status)

    if not success:

        raise HTTPException(status_code=404, detail="Ticket not found or error updating")

   

    return {"status": "success", "message": f"Ticket {ticket_id} updated to {request.status}"}
