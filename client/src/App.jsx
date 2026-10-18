import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Help from "./pages/Help.jsx";
import Breathe from "./pages/Breathe.jsx";
import Resources from "./pages/Resources.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Mood from "./pages/Mood.jsx";
import Journal from "./pages/Journal.jsx";
import JournalEditor from "./pages/JournalEditor.jsx";
import Assessments from "./pages/Assessments.jsx";
import AssessmentTake from "./pages/AssessmentTake.jsx";
import Community from "./pages/Community.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import NewPost from "./pages/NewPost.jsx";
import Helpers from "./pages/Helpers.jsx";
import HelperProfile from "./pages/HelperProfile.jsx";
import Chats from "./pages/Chats.jsx";
import Chat from "./pages/Chat.jsx";
import AiChat from "./pages/AiChat.jsx";
import Privacy from "./pages/Privacy.jsx";
import Profile from "./pages/Profile.jsx";
import HelperApply from "./pages/HelperApply.jsx";
import NotFound from "./pages/NotFound.jsx";

import AdminHome from "./pages/admin/AdminHome.jsx";
import AdminHelpers from "./pages/admin/AdminHelpers.jsx";
import AdminResources from "./pages/admin/AdminResources.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/help" element={<Help />} />
        <Route path="/breathe" element={<Breathe />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/privacy" element={<Privacy />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/new" element={<JournalEditor />} />
          <Route path="/journal/:id" element={<JournalEditor />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/assessments/:type" element={<AssessmentTake />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/new" element={<NewPost />} />
          <Route path="/community/:id" element={<PostDetail />} />
          <Route path="/helpers" element={<Helpers />} />
          <Route path="/helpers/:id" element={<HelperProfile />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chats/:id" element={<Chat />} />
          <Route path="/ai" element={<AiChat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/helper/apply" element={<HelperApply />} />
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/helpers" element={<AdminHelpers />} />
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
