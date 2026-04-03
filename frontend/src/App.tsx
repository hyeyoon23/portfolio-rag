import { BrowserRouter, Route, Routes } from "react-router-dom";
import BlogDetailPage from "./pages/BlogDetailPage";
import BlogPage from "./pages/BlogPage";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
