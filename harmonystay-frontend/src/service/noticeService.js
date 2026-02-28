import axios from "axios";

const API_URL = "http://localhost:8888/api/notices";

export const getNotices = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const addNotice = async (notice) => {
  const res = await axios.post(API_URL, notice);
  return res.data;
};

export const deleteNotice = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
