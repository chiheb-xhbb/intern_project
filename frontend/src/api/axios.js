import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/api", // adapte si ton backend tourne ailleurs
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default instance;
