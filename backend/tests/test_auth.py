import pytest
from src.models.user import User
from src.constants import UserRole
from src.utils.auth import hash_password

def test_register_guest(client):
    response = client.post('/api/auth/register', json={
        "email": "guest@test.com",
        "password": "password123",
        "role": UserRole.GUEST,
        "full_name": "Test Guest"
    })
    assert response.status_code == 201
    data = response.get_json()
    assert "user_id" in data

def test_register_company(client):
    response = client.post('/api/auth/register', json={
        "email": "company@test.com",
        "password": "password123",
        "role": UserRole.COMPANY,
        "company_name": "Test Company"
    })
    assert response.status_code == 201

def test_login_success(client, app):
    # Setup user
    with app.app_context():
        from src.extensions import db
        user = User(email="login@test.com", password_hash=hash_password("password123"), role=UserRole.GUEST)
        db.session.add(user)
        db.session.commit()

    response = client.post('/api/auth/login', json={
        "email": "login@test.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@test.com"

def test_get_me(client, app):
    # Setup user and get token
    with app.app_context():
        from src.extensions import db
        from src.models.user import GuestProfile
        user = User(email="me@test.com", password_hash=hash_password("password123"), role=UserRole.GUEST)
        db.session.add(user)
        db.session.flush()
        profile = GuestProfile(user_id=user.id, full_name="Me Guest")
        db.session.add(profile)
        db.session.commit()

    login_res = client.post('/api/auth/login', json={
        "email": "me@test.com",
        "password": "password123"
    })
    token = login_res.get_json()["access_token"]

    response = client.get('/api/auth/me', headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["user"]["email"] == "me@test.com"
    assert data["user"]["guest_profile"]["full_name"] == "Me Guest"
