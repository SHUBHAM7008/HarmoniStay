import axios from "axios";

const BASE_URL = "http://localhost:8888/api/flats";

// Fetch all flats
export const getFlats = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching flats:", error);
    throw error;
  }
};

// Create a new flat
export const addFlat = async (flat) => {
  try {
    const response = await axios.post(BASE_URL, flat);
    return response.data;
  } catch (error) {
    console.error("Error creating flat:", error);
    throw error;
  }
};

// Assign flat to a member (owner or tenant)
export const assignFlat = async (flatId, memberId, role = "owner", remarks = "") => {
  try {
    const payload = {
      flatId,
      memberId,
      role,      // "owner" or "tenant"
      remarks,   // optional
    };
    const response = await axios.post(`${BASE_URL}/assign`, payload);
    return response.data;
  } catch (error) {
    console.error("Error assigning flat:", error);
    throw error;
  }
};

// Fetch all members for dropdowns
export const getMembers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/members`);
    return response.data;
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
};
