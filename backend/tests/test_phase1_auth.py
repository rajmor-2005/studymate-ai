import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_phase1_signup_and_login():
    # Test Signup
    signup_payload = {
        "email": "teststudent@example.com",
        "password": "Password123!",
        "name": "Raj Student"
    }
    response = client.post("/api/auth/signup", json=signup_payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "teststudent@example.com"
    token = data["access_token"]

    # Test Duplicate Signup
    dup_resp = client.post("/api/auth/signup", json=signup_payload)
    assert dup_resp.status_code == 400
    assert "already registered" in dup_resp.json()["detail"]

    # Test Login Success
    login_payload = {
        "email": "teststudent@example.com",
        "password": "Password123!"
    }
    login_resp = client.post("/api/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # Test Login Wrong Password (Generic Error, FRD 1.2)
    wrong_login = {
        "email": "teststudent@example.com",
        "password": "WrongPassword!"
    }
    wrong_resp = client.post("/api/auth/login", json=wrong_login)
    assert wrong_resp.status_code == 401
    assert wrong_resp.json()["detail"] == "Invalid email or password"

    # Test Auth /me endpoint
    me_resp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "teststudent@example.com"

    # Test Protected route without token (401)
    unauth_resp = client.get("/api/auth/me")
    assert unauth_resp.status_code == 401
