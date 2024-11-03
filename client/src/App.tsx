import { Outlet, Route, Routes } from "react-router-dom";
import NavBar from "./components/navBar";

import "/src/index.css";
import Landing from "./pages/Landing.tsx";
import Home from "./pages/Home.tsx";
import Signup from "./pages/signup.tsx";
import Login from "./pages/Login.tsx";
import Chat from "./pages/Chat.tsx";
import Error from "./pages/Error.tsx";
import Profile from "./pages/Profile.tsx";
import Cat from "./pages/Cat.tsx";
import { NookProvider } from "./context/NookContext.tsx";
import { CatProvider } from "./context/CatContext.tsx";
import { LoggedInProvider } from "./context/LoggedInContext.tsx";

import { UserProvider } from "./context/UserContext.tsx";

function Layout() {
  return (
    <LoggedInProvider>
      <NookProvider>
        <CatProvider>
          <div className="flex flex-col bg-gray-800 lg:overflow-hidden lg:h-screen">
            <header className="flex-shrink-0">
              <NavBar />
            </header>
            <main className="flex-grow lg:overflow-hidden">
              {" "}
              <Outlet />
            </main>
          </div>
        </CatProvider>
      </NookProvider>
    </LoggedInProvider>
  );
}

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Chat" element={<Chat />} />
          <Route path="/home" element={<Home />} />{" "}
          {/* Page that shows all your cats */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/:catName" element={<Cat />} />
          <Route path="" element={<Error />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;
