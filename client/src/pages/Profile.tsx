import React, { useState, useEffect } from "react";
import { getUserIdFromToken } from "../utils/userToken";
import {
  retrieveUser,
  retrieveCatCount,
  retrieveUserCreatedAt,
  updateUserBio,
  updateUserPassword,
  updateUserUsername,
} from "../api/userAPI";
import { UserData } from "../interfaces/userData";

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [catCount, setCatCount] = useState(0);
  const [memberSince, setMemberSince] = useState<string>("");
  const [randomUserImage, setRandomUserImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: string; isOpen: boolean }>({
    type: "",
    isOpen: false,
  });
  const [modalInput, setModalInput] = useState({
    password: "",
    confirmPassword: "",
    username: "",
    bio: "",
  });
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });

  // Fetch user data on load
  useEffect(() => {
    const fetchData = async () => {
      const userId = getUserIdFromToken();
      if (userId) {
        try {
          setLoading(true);
          setError(null);

          const user = await retrieveUser(userId);
          const count = await retrieveCatCount(userId);
          const createdAt = await retrieveUserCreatedAt(userId);
          setUserData(user);
          setCatCount(count);
          setMemberSince(createdAt.split(",")[0]);

          setRandomUserImage(
            `https://api.dicebear.com/6.x/avataaars/svg?seed=${userId}`
          );
        } catch (error) {
          setError("Failed to retrieve user data: " + error);
        } finally {
          setLoading(false);
        }
      } //else {
      //   const user1: UserData = {
      //     username: "user1",
      //     id: 10,
      //     userRole: "dont know",
      //     yarn: 200,
      //     createdAt: "yes",
      //     email: "ha",
      //     password: "yes",
      //     bio: "this is th ebio"
      //   }
      //   setUserData(user1);
      //   setLoading(false);
      //   setRandomUserImage('/assets/other/adoptMe.png')
      // }
    };
    fetchData();
  }, []);

  // Handlers for updating specific fields
  const handlePasswordChange = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return console.log("User ID not found");

    if (modalInput.password !== modalInput.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await updateUserPassword(userId, modalInput.password);
      setSuccessModal({
        isOpen: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      setSuccessModal({
        isOpen: true,
        message: "Failed to update password:" + error,
      });
    } finally {
      setModal({ type: "", isOpen: false });
    }
  };

  const handleUsernameChange = async () => {
    const userId = getUserIdFromToken();
    const newUsername = modalInput.username;
    if (!userId) return console.log("User ID not found");

    try {
      await updateUserUsername(userId, newUsername);
      setUserData((prevData) =>
        prevData ? { ...prevData, username: newUsername } : null
      );
      setSuccessModal({
        isOpen: true,
        message: "Username updated successfully",
      });
    } catch (error) {
      setSuccessModal({
        isOpen: true,
        message: "Failed to update username:" + error,
      });
    } finally {
      setModal({ type: "", isOpen: false });
    }
  };

  const handleBioChange = async () => {
    const userId = getUserIdFromToken();
    const newBio = modalInput.bio;
    if (!userId) return console.log("User ID not found");

    try {
      await updateUserBio(userId, newBio);
      setUserData((prevData) =>
        prevData ? { ...prevData, bio: newBio } : null
      );
      setSuccessModal({ isOpen: true, message: "Bio updated successfully" });
    } catch (error) {
      setSuccessModal({
        isOpen: true,
        message: "Failed to update bio: " + error,
      });
    } finally {
      setModal({ type: "", isOpen: false });
    }
    // setSuccessModal({ isOpen: true, message: "Failed to update bio" });
  };

  const openModal = (type: string) => {
    setModalInput({ password: "", confirmPassword: "", username: "", bio: "" });
    setModal({ type, isOpen: true });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setModalInput({ ...modalInput, [e.target.name]: e.target.value });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-6 rounded-lg bg-color_1">
      <div className="md:flex md:space-x-6">
        <div className="w-full md:w-1/3 mb-6 md:mb-0">
          <img
            src={randomUserImage}
            alt="User Avatar"
            className="w-full h-auto rounded-lg shadow-lg mb-4"
          />
          <div className="p-4 rounded-lg shadow bg-color_2 justify-items-center">
            <h1 className="text-xl font-semibold">Profile Details</h1>
            <p>
              <strong>User Role:</strong> {userData?.userRole}
            </p>
            <p>
              <strong>Member Since:</strong> {memberSince}
            </p>
            <p>
              <strong>Cats Owned:</strong> {catCount}
            </p>
            <p>
              <strong>Yarn:</strong> {userData?.yarn}
            </p>
          </div>
        </div>
        <div className="w-full md:w-2/3">
          <div className="p-6 rounded-lg shadow-lg mb-6 bg-color_2">
            <h1 className="text-2xl font-semibold mb-2">
              Hi {userData?.username}
            </h1>
            <p>
              <strong>Bio:</strong> {userData?.bio}
            </p>
          </div>

          <div className="space-x-0 space-y-4 md:space-y-4 md:space-x-4">
            <button
              onClick={() => openModal("password")}
              className="px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
            >
              Change Password
            </button>
            <button
              onClick={() => openModal("bio")}
              className="px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
            >
              Change Bio
            </button>
            <button
              onClick={() => openModal("username")}
              className="px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
            >
              Change Username
            </button>
          </div>
        </div>

        {modal.isOpen && (
          <div className="fixed inset-0 flex justify-center items-center">
            <div className="bg-color_2 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h2 className="text-xl font-semibold mb-4 capitalize">
                Change {modal.type}
              </h2>
              {modal.type === "password" ? (
                <>
                  <input
                    type="password"
                    name="password"
                    placeholder="New Password"
                    value={modalInput.password}
                    onChange={handleInputChange}
                    className="w-full mb-3 p-2 border rounded"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={modalInput.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full mb-3 p-2 border rounded"
                  />
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setModal({ type: "", isOpen: false })}
                      className=" m-1 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      className="m-1 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : modal.type === "username" ? (
                <>
                  <input
                    type="text"
                    name="username"
                    placeholder="New Username"
                    value={modalInput.username}
                    onChange={handleInputChange}
                    className="w-full mb-3 p-2 border rounded"
                  />
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setModal({ type: "", isOpen: false })}
                      className="m-1 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUsernameChange}
                      className="m-1 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <textarea
                    name="bio"
                    placeholder="New Bio"
                    value={modalInput.bio}
                    onChange={handleInputChange}
                    className="w-full mb-3 p-2 border rounded"
                  ></textarea>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setModal({ type: "", isOpen: false })}
                      className="m-1 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBioChange}
                      className="m-1 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {successModal.isOpen && (
          <div className="fixed inset-0 flex justify-center items-center">
            <div className="bg-color_2 p-6 rounded-lg shadow-lg max-w-md border-2 border-color_3 justify-items-center">
              <h2 className="text-xl font-semibold mb-4">Update Status</h2>
              <p>{successModal.message}</p>
              <button
                onClick={() => setSuccessModal({ isOpen: false, message: "" })}
                className="mt-3 m-2 px-4 py-2 bg-color_3 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
