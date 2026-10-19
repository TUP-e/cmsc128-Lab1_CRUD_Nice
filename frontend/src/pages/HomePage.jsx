import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TodoApp from "../TodoApp";

function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <div className="home-layout">
        <div className="home-main">
          <TodoApp />
        </div>

        <aside className="app home-sidebar">
          <h1>Hello, {user.display_name}</h1>
          <p className="home-subtext">{user.email}</p>

          <div className="home-actions">
            <Link to="/profile">Profile</Link>
            <button type="button" onClick={logout}>Log Out</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default HomePage;