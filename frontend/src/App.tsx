import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import BlogDetailPage from "./pages/BlogDetailPage";
import BlogPage from "./pages/BlogPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import MainPage from "./pages/MainPage";
import GuestbookPage from "./pages/GuestbookPage";

// 예전 /blog 링크로 들어와도 /posts로 이동
function LegacyPostRedirect() {
  const { id } = useParams();
  return <Navigate to={`/posts/${id}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<MainPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/guestbook" element={<GuestbookPage />} />
        <Route path="/posts" element={<BlogPage />} />
        <Route path="/posts/:id" element={<BlogDetailPage />} />
        <Route path="/blog" element={<Navigate to="/posts" replace />} />
        <Route path="/blog/:id" element={<LegacyPostRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
