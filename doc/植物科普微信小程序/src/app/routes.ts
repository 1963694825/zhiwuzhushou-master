import { createBrowserRouter } from "react-router";
import Root from "@/app/pages/Root";
import Home from "@/app/pages/Home";
import Shop from "@/app/pages/Shop";
import Knowledge from "@/app/pages/Knowledge";
import Profile from "@/app/pages/Profile";
import SearchResult from "@/app/pages/SearchResult";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "knowledge", Component: Knowledge },
      { path: "profile", Component: Profile },
      { path: "search", Component: SearchResult },
    ],
  },
]);
