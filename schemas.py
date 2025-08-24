from pydantic import BaseModel

class UserBase(BaseModel):
    username: str

    model_config = {
        "from_attributes": True
    }

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    model_config = {
        "from_attributes": True
    }

class Task(BaseModel):
    id: int
    title: str
    description: str | None = None
    done: bool = False
    owner_id: int

    model_config = {
        "from_attributes": True
    }