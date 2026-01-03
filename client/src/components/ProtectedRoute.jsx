import { Navigate } from "react-router-dom";
import { getAccessToken } from "../utils/tokenService";

export const ProtectedRoute = ({children}) => {
    const token = getAccessToken();

    if (!token){
        return <Navigate to="/" replace />;
    }
    return children
}