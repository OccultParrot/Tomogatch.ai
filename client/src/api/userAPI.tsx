// import Auth from '../utils/auth';
import { SignUpData } from "../interfaces/SignUpData";
import { ApiMessage } from "../interfaces/ApiMessage";
import { UserData } from "../interfaces/userData";
import Auth from "../utils/auth";
import { CatData } from "../interfaces/CatData";

// get all users
const retrieveUsers = async () => {
  try {
    const response = await fetch("/api/users", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error("invalid user API response");
    }
    return data;
  } catch (error: any) {
    console.log("Error retrieving data:", error);
    return [];
  }
};

// get /users/adoptedcats - get the adopted cats by logged in user
const retrieveUserCats = async (): Promise<CatData[]> => {
  try {
    const response = await fetch("/api/users/adoptedcats", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error retrieving the user's adopted cats");
    }
    const data: CatData[] = await response.json(); // Added await here and CatData[] type

    return data;
  } catch (error: any) {
    console.log("Error retrieving data:", error);
    return [];
  }
};

// retrieve user data by id -this is mostly for the Profile page
const retrieveUser = async (id: number | null): Promise<UserData> => {
  try {
    const response = await fetch(`/api/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    });

    const data = await response.json();

    // check the response
    if (!response.ok) {
      throw new Error("Invalid API response");
    }

    return data;
  } catch (error) {
    console.log("Error retrieving data", error);
    return Promise.reject("Could not fetch user by id");
  }
};

// POST
const createUser = async (body: SignUpData) => {
  try {
    const response = await fetch("/api/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Invalid API response");
    }

    return data;
  } catch (error) {
    console.log("Error retrieving data", error);
    return Promise.reject("Could not fetch user by id");
  }
};

// update the user, maybe we'll have a button the Profile page that would have update your profile or something

const updateUser = async (id: number, body: UserData): Promise<UserData> => {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Error retrieving user by id");
    }

    return data;
  } catch (error) {
    console.log("Error retrieving data", error);
    return Promise.reject("Could not fetch user by id");
  }
};

const deleteUser = async (id: number): Promise<ApiMessage> => {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Invalid API response");
    }
    return data;
  } catch (error) {
    console.log("Error retrieving data", error);
    return Promise.reject("Could not fetch user by id");
  }
};

const retrieveCatCount = async (id: number) => {
  try {
    const response = await fetch(`api/users/${id}/cats`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Invalid API response");
    }
    console.log("number of cats is", data);
    return data;
  } catch (error) {
    console.log("Error retrieving cats count", error);
    return Promise.reject("Could not fetch user by id");
  }
};

const retrieveUserCreatedAt = async (id: number) => {
  try {
    const response = await fetch(`/api/users/${id}/createdat`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error("Invalid API response");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error retrieving cats count", error);
    return Promise.reject("Could not fetch user by id");
  }
};

const updateUserUsername = async (
  id: number,
  newUsername: string
): Promise<UserData> => {
  try {
    const response = await fetch(`/api/users/${id}/username`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
      body: JSON.stringify({ newUsername }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Error retrieving user by id");
    }

    return data;
  } catch (error) {
    console.log("Error retrieving data", error);
    return Promise.reject("Could not fetch user by id");
  }
};

const updateUserPassword = async (
  id: number,
  newPassword: string
): Promise<UserData> => {
  try {
    const response = await fetch(`/api/users/${id}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
      body: JSON.stringify({ password: newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Error retrieving user by id");
    }

    return data;
  } catch (error) {
    console.log("Error retrieving data", error);
    return Promise.reject("Could not fetch user by id");
  }
};
const updateUserBio = async (id: number, newBio: string): Promise<UserData> => {
  try {
    const response = await fetch(`/api/users/${id}/bio`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
      body: JSON.stringify({ newBio }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Error retrieving user by id");
    }

    return data;
  } catch (error) {
    console.log("Error retrieving data", error);
    return Promise.reject("Could not fetch user by id");
  }
};



export {
  retrieveUsers,
  retrieveUser,
  createUser,
  updateUser,
  deleteUser,
  retrieveUserCats,
  retrieveCatCount,
  retrieveUserCreatedAt,
  updateUserUsername,
  updateUserPassword,
  updateUserBio,
};
