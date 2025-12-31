import api from "../services/api";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get("/posts").then(res => setPosts(res.data));
  }, []);

  return (
    <div>
      <h2>Your Posts</h2>
      {posts.map(p => <p key={p._id}>{p.title}</p>)}
    </div>
  );
}
