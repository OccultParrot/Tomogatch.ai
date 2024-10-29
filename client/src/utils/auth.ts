import { JwtPayload as DefaultJwtPayload, jwtDecode } from "jwt-decode";

// Extend the default JwtPayload to include custom fields like username and id
interface CustomJwtPayload extends DefaultJwtPayload {
  username: string;
  id: number;
}

class AuthService {
  getProfile() {
    const token = this.getToken();
    if (!token) throw new Error("No token found");

    // Decode the token with the extended type
    const decoded: CustomJwtPayload = jwtDecode<CustomJwtPayload>(token);
    return decoded;
  }

  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string) {
    const decoded: CustomJwtPayload = jwtDecode<CustomJwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp ? decoded.exp < currentTime : false;
  }

  getToken(): string {
    return localStorage.getItem("id_token") || "";
  }

  login(token: string) {
    localStorage.setItem("id_token", token);
  }

  logout() {
    localStorage.removeItem("id_token");
  }
}

export default new AuthService();
