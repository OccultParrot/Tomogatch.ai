import { ApiMessage } from "../interfaces/ApiMessage";
import { CatData } from "../interfaces/CatData";
import Auth from "../utils/auth";

// if the response is valid, this one will return all cats along with the username of their owners. (it was set on the server side like that)
const retrieveCats = async () => {
  try {
    const response = await fetch("/api/cats", {
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
    console.log("Error retrieving data: ", error);
    return [];
  }
};

// this will retrieve a cat's data along with their owner's username. To be used where necessary
const retrieveCat = async (id: number | null): Promise<CatData> => {
  try {
    const response = await fetch(`/api/cats/${id}`, {
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
    console.log("Error retrieving data: ", error);
    return Promise.reject("Could not fetch from the API");
  }
};

const createCat = async (body: CatData) => {
  try {
    const response = await fetch("/api/cats", {
      headers: {
        method: "POST",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
        body: JSON.stringify(body),
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Invalid API response");
    }

    return data;
  } catch (error) {
    console.log("Error retrieving data: ", error);
    return Promise.reject("Could not create cat");
  }
};

const updateCatData = async (
  id: number | null,
  newData: CatData
): Promise<CatData> => {
  try {
    const response = await fetch(`/api/cats/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Auth.getToken()}`,
      },
      body: JSON.stringify(newData),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Invalid API response");
    }
    return data;
  } catch (error) {
    console.log("Error updating data: ", error);
    return Promise.reject("Could not update cat");
  }
};

const deleteCat = async (id: number | null): Promise<ApiMessage> => {
  try {
    const response = await fetch(`/api/cats/${id}`, {
      headers: {
        method: "DELETE",
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
    console.log("Error retrieving data: ", error);
    return Promise.reject("Could not update cat");
  }
};

export { retrieveCats, retrieveCat, createCat, updateCatData, deleteCat };
