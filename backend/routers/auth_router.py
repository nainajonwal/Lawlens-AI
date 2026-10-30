import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
import models
import schemas
import auth

router = APIRouter(prefix="/auth", tags=["Authentication"])


def validate_bar_enrollment(enrollment_no: str) -> str:
    cleaned = (enrollment_no or "").strip().upper()
    # Pattern: 1 to 4 letters, slash, 1 to 6 digits, slash, 4 digits (year)
    pattern = r"^[A-Z]{1,4}\/\d{1,6}\/\d{4}$"
    if not re.match(pattern, cleaned):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Bar Council Enrollment ID. Format must be [StateCode]/[RollNo]/[Year] (e.g. MAH/4521/2021, D/1842/2019, UP/7823/2018) as prescribed under the Advocates Act, 1961."
        )

    parts = cleaned.split("/")
    year = int(parts[2])
    if year < 1965 or year > 2026:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid enrollment year ({year}). Enrollment year must be between 1965 and 2026."
        )
    return cleaned


@router.post("/register", response_model=schemas.Token)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Validate Bar Council of India Enrollment ID
    cleaned_bci = validate_bar_enrollment(user_data.bar_enrollment_no)
    existing_bci = db.query(models.User).filter(models.User.bar_enrollment_no == cleaned_bci).first()
    if existing_bci:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An advocate is already registered with Bar Council ID '{cleaned_bci}'."
        )

    hashed_pw = auth.hash_password(user_data.password)
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_pw,
        bar_enrollment_no=cleaned_bci,
        state_bar_council=user_data.state_bar_council.strip() if user_data.state_bar_council else "State Bar Council",
        is_verified_advocate=True
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error during registration.")

    token = auth.create_access_token({"user_id": new_user.user_id, "email": new_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": schemas.UserOut.from_orm(new_user)
    }


from sqlalchemy import func

@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    ident = (credentials.identifier or credentials.email or "").strip()
    if not ident:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an Advocate Email or Bar Council Registration Number."
        )

    # Find user by Email (case-insensitive) OR Bar Enrollment Number (case-insensitive)
    user = db.query(models.User).filter(
        (func.lower(models.User.email) == ident.lower()) |
        (func.upper(models.User.bar_enrollment_no) == ident.upper())
    ).first()

    # If database is completely empty (e.g. freshly created SQLite), seed default demo advocate
    if not user and db.query(models.User).count() == 0:
        demo_hashed = auth.hash_password("lawyer123")
        demo_advocate = models.User(
            name="Adv. Priya Sharma",
            email="priya@lawlens.com",
            password_hash=demo_hashed,
            bar_enrollment_no="MAH/4521/2021",
            state_bar_council="Bar Council of Maharashtra & Goa",
            is_verified_advocate=True
        )
        db.add(demo_advocate)
        db.commit()
        db.refresh(demo_advocate)
        # Check if login matches demo credentials
        if (ident.lower() == "priya@lawlens.com" or ident.upper() == "MAH/4521/2021") and credentials.password == "lawyer123":
            user = demo_advocate

    if not user or not auth.verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Bar Registration Number / Email or password."
        )

    token = auth.create_access_token({"user_id": user.user_id, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": schemas.UserOut.from_orm(user)
    }



@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
