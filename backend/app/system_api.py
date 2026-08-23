from fastapi import APIRouter

router = APIRouter(
    prefix="/system",
    tags=["System"],
)


@router.get("/version")
def version():

    return {
        "application": "HEALTHGRID",
        "version": "1.0.0",
        "status": "online",
    }
