import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import HomeLayout from "./layouts/HomeLayout";

// Pages
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import NFTDetailsPage from "./pages/NFTDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import CreateNFTPage from "./pages/CreateNFTPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNFTs from "./pages/admin/AdminNFTs";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFoundPage from "./pages/NotFoundPage";

// Blog Pages
import FeedPage from "./pages/blog/FeedPage";
import PostDetailPage from "./pages/blog/PostDetailPage";
import EnhancedPostPage from "./pages/blog/EnhancedPostPage";
import UserProfilePage from "./pages/blog/UserProfilePage";
import MyPostsPage from "./pages/blog/MyPostsPage";
import TestPage from "./pages/blog/TestPage";

// Contexts
import { BlogProvider } from "./contexts/BlogContext";

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <BlogProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Home Layout (no footer) */}
            <Route path="/" element={<HomeLayout />}>
              <Route index element={<HomePage />} />
            </Route>

            {/* Main Layout Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route path="explore" element={<ExplorePage />} />
              <Route path="nft/:id" element={<NFTDetailsPage />} />
              <Route path="profile/:address" element={<ProfilePage />} />
              <Route path="create" element={<CreateNFTPage />} />

              {/* Blog Routes */}
              <Route path="blog" element={<FeedPage />} />
              <Route path="blog/post/:id" element={<EnhancedPostPage />} />
              <Route path="blog/user/:userId" element={<UserProfilePage />} />
              <Route path="blog/my-posts" element={<MyPostsPage />} />
              <Route path="blog/test" element={<TestPage />} />
            </Route>

            {/* Admin Layout Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="nfts" element={<AdminNFTs />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </BlogProvider>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1a1a2e",
            color: "#fff",
            borderRadius: "10px",
            padding: "16px",
          },
          duration: 5000,
        }}
      />
    </>
  );
}

export default App;
