import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const auth = useAuth();
    const navigate = useNavigate();

 const signOutRedirect = () => {
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }
  // if (auth.isAuthenticated) {
  //   // Redirect to home page or any other page after successful authentication
  //   navigate("/");
  //   return null; // Prevent rendering the signup buttons
  // }

  return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
}

export default Signup;