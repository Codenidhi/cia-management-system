// Central API config — all fetch/axios calls import from here
// Set REACT_APP_API_URL in Render environment variables as:
//   https://cia-backend-fvn3.onrender.com
const API_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : "https://cia-backend-fvn3.onrender.com/api";

export default API_URL;